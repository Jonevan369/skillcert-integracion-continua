import { z } from 'zod';
import { db, mapEvidence } from '../db/database.js';
import { suggestCompetences } from '../services/ai.js';

const evidenceSchema = z.object({
  authorId: z.coerce.number().int().positive(),
  title: z.string().min(4).max(120),
  body: z.string().min(20).max(4000)
});

const voteSchema = z.object({
  userId: z.coerce.number().int().positive(),
  value: z.number().int().refine((value) => value === 1 || value === -1),
  comment: z.string().max(300).optional()
});

export async function listEvidences(req, res, next) {
  try {
    const rows = db
      .prepare(
        `SELECT evidences.*, users.name AS author_name, users.email AS author_email
         FROM evidences
         JOIN users ON users.id = evidences.author_id
         ORDER BY evidences.created_at DESC`
      )
      .all();
    res.json(rows.map(mapEvidence));
  } catch (error) {
    next(error);
  }
}

export async function createEvidence(req, res, next) {
  try {
    const payload = evidenceSchema.parse(req.body);
    const suggestions = await suggestCompetences(payload);
    const create = db.transaction(() => {
      const evidenceId = db
        .prepare('INSERT INTO evidences (title, body, author_id) VALUES (?, ?, ?)')
        .run(payload.title, payload.body, payload.authorId).lastInsertRowid;
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
    res.status(201).json(getEvidenceById(evidenceId));
  } catch (error) {
    next(error);
  }
}

export async function voteEvidence(req, res, next) {
  try {
    const evidenceId = Number(req.params.id);
    const payload = voteSchema.parse(req.body);
    db.prepare(
      `INSERT INTO votes (evidence_id, user_id, value, comment)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(evidence_id, user_id)
       DO UPDATE SET value = excluded.value, comment = excluded.comment`
    ).run(evidenceId, payload.userId, payload.value, payload.comment ?? null);
    res.json(getEvidenceById(evidenceId));
  } catch (error) {
    next(error);
  }
}

function getEvidenceById(evidenceId) {
  const row = db
    .prepare(
      `SELECT evidences.*, users.name AS author_name, users.email AS author_email
       FROM evidences
       JOIN users ON users.id = evidences.author_id
       WHERE evidences.id = ?`
    )
    .get(evidenceId);

  if (!row) {
    const error = new Error('Evidencia no encontrada');
    error.status = 404;
    throw error;
  }

  return mapEvidence(row);
}
