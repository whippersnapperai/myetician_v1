import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null

export { supabaseUrl, supabaseAnonKey }