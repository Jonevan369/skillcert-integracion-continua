import { db } from '../db/database.js';

const LEVEL_WEIGHT = {
  principiante: 1,
  intermedio: 2,
  avanzado: 3
};

export async function getCompetenceMap(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const rows = db
      .prepare(
        `SELECT competence_suggestions.name, competence_suggestions.level, competence_suggestions.confidence,
                evidences.id AS evidence_id, COALESCE(SUM(votes.value), 0) AS vote_score
         FROM evidences
         JOIN competence_suggestions ON competence_suggestions.evidence_id = evidences.id
         LEFT JOIN votes ON votes.evidence_id = evidences.id
         WHERE evidences.author_id = ?
         GROUP BY competence_suggestions.id
         ORDER BY competence_suggestions.name ASC`
      )
      .all(userId);

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
        strength: Math.max(8, Math.round(avgLevel * 22 + item.validations * 8 + item.evidenceCount * 5))
      };
    });

    res.json({ userId, competences });
  } catch (error) {
    next(error);
  }
}
