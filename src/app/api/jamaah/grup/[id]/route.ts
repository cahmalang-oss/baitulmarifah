import { NextResponse } from 'next/server';
import { requireJamaah } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: grupId } = await params;
    const payload = await requireJamaah();
    if (payload instanceof Response) return payload;
    const supabase = createAdminClient();
    // Cek apakah jamaah sudah di grup lain
    const { data: profile } = await supabase.from('jamaah_profile').select('id, grup_id').eq('user_id', payload.id).single();
    if (!profile) return NextResponse.json({ error: 'Profil jamaah tidak ditemukan' }, { status: 404 });
    if (profile.grup_id) return NextResponse.json({ error: 'Anda sudah bergabung di grup lain. Hubungi admin untuk pindah grup.' }, { status: 400 });
    // Cek kapasitas grup
    const { data: grup } = await supabase.from('grup').select('id, target_anggota, jamaah_profile(id)').eq('id', grupId).single();
    if (!grup) return NextResponse.json({ error: 'Grup tidak ditemukan' }, { status: 404 });
    const anggotaSaatIni = Array.isArray(grup.jamaah_profile) ? grup.jamaah_profile.length : 0;
    if (anggotaSaatIni >= (grup.target_anggota || 7)) return NextResponse.json({ error: 'Grup sudah penuh' }, { status: 400 });
    // Join grup
    const { error } = await supabase.from('jamaah_profile').update({ grup_id: grupId }).eq('id', profile.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
