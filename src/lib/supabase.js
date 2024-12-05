import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ymldbdtphzcetkfinykt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbGRiZHRwaHpjZXRrZmlueWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMjUyNDcsImV4cCI6MjA0ODcwMTI0N30.9obVcOtuuozS_GJ7h19zegRI7AJTrQBqnoQzhDwG0x4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: process.env.NEXT_PUBLIC_APP_URL
  }
})
