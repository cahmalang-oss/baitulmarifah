import { NextResponse } from 'next/server';
import { requireJamaah } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const payload = await requireJamaah();
    if (payload instanceof Response) return payload;

    const formData = await request.formData();
    const jumlah = formData.get('jumlah');
    const tanggal_setor = formData.get('tanggal_setor');
    const bukti = formData.get('bukti') as File | null;
    const catatan = formData.get('catatan') || '';

    if (!jumlah || !tanggal_setor || !bukti) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (Number(jumlah) < 10000) {
      return NextResponse.json({ error: 'Minimal setoran Rp 10.000' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Dapatkan jamaah_profile_id
    const { data: profile } = await supabase
      .from('jamaah_profile')
      .select('id')
      .eq('user_id', payload.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil jamaah tidak ditemukan' }, { status: 404 });
    }

    // Upload ke Supabase Storage
    const fileExt = bukti.name.split('.').pop();
    const fileName = `${payload.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('bukti-transfer')
      .upload(filePath, bukti);

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ error: `Gagal mengunggah foto bukti: ${uploadError.message}` }, { status: 500 });
    }

    // Insert ke tabel setoran
    const { error: insertError } = await supabase.from('setoran').insert({
      jamaah_id: profile.id,
      jumlah: Number(jumlah),
      tanggal_setor: tanggal_setor.toString(),
      status: 'pending',
      bukti_url: filePath,
      catatan: catatan.toString()
    });

    if (insertError) {
      console.error('DB Insert Error:', insertError);
      return NextResponse.json({ error: 'Gagal menyimpan data setoran' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Setoran error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
