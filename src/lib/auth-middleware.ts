import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { verifyToken, JwtPayload } from './auth'
import { createClient } from './supabase/server'

export const ALL_STAFF_ROLES = ['admin', 'bendahara', 'verifikator'];
export const BENDAHARA_ROLES = ['admin', 'bendahara'];
export const VERIFIKATOR_ROLES = ['admin', 'verifikator'];

function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
}

async function getTokenPayload(request?: NextRequest): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = request ? request.cookies.get('bm-token')?.value : cookieStore.get('bm-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireJamaah(request?: NextRequest): Promise<JwtPayload | Response> {
  const cookieStore = await cookies();
  const token = request ? request.cookies.get('bm-token')?.value : cookieStore.get('bm-token')?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload && payload.role === 'jamaah') return payload;
  }

  const sbCookie = cookieStore.getAll().find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
  if (sbCookie) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return { id: user.id, nama: user.user_metadata.full_name || 'User', role: 'jamaah' };
    }
  }

  return unauthorizedResponse();
}

// Semua staff (admin + bendahara + verifikator) — dipakai di halaman umum admin
export async function requireAdmin(request?: NextRequest): Promise<JwtPayload | Response> {
  const payload = await getTokenPayload(request);
  if (!payload || !ALL_STAFF_ROLES.includes(payload.role)) return unauthorizedResponse();
  return payload;
}

// Hanya admin murni — untuk manajemen pengguna & pengaturan sistem
export async function requireOnlyAdmin(request?: NextRequest): Promise<JwtPayload | Response> {
  const payload = await getTokenPayload(request);
  if (!payload || payload.role !== 'admin') return unauthorizedResponse();
  return payload;
}

// Admin + Bendahara — untuk halaman keuangan
export async function requireBendahara(request?: NextRequest): Promise<JwtPayload | Response> {
  const payload = await getTokenPayload(request);
  if (!payload || !BENDAHARA_ROLES.includes(payload.role)) return unauthorizedResponse();
  return payload;
}

// Admin + Verifikator — untuk halaman data jamaah & paket
export async function requireVerifikator(request?: NextRequest): Promise<JwtPayload | Response> {
  const payload = await getTokenPayload(request);
  if (!payload || !VERIFIKATOR_ROLES.includes(payload.role)) return unauthorizedResponse();
  return payload;
}
