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

    const supabase = createAdminClient();

    // 1. Ambil data setoran & jamaah
    const { data: setoran, error: fetchError } = await supabase
      .from('setoran')
      .select('id, jumlah, status, jamaah_id, jamaah_profile(id, user_id, users(nama, no_wa))')
      .eq('id', id)
      .single();

    if (fetchError || !setoran) {
      return NextResponse.json({ error: 'Setoran tidak ditemukan' }, { status: 404 });
    }

    if (setoran.status !== 'pending') {
      return NextResponse.json({ error: 'Setoran sudah diproses sebelumnya' }, { status: 400 });
    }

    const jamaahProfileId = setoran.jamaah_id;
    if (!jamaahProfileId) {
      return NextResponse.json({ error: 'Data jamaah tidak valid pada setoran ini' }, { status: 400 });
    }

    const jumlahSetoran = setoran.jumlah || 0;
    const jamaahProfile: any = Array.isArray(setoran.jamaah_profile) ? setoran.jamaah_profile[0] : setoran.jamaah_profile;
    const userData: any = jamaahProfile?.users ? (Array.isArray(jamaahProfile.users) ? jamaahProfile.users[0] : jamaahProfile.users) : null;
    const noWa = userData?.no_wa;

    // 2. Update status setoran
    const { error: updateError } = await supabase
      .from('setoran')
      .update({
        status: 'dikonfirmasi',
        verified_by: payload.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending'); // Optimistic lock: only update if still pending

    if (updateError) throw updateError;

    // 3. ATOMIC saldo update menggunakan raw SQL via rpc
    // Jika rpc 'increment_saldo' belum ada, fallback ke read-then-write
    const { error: rpcError } = await supabase.rpc('increment_saldo', {
      profile_id: jamaahProfileId,
      amount: jumlahSetoran,
    });

    if (rpcError) {
      // Fallback: read-then-write (less safe but functional)
      console.warn('RPC increment_saldo not available, using fallback:', rpcError.message);
      const { data: profile } = await supabase
        .from('jamaah_profile')
        .select('saldo')
        .eq('id', jamaahProfileId)
        .single();

      const saldoLama = profile?.saldo || 0;
      const { error: saldoError } = await supabase
        .from('jamaah_profile')
        .update({ saldo: saldoLama + jumlahSetoran })
        .eq('id', jamaahProfileId);

      if (saldoError) {
        // Revert status
        try { await supabase.from('setoran').update({ status: 'pending', verified_by: null, verified_at: null }).eq('id', id); } catch {}
        throw saldoError;
      }
    }

    // 4. Audit log (fire-and-forget, safe)
    try {
      await supabase.from('audit_log').insert({
        aksi: 'KONFIRMASI_SETORAN',
        entity_type: 'setoran',
        entity_id: id,
        user_id: payload.id,
        detail: { jumlah: jumlahSetoran, status: 'dikonfirmasi' }
      });
    } catch {} // Silently ignore — non-critical

    // 5. Kirim notifikasi WA (Fire-and-forget)
    if (noWa) {
      const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(jumlahSetoran);
      const waMsg = `*BAITULMARIFAH APP*\n\nAlhamdulillah, setoran Anda sebesar *${rp}* telah diterima dan dikonfirmasi ✅.\n\nSemoga menjadi amal jariyah yang berkah. Aamiin.\n\nCek riwayat tabungan Anda di: https://baitulmarifah.web.id`;
      sendWA(noWa, waMsg).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Konfirmasi error:', error);
    return NextResponse.json({ error: 'Gagal memproses konfirmasi' }, { status: 500 });
  }
}
