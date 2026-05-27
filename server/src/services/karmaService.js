export function voteWeightForKarma(karma = 0) {
  const normalized = Math.max(0, Number(karma) || 0);
  return Number((1 + Math.min(normalized, 100) / 100).toFixed(2));
}

export function calculateKarmaDelta({ voterValue, evidenceWeightedScore }) {
  if (!voterValue || !evidenceWeightedScore) return 0;
  const aligned = Math.sign(voterValue) === Math.sign(evidenceWeightedScore);
  const magnitude = Math.min(Math.abs(evidenceWeightedScore), 5);
  return Number(((aligned ? 1 : -0.5) * magnitude).toFixed(2));
}
