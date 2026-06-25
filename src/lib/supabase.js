import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY, PERSIST_SESSION } from './supabaseConfig';

// Single shared Supabase client. When PERSIST_SESSION is true the session is
// stored in AsyncStorage and survives restarts; when false, every reload
// starts logged out (useful for testing the auth flow).
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: PERSIST_SESSION,
    detectSessionInUrl: false,
  },
});
