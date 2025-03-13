import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fjrtsgsbdkflnbvlsrtd.supabase.co';
// Usar la service_role key en lugar de la anon key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcnRzZ3NiZGtmbG5idmxzcnRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ2ODc1MiwiZXhwIjoyMDU3MDQ0NzUyfQ.iywq17CP8bLIqUNuP60a8YL_lx8_LKbsg2t0TOUodS4';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      // Agregar el Authorization header con el service role key
      'Authorization': `Bearer ${supabaseKey}`
    }
  }
});

export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('id')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error de conexión:', error);
      return false;
    }
    console.log('Conexión exitosa a Supabase');
    return true;
  } catch (error) {
    console.error('Error al verificar conexión:', error);
    return false;
  }
};

// Agregar esta función de utilidad para debugging
export const testQuery = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    console.log(`Test query en ${tableName}:`, { data, error });
    return { success: !error, data, error };
  } catch (error) {
    console.error(`Error en test query ${tableName}:`, error);
    return { success: false, error };
  }
};
