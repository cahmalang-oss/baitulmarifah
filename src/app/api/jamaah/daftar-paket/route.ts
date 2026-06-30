import { NextResponse } from 'next/server';
import { requireJamaah } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const payload = await requireJamaah();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    const { paket_id } = body;

    if (!paket_id) {
      return NextResponse.json({ error: 'Paket wajib dipilih' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from('jamaah_profile')
      .select('id, paket_id, paket_status')
      .eq('user_id', payload.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil jamaah tidak ditemukan' }, { status: 404 });
    }

    if (profile.paket_id && profile.paket_status === 'aktif') {
      return NextResponse.json({ error: 'Anda sudah terdaftar dalam paket qurban' }, { status: 400 });
    }

    // Pastikan paket valid & aktif
    const { data: paket } = await supabase
      .from('paket')
      .select('id')
      .eq('id', paket_id)
      .eq('status', 'aktif')
      .maybeSingle();

    if (!paket) {
      return NextResponse.json({ error: 'Paket tidak ditemukan atau sudah tidak aktif' }, { status: 400 });
    }

    const { error } = await supabase
      .from('jamaah_profile')
      .update({ paket_id, paket_status: 'pending' })
      .eq('id', profile.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Daftar paket error:', error);
    return NextResponse.json({ error: 'Gagal mendaftar paket' }, { status: 500 });
  }
}
