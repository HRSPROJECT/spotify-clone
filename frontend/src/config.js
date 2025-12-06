// Supabase Configuration
import { createClient } from '@supabase/supabase-js'

// ⚠️ Replace with your Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// API Configuration
// ⚠️ Replace with your deployed API URL after hosting
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
