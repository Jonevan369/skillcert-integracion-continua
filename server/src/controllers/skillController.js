import { db } from '../db/database.js';

const LEVEL_WEIGHT = {
  principiante: 1,
  intermedio: 2,
  avanzado: 3
};

export function getCompetenceMapForUser(userId, filters = {}) {
  const params = [userId];
  const where = ['evidences.author_id = ?'];
  if (filters.name) {
    where.push('lower(competence_suggestions.name) LIKE ?');
    params.push(`%${String(filters.name).toLowerCase()}%`);
  }
  if (filters.level && filters.level !== 'todos') {
    where.push('competence_suggestions.level = ?');
    params.push(filters.level);
  }

  const rows = db
    .prepare(
      `SELECT competence_suggestions.name, competence_suggestions.level, competence_suggestions.confidence,
              evidences.id AS evidence_id, evidences.created_at,
              COALESCE(SUM(votes.weighted_value), 0) AS vote_score
       FROM evidences
       JOIN competence_suggestions ON competence_suggestions.evidence_id = evidences.id
       LEFT JOIN votes ON votes.evidence_id = evidences.id
       WHERE ${where.join(' AND ')}
       GROUP BY competence_suggestions.id
       ORDER BY competence_suggestions.name ASC`
    )
    .all(...params);

  const aggregate = new Map();
  for (const row of rows) {
    const current = aggregate.get(row.name) ?? {
      name: row.name,
      levelWeight: 0,
      confidence: 0,
      validations: 0,
      evidenceCount: 0
    };
    current.levelWeight += LEVEL_WEIGHT[row.level] ?? 1;
    current.confidence += row.confidence;
    current.validations += row.vote_score;
    current.evidenceCount += 1;
    aggregate.set(row.name, current);
  }

  const competences = [...aggregate.values()].map((item) => {
    const avgLevel = item.levelWeight / item.evidenceCount;
    return {
      ...item,
      level: avgLevel >= 2.5 ? 'avanzado' : avgLevel >= 1.5 ? 'intermedio' : 'principiante',
      confidence: Number((item.confidence / item.evidenceCount).toFixed(2)),
      validations: Number(item.validations.toFixed(2)),
      strength: Math.max(8, Math.round(avgLevel * 22 + item.validations * 8 + item.evidenceCount * 5))
    };
  });

  return { userId, competences };
}

export function getCompetenceMap(req, res, next) {
  try {
    res.json(getCompetenceMapForUser(Number(req.params.userId), req.query));
  } catch (error) {
    next(error);
  }
}

export function getTrends(req, res, next) {
  try {
    const rows = db
      .prepare(
        `SELECT competence_suggestions.name,
                COUNT(DISTINCT evidences.id) AS evidenceCount,
                COALESCE(SUM(votes.weighted_value), 0) AS validationScore
         FROM competence_suggestions
         JOIN evidences ON evidences.id = competence_suggestions.evidence_id
         LEFT JOIN votes ON votes.evidence_id = evidences.id
         WHERE datetime(evidences.created_at) >= datetime('now', '-7 days')
         GROUP BY competence_suggestions.name
         ORDER BY validationScore DESC, evidenceCount DESC
         LIMIT 12`
      )
      .all();
    res.json(rows.map((row) => ({ ...row, validationScore: Number(row.validationScore.toFixed(2)) })));
  } catch (error) {
    next(error);
  }
}

export function getSkillProgress(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const skill = String(req.query.skill ?? '').trim();
    const rows = db
      .prepare(
        `SELECT evidences.created_at AS date, competence_suggestions.level, competence_suggestions.confidence,
                COALESCE(SUM(votes.weighted_value), 0) AS validationScore
         FROM evidences
         JOIN competence_suggestions ON competence_suggestions.evidence_id = evidences.id
         LEFT JOIN votes ON votes.evidence_id = evidences.id
         WHERE evidences.author_id = ? AND competence_suggestions.name = ?
         GROUP BY competence_suggestions.id
         ORDER BY evidences.created_at ASC`
      )
      .all(userId, skill);
    res.json(rows.map((row) => ({ ...row, validationScore: Number(row.validationScore.toFixed(2)) })));
  } catch (error) {
    next(error);
  }
}
