import { NextResponse } from 'next/server';
import { requireJamaah } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const payload = await requireJamaah();
    if (payload instanceof Response) return payload;

    const supabase = createAdminClient();

    // Cari user berdasarkan ID untuk ambil nama & no_wa
    const { data: user } = await supabase
      .from('users')
      .select('nama, no_wa')
      .eq('id', payload.id)
      .single();

    // Cari donatur tetap berdasarkan user_id
    const { data: donatur } = await supabase
      .from('infaq_donatur_tetap')
      .select('*')
      .eq('user_id', payload.id)
      .eq('aktif', true)
      .maybeSingle();

    if (!donatur) {
      return NextResponse.json({ donatur: null });
    }

    // Ambil riwayat realisasi
    const { data: riwayat } = await supabase
      .from('infaq_donatur_realisasi')
      .select('id, bulan, nominal_realisasi, status')
      .eq('donatur_id', donatur.id)
      .order('bulan', { ascending: false })
      .limit(12);

    return NextResponse.json({ donatur, riwayat: riwayat || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireJamaah();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    const { nominal_komitmen, metode_bayar, mulai_bulan, keterangan } = body;

    if (!nominal_komitmen || !mulai_bulan) {
      return NextResponse.json({ error: 'Nominal komitmen dan mulai bulan wajib diisi' }, { status: 400 });
    }
    if (nominal_komitmen < 10000) {
      return NextResponse.json({ error: 'Minimal komitmen Rp 10.000' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Cek apakah sudah terdaftar
    const { data: existing } = await supabase
      .from('infaq_donatur_tetap')
      .select('id')
      .eq('user_id', payload.id)
      .eq('aktif', true)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Anda sudah terdaftar sebagai donatur tetap' }, { status: 400 });
    }

    // Ambil nama & no_wa user
    const { data: user } = await supabase
      .from('users')
      .select('nama, no_wa')
      .eq('id', payload.id)
      .single();

    // Format mulai_bulan ke tanggal hari pertama
    const mulai = mulai_bulan.length === 7 ? `${mulai_bulan}-01` : mulai_bulan;

    const { data: donatur, error } = await supabase
      .from('infaq_donatur_tetap')
      .insert({
        user_id: payload.id,
        nama_donatur: user?.nama || payload.nama,
        no_wa: user?.no_wa || null,
        nominal_komitmen,
        metode_bayar: metode_bayar || 'tunai',
        mulai_bulan: mulai,
        keterangan: keterangan || null,
        aktif: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, donatur });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
