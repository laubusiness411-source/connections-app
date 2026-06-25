// Supabase public client credentials.
// These are the PUBLIC client keys — safe to ship in the app. Row-Level
// Security (see supabase/schema.sql) is what actually protects user data.
// Never put the service_role / secret key in here.

export const SUPABASE_URL = 'https://dwsmfvtbltzhmzthwjuk.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_275bDRTTQ7vy9n45CNOG0g_JGbjIkRo';

// DEV TOGGLE: keep the user logged in across app reloads/restarts.
// false = always start on the login screen (handy while testing).
// true  = remember the session (what you want for the real app).
export const PERSIST_SESSION = false;
