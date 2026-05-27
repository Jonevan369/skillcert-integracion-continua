import { db } from '../db/database.js';

export const BADGE_THRESHOLDS = [
  { min: 3, label: 'Competencia validada' },
  { min: 6, label: 'Especialista' },
  { min: 10, label: 'Experto' }
];

export function badgeTitleForSkill(label, skillName) {
  return `${label} en ${skillName}`;
}

export function eligibleBadgesForSkill(skillName, validationScore) {
  return BADGE_THRESHOLDS.filter((threshold) => validationScore >= threshold.min).map((threshold) => ({
    skillName,
    title: badgeTitleForSkill(threshold.label, skillName),
    threshold: threshold.min
  }));
}

export function refreshBadgesForUser(userId) {
  const rows = db
    .prepare(
      `SELECT competence_suggestions.name AS skill_name,
              COALESCE(SUM(votes.weighted_value), 0) AS validation_score
       FROM evidences
       JOIN competence_suggestions ON competence_suggestions.evidence_id = evidences.id
       LEFT JOIN votes ON votes.evidence_id = evidences.id
       WHERE evidences.author_id = ?
       GROUP BY competence_suggestions.name`
    )
    .all(userId);

  const insert = db.prepare(
    `INSERT OR IGNORE INTO user_badges (user_id, skill_name, title, threshold)
     VALUES (?, ?, ?, ?)`
  );

  for (const row of rows) {
    for (const badge of eligibleBadgesForSkill(row.skill_name, Number(row.validation_score))) {
      insert.run(userId, badge.skillName, badge.title, badge.threshold);
    }
  }

  return listBadges(userId);
}

export function listBadges(userId) {
  return db
    .prepare(
      `SELECT id, user_id AS userId, skill_name AS skillName, title, threshold,
              issued_at AS issuedAt, minted_hash AS mintedHash
       FROM user_badges
       WHERE user_id = ?
       ORDER BY threshold DESC, issued_at DESC`
    )
    .all(userId);
}
