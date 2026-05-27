import test from 'node:test';
import assert from 'node:assert/strict';
import { eligibleBadgesForSkill } from '../services/badgeService.js';

test('eligibleBadgesForSkill assigns badges at configured thresholds', () => {
  assert.deepEqual(eligibleBadgesForSkill('React', 2), []);
  assert.deepEqual(
    eligibleBadgesForSkill('React', 6).map((badge) => badge.title),
    ['Competencia validada en React', 'Especialista en React']
  );
});
