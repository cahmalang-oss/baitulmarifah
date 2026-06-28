import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPin, signToken } from '@/lib/auth'

import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { nama, no_wa, alamat, pin } = await request.json()

    if (!nama || !no_wa || !pin) {
      return NextResponse.json({ error: 'Nama, No WA, dan PIN wajib diisi' }, { status: 400 })
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN harus berupa 6 digit angka' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // Check jika WA sudah terdaftar
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('no_wa', no_wa)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Nomor WA sudah terdaftar' }, { status: 400 })
    }

    const hashedPin = await hashPin(pin)
    const userId = uuidv4()

    // Insert user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        nama,
        no_wa,
        alamat,
        password_hash: hashedPin,
        role: 'jamaah',
        status: 'aktif'
      })
      .select()
      .single()

    if (userError || !user) {
      throw userError
    }

    // Insert jamaah_profile
    await supabase.from('jamaah_profile').insert({
      user_id: user.id
    })

    // Auto-login after register
    const token = await signToken({
      id: user.id,
      nama: user.nama,
      role: 'jamaah'
    }, '30d')

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, nama: user.nama, role: user.role } 
    })

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
    console.error('Register error:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}
