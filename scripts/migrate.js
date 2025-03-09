import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase/migrations')
  const files = fs.readdirSync(migrationsDir).sort()

  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      const { error } = await supabase.rpc('exec_sql', { query: sql })
      if (error) {
        console.error(`Error en migración ${file}:`, error)
        process.exit(1)
      }
    }
  }
}

runMigrations()
