import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Asegurarnos de cargar las variables de entorno
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables de entorno de Supabase no configuradas en el backend')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Función para verificar la conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('your_table').select('*').limit(1)
    if (error) throw error
    console.log('Conexión a Supabase exitosa')
    return true
  } catch (error) {
    console.error('Error de conexión a Supabase:', error)
    return false
  }
}
