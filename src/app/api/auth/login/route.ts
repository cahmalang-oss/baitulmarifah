import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPin, signToken } from '@/lib/auth'
import { checkRateLimit, recordFailedAttempt, resetFailedAttempt } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const { no_wa, pin } = await request.json()

    if (!no_wa || !pin) {
      return NextResponse.json({ error: 'No WA dan PIN wajib diisi' }, { status: 400 })
    }

    // Rate limiting: maks 5 percobaan gagal per 15 menit per no_wa
    const rlKey = `login:${no_wa}`
    const rl = checkRateLimit(rlKey, { maxAttempts: 5, blockDurationMs: 15 * 60 * 1000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${rl.retryAfter} detik.` },
        { status: 429 }
      )
    }

    const supabase = createAdminClient()

    // Cari user berdasarkan no WA
    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama, no_wa, role, password_hash, status')
      .eq('no_wa', no_wa)
      .single()

    if (error || !user || !user.password_hash) {
      recordFailedAttempt(rlKey, { maxAttempts: 5, blockDurationMs: 15 * 60 * 1000 })
      return NextResponse.json({ error: 'No WA atau PIN salah' }, { status: 401 })
    }

    if (user.status !== 'aktif') {
      return NextResponse.json({ error: 'Akun Anda sedang dinonaktifkan atau pending' }, { status: 403 })
    }

    // Verify PIN
    const isValid = await verifyPin(pin, user.password_hash)
    if (!isValid) {
      recordFailedAttempt(rlKey, { maxAttempts: 5, blockDurationMs: 15 * 60 * 1000 })
      return NextResponse.json({ error: 'No WA atau PIN salah' }, { status: 401 })
    }

    resetFailedAttempt(rlKey)

    // Sign JWT
    const token = await signToken({
      id: user.id,
      nama: user.nama,
      role: user.role as any
    }, '30d')

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, nama: user.nama, role: user.role } 
    })

    // Set HTTP-Only cookie
    response.cookies.set({
      name: 'bm-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}
