import { supabase } from './supabase';

// Maps between the DB row (snake_case) and the app's profile shape (camelCase).
function toApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    goal: row.goal,
    name: row.name,
    role: row.role,
    location: row.location,
    commitment: row.commitment,
    ideaStatus: row.idea_status,
    lookingFor: row.looking_for,
    skills: row.skills || [],
    bio: row.bio,
    photoUri: row.photo_url,
    school: row.school,
    eduStatus: row.edu_status,
    gradYear: row.grad_year,
  };
}

function fromApp(p) {
  return {
    goal: p.goal ?? null,
    name: p.name ?? null,
    role: p.role ?? null,
    location: p.location ?? null,
    commitment: p.commitment ?? null,
    idea_status: p.ideaStatus ?? null,
    looking_for: p.lookingFor ?? null,
    skills: p.skills ?? [],
    bio: p.bio ?? null,
    photo_url: p.photoUri ?? null,
    school: p.school ?? null,
    edu_status: p.eduStatus ?? null,
    grad_year: p.gradYear ?? null,
    updated_at: new Date().toISOString(),
  };
}

// Fetch the signed-in user's profile row (auto-created on signup via trigger).
export async function fetchMyProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('fetchMyProfile failed:', error.message);
    return null;
  }
  return toApp(data);
}

// Create/update the signed-in user's profile.
export async function saveMyProfile(userId, profile) {
  const payload = { id: userId, ...fromApp(profile) };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload)
    .select()
    .maybeSingle();
  if (error) {
    console.warn('saveMyProfile failed:', error.message);
    throw error;
  }
  return toApp(data);
}

// Clear the profile's content (keeps the row) so onboarding runs again.
export async function clearMyProfile(userId) {
  return saveMyProfile(userId, {});
}

// A profile is "complete" once the essentials from onboarding are filled in.
export function isProfileComplete(p) {
  return !!(p && p.name && p.goal);
}

// ---------------------------------------------------------------------------
// Swipe deck: real users you haven't swiped on yet.
// ---------------------------------------------------------------------------
export async function fetchCandidates(userId, excludeIds = []) {
  const { data: swipeRows } = await supabase
    .from('swipes')
    .select('swipee')
    .eq('swiper', userId);
  const swiped = new Set((swipeRows || []).map((s) => s.swipee));
  const excl = new Set(excludeIds);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', userId)
    .not('name', 'is', null);
  if (error) {
    console.warn('fetchCandidates failed:', error.message);
    return [];
  }
  return (data || [])
    .filter((r) => !swiped.has(r.id) && !excl.has(r.id))
    .map(toApp);
}

// Record a swipe. On a reciprocated right-swipe a match row already exists
// (created by the DB trigger) — return it so we can celebrate + open chat.
export async function recordSwipeRemote(swiperId, swipeeId, direction) {
  const { error } = await supabase
    .from('swipes')
    .upsert(
      { swiper: swiperId, swipee: swipeeId, direction },
      { onConflict: 'swiper,swipee' }
    );
  if (error) {
    console.warn('recordSwipe failed:', error.message);
    return null;
  }
  if (direction !== 'right') return null;

  const { data: m } = await supabase
    .from('matches')
    .select('id')
    .or(
      `and(user_a.eq.${swiperId},user_b.eq.${swipeeId}),and(user_a.eq.${swipeeId},user_b.eq.${swiperId})`
    )
    .maybeSingle();
  if (!m) return null;

  const { data: prof } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', swipeeId)
    .maybeSingle();
  return prof ? { matchId: m.id, profile: toApp(prof) } : null;
}

// ---------------------------------------------------------------------------
// Matches + chat.
// ---------------------------------------------------------------------------
export async function fetchMatches(userId) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchMatches failed:', error.message);
    return [];
  }
  const rows = data || [];
  const otherIds = rows.map((r) => (r.user_a === userId ? r.user_b : r.user_a));
  if (!otherIds.length) return [];

  const { data: profs } = await supabase
    .from('profiles')
    .select('*')
    .in('id', otherIds);
  const byId = {};
  (profs || []).forEach((p) => {
    byId[p.id] = toApp(p);
  });

  return rows
    .map((r) => {
      const otherId = r.user_a === userId ? r.user_b : r.user_a;
      return { matchId: r.id, profile: byId[otherId], createdAt: r.created_at };
    })
    .filter((x) => x.profile);
}

// Matches plus each conversation's most recent message (for previews/unread).
export async function fetchMatchesWithPreview(userId) {
  const matches = await fetchMatches(userId);
  const ids = matches.map((m) => m.matchId);
  if (!ids.length) return matches.map((m) => ({ ...m, lastMessage: null }));

  const { data } = await supabase
    .from('messages')
    .select('*')
    .in('match_id', ids)
    .order('created_at', { ascending: false });

  const lastByMatch = {};
  (data || []).forEach((msg) => {
    if (!lastByMatch[msg.match_id]) lastByMatch[msg.match_id] = msg;
  });

  return matches
    .map((m) => ({ ...m, lastMessage: lastByMatch[m.matchId] || null }))
    .sort((a, b) => {
      const ta = a.lastMessage?.created_at || a.createdAt || '';
      const tb = b.lastMessage?.created_at || b.createdAt || '';
      return tb.localeCompare(ta);
    });
}

export async function fetchMessages(matchId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('fetchMessages failed:', error.message);
    return [];
  }
  return data || [];
}

export async function sendMessage(matchId, senderId, body) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender: senderId, body })
    .select()
    .maybeSingle();
  if (error) {
    console.warn('sendMessage failed:', error.message);
    throw error;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Meetings (scheduling).
// ---------------------------------------------------------------------------
export async function getLatestMeeting(matchId) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn('getLatestMeeting failed:', error.message);
    return null;
  }
  return data;
}

export async function createMeeting(matchId, proposer, recipient, payload) {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      match_id: matchId,
      proposer,
      recipient,
      slots: payload.slots,
      call_type: payload.callType,
      duration: payload.duration,
      note: payload.note,
      status: 'proposed',
    })
    .select()
    .maybeSingle();
  if (error) {
    console.warn('createMeeting failed:', error.message);
    throw error;
  }
  return data;
}

export async function confirmMeeting(id, slot) {
  const { data, error } = await supabase
    .from('meetings')
    .update({ status: 'confirmed', confirmed_slot: slot })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) {
    console.warn('confirmMeeting failed:', error.message);
    throw error;
  }
  return data;
}

// Realtime: invoke onInsert(messageRow) when a new message lands for a match.
export function subscribeToMessages(matchId, onInsert) {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return channel;
}

// Realtime: invoke onChange() on any meeting insert/update for a match, so
// both people see proposals and confirmations live.
export function subscribeToMeetings(matchId, onChange) {
  const channel = supabase
    .channel(`meetings:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'meetings',
        filter: `match_id=eq.${matchId}`,
      },
      () => onChange()
    )
    .subscribe();
  return channel;
}
