import { db } from '../db/database.js';
import { listBadges, refreshBadgesForUser } from './badgeService.js';
import { getCompetenceMapForUser } from '../controllers/skillController.js';

export function buildProfileExport(userId) {
  refreshBadgesForUser(userId);
  const user = db
    .prepare('SELECT id, name, email, headline, bio, karma, created_at AS createdAt FROM users WHERE id = ?')
    .get(userId);
  const evidences = db.prepare('SELECT * FROM evidences WHERE author_id = ? ORDER BY created_at DESC').all(userId);
  const evidenceIds = evidences.map((evidence) => evidence.id);
  const suggestions = evidenceIds.length
    ? db
        .prepare(
          `SELECT * FROM competence_suggestions
           WHERE evidence_id IN (${evidenceIds.map(() => '?').join(',')})
           ORDER BY created_at DESC`
        )
        .all(...evidenceIds)
    : [];
  const validations = evidenceIds.length
    ? db
        .prepare(
          `SELECT * FROM votes
           WHERE evidence_id IN (${evidenceIds.map(() => '?').join(',')})
           ORDER BY created_at DESC`
        )
        .all(...evidenceIds)
    : [];

  return {
    exportedAt: new Date().toISOString(),
    user,
    competences: getCompetenceMapForUser(userId).competences,
    badges: listBadges(userId),
    evidences,
    suggestions,
    validations
  };
}
