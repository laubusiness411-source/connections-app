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

// A plausible, deterministic "match %" from overlap signals (72–99).
export function computeMatchPercent(me, them) {
  if (!me || !them) return 82;
  let s = 60;
  const mine = new Set((me.skills || []).map((x) => x.toLowerCase()));
  const shared = (them.skills || []).filter((x) => mine.has(x.toLowerCase())).length;
  s += shared * 7;
  if (me.location && me.location === them.location) s += 6;
  if (me.commitment && me.commitment === them.commitment) s += 5;
  if (me.school && me.school === them.school) s += 8;
  if (me.ideaStatus && me.ideaStatus === them.ideaStatus) s += 4;
  if (me.lookingFor && them.role && me.lookingFor.toLowerCase().includes(them.role.split(' ')[0].toLowerCase())) s += 6;
  return Math.max(72, Math.min(99, s));
}
