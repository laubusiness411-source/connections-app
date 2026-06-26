// Suggested conversation starters based on what two people have in common.
// Local stand-in for an LLM call (swap for Claude later — same call site).

function first(p) {
  return p?.name ? p.name.split(' ')[0] : 'there';
}

export function generateIcebreakers(me, them) {
  const name = first(them);
  const out = [];

  if (me?.school && them?.school && me.school === them.school) {
    out.push(`${name}! Fellow ${me.school} — small world. What are you working on these days?`);
  }

  const mine = new Set((me?.skills || []).map((s) => s.toLowerCase()));
  const shared = (them?.skills || []).filter((s) => mine.has(s.toLowerCase()));
  if (shared.length) {
    out.push(`Hey ${name}! We're both into ${shared[0]} — what are you building right now?`);
  }

  if (them?.lookingFor && me?.role) {
    out.push(`Hi ${name} — saw you're after a ${them.lookingFor.toLowerCase()}. That's my lane. What's the project?`);
  }

  if (me?.goal) {
    out.push(`Hey ${name}! I'm heads-down on "${me.goal}" this quarter — would love your take.`);
  }

  if (them?.location && them.location.toLowerCase() !== 'remote') {
    out.push(`Hey ${name}! How's ${them.location}? Always good to connect with people nearby.`);
  }

  if (!out.length) {
    out.push(`Hey ${name}! Your profile stood out — what are you focused on these days?`);
  }

  return [...new Set(out)].slice(0, 3);
}
