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
