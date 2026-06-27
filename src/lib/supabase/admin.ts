import { createClient } from '@supabase/supabase-js'

// Client khusus Admin yang menggunakan SERVICE_ROLE_KEY.
// Ini akan mem-bypass RLS karena logika isolasi multi-tenant sudah 
// ditangani secara aman di level aplikasi Next.js (Server Components & API Routes).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
