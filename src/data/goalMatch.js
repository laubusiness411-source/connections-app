// GoalMatch engine: given the user's 90-day goal, rank other people by how
// useful they'd be for hitting it, and explain why.
//
// Local heuristic for now (instant, offline). When the backend lands, this is
// the natural place to call Claude server-side with the goal + candidate pool.

export const GOAL_EXAMPLES = [
  'Find a technical cofounder',
  'Find a business cofounder',
  'Start an AI agency',
  'Land a marketing job',
  'Get my first 10 clients',
  'Raise $50k',
  'Find an internship',
  'Build & launch an MVP',
];

// Intent buckets -> what kind of person helps, and how to phrase it.
const NEEDS = [
  {
    key: 'technical',
    test: /\b(tech|technical|developer|engineer|build|building|mvp|app|software|code|coding|ai|agent|agents|ml|product|prototype|ship)\b/,
    roles: ['Technical Co-Founder', 'Design + Product'],
    skills: ['Full-Stack', 'Backend', 'ML', 'AI', 'DevTools', 'Infra', 'Mobile', 'Data', 'Security', 'Cloud', 'Payments'],
    phrase: (p, sk) =>
      `${p} is deep in ${sk} — exactly the build power to turn your goal into a real product.`,
  },
  {
    key: 'growth',
    test: /\b(market|marketing|growth|ads|client|clients|customer|customers|acqui|brand|content|seo|users|audience|launch|sell)\b/,
    roles: ['Growth + Marketing'],
    skills: ['Growth', 'Content', 'Consumer', 'Paid', 'Lifecycle', 'DTC', 'SEO'],
    phrase: (p, sk) =>
      `${p} has driven real growth (${sk}) — they can help you get in front of the right people fast.`,
  },
  {
    key: 'business',
    test: /\b(business|sales|gtm|bd|deal|deals|revenue|partner|partnership|enterprise|b2b|clients|agency)\b/,
    roles: ['Business Co-Founder'],
    skills: ['Sales', 'Ops', 'BD', 'Strategy', 'Enterprise', 'Partnerships', 'Fundraising'],
    phrase: (p, sk) =>
      `${p} knows the commercial side cold (${sk}) — useful for landing deals and revenue toward your goal.`,
  },
  {
    key: 'fundraising',
    test: /\b(raise|raising|fund|funding|fundrais|invest|investor|capital|seed|angel|\$|money|cash)\b/,
    roles: ['Business Co-Founder'],
    skills: ['Fundraising', 'Strategy'],
    phrase: (p, sk) =>
      `${p} has been through fundraising (${sk}) — exactly who you want in your corner while raising.`,
  },
  {
    key: 'design',
    test: /\b(design|product|ux|ui|brand|prototype)\b/,
    roles: ['Design + Product'],
    skills: ['Product', 'UX/UI', 'Brand', 'Motion'],
    phrase: (p, sk) =>
      `${p} can shape product & design (${sk}) — to make what you build feel sharp and usable.`,
  },
];

function first(p) {
  return p?.name ? p.name.split(' ')[0] : 'They';
}

function listify(arr) {
  if (!arr.length) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} & ${arr[1]}`;
  return `${arr.slice(0, 2).join(', ')} & more`;
}

// Detect which need-buckets a goal implies (always returns at least one).
function detectNeeds(goalLower) {
  const hits = NEEDS.filter((n) => n.test.test(goalLower));
  return hits.length ? hits : NEEDS; // no clear signal -> consider everything
}

function scoreProfile(needs, me, p) {
  let score = 0;
  const matchedSkillsByNeed = {};
  for (const need of needs) {
    if (need.roles.includes(p.role)) score += 3;
    const sk = (p.skills || []).filter((s) => need.skills.includes(s));
    if (sk.length) {
      score += sk.length * 2;
      matchedSkillsByNeed[need.key] = sk;
    }
  }
  // Shared background with the user is a small plus.
  if (me?.skills) {
    const mine = new Set(me.skills.map((s) => s.toLowerCase()));
    score += (p.skills || []).filter((s) => mine.has(s.toLowerCase())).length;
  }
  return { score, matchedSkillsByNeed };
}

function reasonFor(goal, needs, p, matchedSkillsByNeed) {
  const name = first(p);
  // Use the highest-value need this person actually satisfies.
  for (const need of needs) {
    const sk = matchedSkillsByNeed[need.key];
    if (need.roles.includes(p.role) || (sk && sk.length)) {
      const skillsText = listify(sk && sk.length ? sk : p.skills || []);
      return need.phrase(name, skillsText).trim();
    }
  }
  return `${name} brings ${listify(p.skills || [])} — a useful edge for "${goal}".`;
}

// Returns the top N people for a goal, each with a reason. Pure & deterministic.
export function generateGoalMatches(goal, me, profiles, n = 3) {
  const goalLower = (goal || '').toLowerCase();
  const needs = detectNeeds(goalLower);

  const ranked = profiles
    .filter((p) => p.id !== me?.id)
    .map((p) => {
      const { score, matchedSkillsByNeed } = scoreProfile(needs, me, p);
      return { profile: p, score, matchedSkillsByNeed };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ profile, matchedSkillsByNeed }) => ({
      profile,
      reason: reasonFor(goal, needs, profile, matchedSkillsByNeed),
    }));

  return ranked;
}
