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
      .select('id, jumlah, status, kategori, catatan, bukti_url, jamaah_id, jamaah_profile(id, user_id, users(nama, no_wa))')
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
    const kategori = setoran.kategori || 'kurban';
    const jamaahProfile: any = Array.isArray(setoran.jamaah_profile) ? setoran.jamaah_profile[0] : setoran.jamaah_profile;
    const userData: any = jamaahProfile?.users ? (Array.isArray(jamaahProfile.users) ? jamaahProfile.users[0] : jamaahProfile.users) : null;
    const noWa = userData?.no_wa;
    const namaJamaah = userData?.nama || 'Jamaah';

    // 2. Update status setoran
    const { error: updateError } = await supabase
      .from('setoran')
      .update({
        status: 'dikonfirmasi',
        verified_by: payload.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending');

    if (updateError) throw updateError;

    // 3. Proses berdasarkan kategori
    if (kategori === 'kurban') {
      // Update saldo tabungan kurban
      const { error: rpcError } = await supabase.rpc('increment_saldo', {
        profile_id: jamaahProfileId,
        amount: jumlahSetoran,
      });

      if (rpcError) {
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
          try { await supabase.from('setoran').update({ status: 'pending', verified_by: null, verified_at: null }).eq('id', id); } catch {}
          throw saldoError;
        }
      }
    } else if (kategori === 'donatur_tetap') {
      // Parse meta dari catatan untuk dapat donatur_id dan bulan_realisasi
      const catatanRaw = (setoran as any).catatan || '';
      let donaturId: string | null = null;
      let bulanRealisasi: string = new Date().toISOString().split('T')[0].slice(0, 7) + '-01';

      const metaMatch = catatanRaw.match(/__meta__(\{.*\})/);
      if (metaMatch) {
        try {
          const meta = JSON.parse(metaMatch[1]);
          donaturId = meta.donatur_id;
          bulanRealisasi = meta.bulan_realisasi || bulanRealisasi;
        } catch {}
      }

      if (!donaturId) {
        // Fallback: cari donatur_id dari user_id jamaah
        const { data: donatur } = await supabase
          .from('infaq_donatur_tetap')
          .select('id')
          .eq('user_id', jamaahProfile?.user_id)
          .eq('aktif', true)
          .maybeSingle();
        donaturId = donatur?.id || null;
      }

      if (!donaturId) {
        try { await supabase.from('setoran').update({ status: 'pending', verified_by: null, verified_at: null }).eq('id', id); } catch {}
        return NextResponse.json({ error: 'Data donatur tetap tidak ditemukan' }, { status: 400 });
      }

      // Buat atau perbarui realisasi donatur tetap (satu baris per donatur per bulan)
      const { data: existingRealisasi } = await supabase
        .from('infaq_donatur_realisasi')
        .select('id, nominal_realisasi')
        .eq('donatur_id', donaturId)
        .eq('bulan', bulanRealisasi)
        .maybeSingle();

      let realisasiError;
      if (existingRealisasi) {
        // Akumulasi nominal jika sudah ada realisasi bulan ini (mis. sebagian sudah dibayar)
        const result = await supabase
          .from('infaq_donatur_realisasi')
          .update({
            nominal_realisasi: (existingRealisasi.nominal_realisasi || 0) + jumlahSetoran,
            status: 'lunas',
            catatan: `Konfirmasi setoran ID: ${id}`,
            bukti_url: (setoran as any).bukti_url || null,
          })
          .eq('id', existingRealisasi.id);
        realisasiError = result.error;
      } else {
        const result = await supabase.from('infaq_donatur_realisasi').insert({
          donatur_id: donaturId,
          bulan: bulanRealisasi,
          nominal_realisasi: jumlahSetoran,
          status: 'lunas',
          catatan: `Konfirmasi setoran ID: ${id}`,
          bukti_url: (setoran as any).bukti_url || null,
        });
        realisasiError = result.error;
      }

      if (realisasiError) {
        try { await supabase.from('setoran').update({ status: 'pending', verified_by: null, verified_at: null }).eq('id', id); } catch {}
        throw realisasiError;
      }

      // Catat juga ke kas_transaksi
      await supabase.from('kas_transaksi').insert({
        jenis: 'masuk',
        kategori: 'infaq_donatur_tetap',
        nominal: jumlahSetoran,
        sumber: `Donatur Tetap - ${namaJamaah}`,
        catatan: `Bulan: ${bulanRealisasi}, setoran ID: ${id}`,
        tanggal: new Date().toISOString().split('T')[0],
        input_oleh: payload.id,
        bukti_url: (setoran as any).bukti_url || null,
      });

    } else if (kategori === 'waqaf') {
      // kategori === 'waqaf': masukkan ke kas_transaksi program waqaf
      const { error: kasError } = await supabase.from('kas_transaksi').insert({
        jenis: 'masuk',
        kategori: 'waqaf',
        nominal: jumlahSetoran,
        sumber: `Waqaf dari ${namaJamaah}`,
        catatan: `Konfirmasi setoran ID: ${id}`,
        tanggal: new Date().toISOString().split('T')[0],
        input_oleh: payload.id,
        bukti_url: (setoran as any).bukti_url || null,
      });

      if (kasError) {
        try { await supabase.from('setoran').update({ status: 'pending', verified_by: null, verified_at: null }).eq('id', id); } catch {}
        throw kasError;
      }
    } else {
      // kategori === 'infaq': masukkan ke kas_transaksi sebagai insidentil
      const { error: kasError } = await supabase.from('kas_transaksi').insert({
        jenis: 'masuk',
        kategori: 'infaq_insidentil',
        nominal: jumlahSetoran,
        sumber: `Infaq dari ${namaJamaah}`,
        catatan: `Konfirmasi setoran ID: ${id}`,
        tanggal: new Date().toISOString().split('T')[0],
        input_oleh: payload.id,
        bukti_url: (setoran as any).bukti_url || null,
      });

      if (kasError) {
        try { await supabase.from('setoran').update({ status: 'pending', verified_by: null, verified_at: null }).eq('id', id); } catch {}
        throw kasError;
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
    return NextResponse.json({ error: `Gagal memproses konfirmasi: ${error?.message || error?.toString?.() || 'unknown error'}` }, { status: 500 });
  }
}
