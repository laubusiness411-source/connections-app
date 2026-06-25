// Matches a posted need ("I need my lawn mowed") to local service providers.
// Filters by category and ranks by keyword overlap with the description.

import { PROVIDERS } from './providers';

export const NEED_CATEGORIES = [
  'Yard & Outdoor',
  'Home Repair',
  'Cleaning',
  'Moving & Errands',
  'Marketing',
  'Design',
  'Web & Tech',
  'Tutoring',
];

const STOPWORDS = new Set([
  'i', 'a', 'an', 'the', 'my', 'me', 'need', 'want', 'someone', 'to', 'for',
  'and', 'with', 'on', 'in', 'of', 'this', 'that', 'some', 'help', 'please',
  'looking', 'get', 'have', 'do', 'done', 'can', 'you', 'who',
]);

function tokens(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function scoreProvider(words, p) {
  const hay = [
    p.title,
    p.bio,
    ...(p.services || []),
  ]
    .join(' ')
    .toLowerCase();
  let score = 0;
  for (const w of words) {
    if (hay.includes(w)) score += 2;
  }
  // Lightly reward rating/experience as a tie-breaker.
  score += (p.rating || 0) * 0.1;
  return score;
}

// Returns providers for a category (or all), ranked by how well they fit the
// description text.
export function matchProviders(category, text) {
  const words = tokens(text);
  let pool = PROVIDERS;
  if (category) pool = pool.filter((p) => p.category === category);

  return [...pool]
    .map((p) => ({ provider: p, score: scoreProvider(words, p) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.provider);
}
