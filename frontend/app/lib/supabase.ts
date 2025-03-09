import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables de entorno faltantes:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
  throw new Error('Configuración de Supabase incompleta');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
