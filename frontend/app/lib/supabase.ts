import { createClient } from '@supabase/supabase-js';

let supabase;

try {
  const supabaseUrl = 'https://fjrtsgsbdkflnbvlsrtd.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcnRzZ3NiZGtmbG5idmxzcnRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ2ODc1MiwiZXhwIjoyMDU3MDQ0NzUyfQ.iywq17CP8bLIqUNuP60a8YL_lx8_LKbsg2t0TOUodS4';

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });

  console.log('Supabase inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Supabase:', error);
  throw error;
}

export { supabase };
