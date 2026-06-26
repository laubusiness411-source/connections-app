// Computes what the current user has in common with another person, for the
// "in common" highlights on a card.
export function computeSimilarities(me, them) {
  if (!me || !them) return [];
  const out = [];

  const mine = new Set((me.skills || []).map((s) => s.toLowerCase()));
  const shared = (them.skills || []).filter((s) => mine.has(s.toLowerCase()));
  if (shared.length) out.push(`Shared: ${shared.slice(0, 3).join(', ')}`);

  const ml = (me.location || '').toLowerCase();
  const tl = (them.location || '').toLowerCase();
  if (ml && ml === tl) {
    out.push(tl === 'remote' ? 'Both remote' : `Both in ${them.location}`);
  }

  if (me.commitment && me.commitment === them.commitment) {
    out.push(`Both ${me.commitment.toLowerCase()}`);
  }

  if (me.school && them.school && me.school === them.school) {
    out.push('Same school');
  }

  if (me.ideaStatus && me.ideaStatus === them.ideaStatus) {
    out.push('Same idea stage');
  }

  return out.slice(0, 3);
}
