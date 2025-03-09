/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Forzar recarga de variables de entorno
  experimental: {
    forceSwcTransforms: true,
  },
}

console.log('Next.js Config:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Presente' : 'Faltante',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Presente' : 'Faltante',
});

module.exports = nextConfig
