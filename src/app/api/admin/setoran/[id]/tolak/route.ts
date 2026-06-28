import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWA } from '@/lib/fonnte';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;

    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 }); }
    const { alasan } = body;

    if (!alasan || alasan.length < 10) {
      return NextResponse.json({ error: 'Alasan penolakan minimal 10 karakter' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Ambil data setoran & jamaah
    const { data: setoran, error: fetchError } = await supabase
      .from('setoran')
      .select('*, jamaah_profile (user_id, users (nama, no_wa))')
      .eq('id', id)
      .single();

    if (fetchError || !setoran) {
      return NextResponse.json({ error: 'Setoran tidak ditemukan' }, { status: 404 });
    }

    if (setoran.status !== 'pending') {
      return NextResponse.json({ error: 'Setoran sudah diproses sebelumnya' }, { status: 400 });
    }

    const jumlahSetoran = setoran.jumlah || 0;
    const jamaahProfile: any = Array.isArray(setoran.jamaah_profile) ? setoran.jamaah_profile[0] : setoran.jamaah_profile;
    const userData: any = jamaahProfile?.users ? (Array.isArray(jamaahProfile.users) ? jamaahProfile.users[0] : jamaahProfile.users) : null;
    const noWa = userData?.no_wa;

    // 2. Update status jadi ditolak
    const { error: updateError } = await supabase
      .from('setoran')
      .update({
        status: 'ditolak',
        alasan_tolak: alasan,
        verified_by: payload.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. Catat audit log (fire-and-forget)
    try {
      await supabase.from('audit_log').insert({
        aksi: 'TOLAK_SETORAN',
        entity_type: 'setoran',
        entity_id: id,
        user_id: payload.id,
        detail: { jumlah: jumlahSetoran, alasan }
      });
    } catch {} // Silently ignore

    // 4. Kirim WA ke Jamaah
    if (noWa) {
      const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(jumlahSetoran);
      const waMsg = `*BAITULMARIFAH APP*\n\nMohon maaf, setoran Anda sebesar *${rp}* terpaksa kami tolak ❌.\n\n*Alasan:* ${alasan}\n\nSilakan cek aplikasi dan unggah ulang bukti transfer yang benar. Terima kasih.`;
      sendWA(noWa, waMsg).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Tolak error:', error);
    return NextResponse.json({ error: 'Gagal memproses penolakan' }, { status: 500 });
  }
}
