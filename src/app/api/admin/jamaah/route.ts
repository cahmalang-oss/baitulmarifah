import { NextResponse } from 'next/server';
import { requireVerifikator } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPin } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const payload = await requireVerifikator();
    if (payload instanceof Response) return payload;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('users')
      .select(`
        id, nama, no_wa, status, created_at,
        jamaah_profile ( id, saldo, no_va, paket_status, paket (nama, harga_target) )
      `)
      .eq('role', 'jamaah')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Formatting for frontend
    const formattedData = data.map((item: any) => ({
      id: item.id,
      nama: item.nama,
      no_wa: item.no_wa,
      status: item.status,
      created_at: item.created_at,
      profile_id: item.jamaah_profile?.[0]?.id,
      saldo: item.jamaah_profile?.[0]?.saldo || 0,
      no_va: item.jamaah_profile?.[0]?.no_va,
      paket: item.jamaah_profile?.[0]?.paket,
      paket_status: item.jamaah_profile?.[0]?.paket_status
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error: any) {
    console.error('Fetch jamaah error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireVerifikator();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    const { nama, no_wa, alamat, paket_id, pin } = body;

    if (!nama || !no_wa || !pin) {
      return NextResponse.json({ error: 'Nama, No WA, dan PIN wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const userId = uuidv4();
    const hashedPin = await hashPin(pin);

    // Cek duplikat no_wa
    const { data: existingUser } = await supabase.from('users').select('id').eq('no_wa', no_wa).single();
    if (existingUser) {
      return NextResponse.json({ error: 'Nomor WhatsApp sudah terdaftar' }, { status: 400 });
    }

    // Insert user
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      nama,
      no_wa,
      password_hash: hashedPin,
      alamat,
      role: 'jamaah',
      status: 'aktif'
    });
    if (userError) throw userError;

    // Insert jamaah_profile
    const { error: profileError } = await supabase.from('jamaah_profile').insert({
      user_id: userId,
      paket_id: paket_id || null,
      saldo: 0,
      tanggal_daftar: new Date().toISOString()
    });
    if (profileError) throw profileError;

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    console.error('Tambah jamaah error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan jamaah' }, { status: 500 });
  }
}

