import { createClient } from '@supabase/supabase-js'

const SB_URL = import.meta.env.VITE_SUPABASE_URL
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'implicit',
    persistSession: true,
    storageKey: 'urge-auth',
    storage: window.localStorage,
  }
})
