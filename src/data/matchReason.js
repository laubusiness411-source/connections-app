// Generates a short, natural-language reason two people matched, based on the
// overlap/complementarity of their profiles.
//
// This is a local stand-in for an LLM call: it reads like an AI-written line
// but runs instantly, offline, and free. When the backend lands, swap the body
// of generateMatchReason() for a real Claude API call (server-side, so the key
// stays secret) — the call sites and UI won't need to change.

// Does `role` satisfy what someone `lookingFor`?
function roleSatisfies(role, lookingFor) {
  if (!role || !lookingFor) return false;
  if (lookingFor === 'Any great partner') return true;
  const map = {
    'Technical partner': ['Technical Co-Founder'],
    'Engineering partner': ['Technical Co-Founder'],
    'Business / GTM partner': ['Business Co-Founder', 'Growth + Marketing'],
    'Design / Product partner': ['Design + Product'],
  };
  return (map[lookingFor] || []).includes(role);
}

function sharedSkills(me, them) {
  const mine = new Set((me?.skills || []).map((s) => s.toLowerCase()));
  return (them?.skills || []).filter((s) => mine.has(s.toLowerCase()));
}

function firstName(p) {
  return p?.name ? p.name.split(' ')[0] : 'them';
}

// Returns a single sentence like:
// "You matched with Maya because she's looking for exactly what you bring —
//  a technical partner — and you're both going full-time."
export function generateMatchReason(me, them) {
  const name = firstName(them);
  if (!me) {
    return `You matched with ${name} — you both want to connect and build something.`;
  }

  const theyWantMe = roleSatisfies(me.role, them.lookingFor);
  const iWantThem = roleSatisfies(them.role, me.lookingFor);
  const skills = sharedSkills(me, them);
  const sameCommitment =
    me.commitment && them.commitment && me.commitment === them.commitment;
  const bothRemote =
    me.location?.toLowerCase() === 'remote' &&
    them.location?.toLowerCase() === 'remote';
  const sameCity =
    me.location &&
    them.location &&
    me.location.toLowerCase() === them.location.toLowerCase() &&
    !bothRemote;

  // Pick the strongest primary reason.
  let primary;
  if (theyWantMe && iWantThem) {
    primary = `you're exactly what each other is looking for — you bring ${me.role.toLowerCase()} chops, ${name} brings the ${them.role.toLowerCase()} side`;
  } else if (theyWantMe) {
    primary = `${name} is looking for a ${them.lookingFor.toLowerCase()} — exactly what you bring as a ${me.role.toLowerCase()}`;
  } else if (iWantThem) {
    primary = `${name} is the ${me.lookingFor.toLowerCase()} you've been after`;
  } else if (skills.length) {
    primary = `you share a background in ${listify(skills)}`;
  } else {
    primary = `you're both serious about finding the right co-founder`;
  }

  // Add at most one supporting reason for texture (skip if already used).
  const supports = [];
  if (!(skills.length && primary.includes('background in')) && skills.length) {
    supports.push(`a shared edge in ${listify(skills)}`);
  }
  if (sameCommitment) {
    supports.push(`you're both going ${me.commitment.toLowerCase()}`);
  } else if (bothRemote) {
    supports.push(`you're both remote-first`);
  } else if (sameCity) {
    supports.push(`you're both in ${them.location}`);
  }

  const support = supports[0];
  return support
    ? `You matched with ${name} because ${primary} — plus ${support}.`
    : `You matched with ${name} because ${primary}.`;
}

function listify(arr) {
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;
}
