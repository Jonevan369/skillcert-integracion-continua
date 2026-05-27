import { z } from 'zod';
import { db, evidenceSelectClause, mapEvidence } from '../db/database.js';
import { suggestCompetences } from '../services/ai.js';
import { refreshBadgesForUser } from '../services/badgeService.js';
import { calculateKarmaDelta, voteWeightForKarma } from '../services/karmaService.js';

export const evidenceSchema = z.object({
  title: z.string().min(4).max(120),
  body: z.string().min(20).max(4000),
  communityId: z.coerce.number().int().positive().optional().nullable(),
  authorId: z.coerce.number().int().positive().optional()
});

export const voteSchema = z.object({
  value: z.number().int().refine((value) => value === 1 || value === -1),
  comment: z.string().max(300).optional(),
  userId: z.coerce.number().int().positive().optional()
});

export async function listEvidences(req, res, next) {
  try {
    const rows = db
      .prepare(`${evidenceSelectClause()} ORDER BY evidences.created_at DESC LIMIT 80`)
      .all();
    res.json(rows.map(mapEvidence));
  } catch (error) {
    next(error);
  }
}

export function getFeed(req, res, next) {
  try {
    const rows = db
      .prepare(
        `${evidenceSelectClause(`
          WHERE evidences.author_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
             OR evidences.community_id IN (SELECT community_id FROM community_members WHERE user_id = ?)
             OR evidences.author_id = ?
        `)}
         ORDER BY evidences.created_at DESC
         LIMIT 80`
      )
      .all(req.user.id, req.user.id, req.user.id);
    res.json(rows.map(mapEvidence));
  } catch (error) {
    next(error);
  }
}

export async function createEvidence(req, res, next) {
  try {
    const payload = evidenceSchema.parse(req.body);
    const authorId = req.user?.id ?? payload.authorId;
    if (!authorId) return res.status(401).json({ message: 'Usuario requerido' });

    const suggestions = await suggestCompetences(payload);
    const create = db.transaction(() => {
      const evidenceId = db
        .prepare('INSERT INTO evidences (title, body, author_id, community_id) VALUES (?, ?, ?, ?)')
        .run(payload.title, payload.body, authorId, payload.communityId ?? null).lastInsertRowid;
      const insertSuggestion = db.prepare(
        `INSERT INTO competence_suggestions (evidence_id, name, level, confidence, rationale, source)
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      suggestions.forEach((suggestion) => {
        insertSuggestion.run(
          evidenceId,
          suggestion.name,
          suggestion.level,
          suggestion.confidence,
          suggestion.rationale,
          suggestion.source
        );
      });
      return evidenceId;
    });

    const evidenceId = create();
    refreshBadgesForUser(authorId);
    res.status(201).json(getEvidenceById(evidenceId));
  } catch (error) {
    next(error);
  }
}

export function voteEvidence(req, res, next) {
  try {
    const evidenceId = Number(req.params.id);
    const payload = voteSchema.parse(req.body);
    const userId = req.user?.id ?? payload.userId;
    if (!userId) return res.status(401).json({ message: 'Usuario requerido' });

    const voter = db.prepare('SELECT id, karma FROM users WHERE id = ?').get(userId);
    const weight = voteWeightForKarma(voter?.karma);
    db.prepare(
      `INSERT INTO votes (evidence_id, user_id, value, weight, weighted_value, comment)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(evidence_id, user_id)
       DO UPDATE SET value = excluded.value,
                     weight = excluded.weight,
                     weighted_value = excluded.weighted_value,
                     comment = excluded.comment`
    ).run(evidenceId, userId, payload.value, weight, payload.value * weight, payload.comment ?? null);

    const evidence = getEvidenceById(evidenceId);
    const delta = calculateKarmaDelta({ voterValue: payload.value, evidenceWeightedScore: evidence.weightedScore });
    db.prepare('UPDATE users SET karma = MAX(0, karma + ?) WHERE id = ?').run(delta, userId);
    refreshBadgesForUser(evidence.authorId);

    res.json(getEvidenceById(evidenceId));
  } catch (error) {
    next(error);
  }
}

export function getEvidenceById(evidenceId) {
  const row = db
    .prepare(`${evidenceSelectClause('WHERE evidences.id = ?')}`)
    .get(evidenceId);

  if (!row) {
    const error = new Error('Evidencia no encontrada');
    error.status = 404;
    throw error;
  }

  return mapEvidence(row);
}
