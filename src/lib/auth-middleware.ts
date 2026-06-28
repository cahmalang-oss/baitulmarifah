import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { verifyToken, JwtPayload } from './auth'
import { createClient } from './supabase/server'

export async function requireJamaah(request?: NextRequest): Promise<JwtPayload | Response> {
  const cookieStore = await cookies()
  const token = request ? request.cookies.get('bm-token')?.value : cookieStore.get('bm-token')?.value

  if (token) {
    const payload = await verifyToken(token)
    if (payload && payload.role === 'jamaah') {
      return payload
    }
  }

  // Check Supabase Google OAuth
  const sbCookie = cookieStore.getAll().find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
  if (sbCookie) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Untuk MVP, anggap semua yang login Google adalah jamaah.
      return {
        id: user.id,
        nama: user.user_metadata.full_name || 'User',
        role: 'jamaah'
      }
    }
  }

  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
}

export async function requireAdmin(request?: NextRequest): Promise<JwtPayload | Response> {
  const cookieStore = await cookies()
  const token = request ? request.cookies.get('bm-token')?.value : cookieStore.get('bm-token')?.value

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  const payload = await verifyToken(token)
  if (!payload || !['admin', 'petugas_verifikasi', 'petugas_keuangan'].includes(payload.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized atau role tidak memiliki akses' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  return payload
}
