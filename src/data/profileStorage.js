// Local persistence for the current user's own profile.
// Backed by AsyncStorage now; swap for a backend call when auth lands.

import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@cofounder/myProfile';

// Load the saved profile, or null if onboarding hasn't been completed.
export async function loadProfile() {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Failed to load profile:', e);
    return null;
  }
}

// Persist the user's profile. Returns true on success.
export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.warn('Failed to save profile:', e);
    return false;
  }
}

// Wipe the saved profile (useful for "log out" / re-onboarding during dev).
export async function clearProfile() {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
    return true;
  } catch (e) {
    console.warn('Failed to clear profile:', e);
    return false;
  }
}
