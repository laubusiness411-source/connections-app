// Ranks companies by skill fit + peer-review rating + area, then rotates the
// surfaced set each day so the "Top 5" refreshes daily.

import { COMPANIES } from './companies';
import { parseState } from './usStates';

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Whole-day index, so results are stable within a day and change across days.
function dayIndex() {
  return Math.floor(Date.now() / 86400000);
}

export function topCompaniesForUser(me, n = 5) {
  const day = dayIndex();
  const mySkills = new Set((me?.skills || []).map((s) => s.toLowerCase()));
  const myState = parseState(me?.location);

  return COMPANIES.map((c) => {
    const fit = (c.tags || []).filter((t) => mySkills.has(t.toLowerCase())).length;
    const areaBoost = c.remote || (myState && c.state === myState) ? 2 : 0;
    const jitter = hashStr(c.id + ':' + day) % 3; // daily variation
    return { company: c, fit, score: fit * 4 + c.rating + areaBoost + jitter };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
