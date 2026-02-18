import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const disabledError = { message: 'Supabase is not configured.' };
const disabledQuery = {
  select: () => disabledQuery,
  order: () => disabledQuery,
  single: async () => ({ data: null, error: disabledError }),
  then: (resolve: (value: { data: null; error: typeof disabledError }) => void) =>
    resolve({ data: null, error: disabledError }),
};

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = !supabaseUrl || !supabaseAnonKey
  ? ({
      auth: {
        getSession: async () => ({ data: { session: null }, error: disabledError }),
        getUser: async () => ({ data: { user: null }, error: disabledError }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithPassword: async () => ({ error: disabledError }),
        signUp: async () => ({ error: disabledError }),
        signOut: async () => ({ error: disabledError }),
      },
      from: () => ({
        select: () => disabledQuery,
        order: () => disabledQuery,
        insert: async () => ({ data: null, error: disabledError }),
      }),
    } as any)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
