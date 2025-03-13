import { createClient } from '@supabase/supabase-js'

const supabaseClient = createClient(
  'https://fjrtsgsbdkflnbvlsrtd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcnRzZ3NiZGtmbG5idmxzcnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyOTAxNTIsImV4cCI6MjAxNDg2NjE1Mn0.qs1RVBWQKsvYB5L4DXiMJXJrIEkgpTqDJYO3Zz_4BlU',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)

export { supabaseClient as supabase }
