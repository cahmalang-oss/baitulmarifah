import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const [
      kasResult,
      kurbanResult,
      pengeluaranBulanResult,
      jamaahResult,
      tickerResult,
      infaqHariIniResult,
      infaqMingguResult,
      pengeluaranMingguResult,
      sparkKurbanResult,
      sparkInfaqResult,
      setoranPendingResult,
    ] = await Promise.all([
      supabase.from('kas_transaksi').select('nominal, jenis, kategori')
        .in('kategori', ['infaq_insidentil', 'infaq_donatur_tetap', 'pengeluaran_infaq']),
      supabase.from('setoran').select('jumlah').eq('kategori', 'kurban').eq('status', 'dikonfirmasi'),
      supabase.from('kas_transaksi').select('nominal')
        .in('kategori', ['pengeluaran_infaq', 'pengeluaran_kurban']).eq('jenis', 'keluar').gte('tanggal', monthStart),
      supabase.from('jamaah_profile').select('id, grup_id'),
      supabase.from('setoran')
        .select('jumlah, tanggal_setor, kategori, jamaah_profile(users(nama))')
        .eq('status', 'dikonfirmasi').order('tanggal_setor', { ascending: false }).limit(20),
      supabase.from('kas_transaksi').select('nominal')
        .in('kategori', ['infaq_insidentil', 'infaq_donatur_tetap']).eq('jenis', 'masuk').eq('tanggal', today),
      supabase.from('kas_transaksi').select('nominal')
        .in('kategori', ['infaq_insidentil', 'infaq_donatur_tetap']).eq('jenis', 'masuk').gte('tanggal', weekStartStr),
      supabase.from('kas_transaksi').select('nominal')
        .in('kategori', ['pengeluaran_infaq', 'pengeluaran_kurban']).eq('jenis', 'keluar').gte('tanggal', weekStartStr),
      supabase.from('setoran').select('jumlah, tanggal_setor')
        .eq('kategori', 'kurban').eq('status', 'dikonfirmasi').gte('tanggal_setor', sevenDaysAgoStr),
      supabase.from('kas_transaksi').select('nominal, tanggal')
        .in('kategori', ['infaq_insidentil', 'infaq_donatur_tetap']).eq('jenis', 'masuk').gte('tanggal', sevenDaysAgoStr),
      supabase.from('setoran').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]);

    const saldoInfaq = (kasResult.data || []).reduce((sum, t) => {
      if (t.jenis === 'masuk') return sum + (t.nominal || 0);
      if (t.jenis === 'keluar') return sum - (t.nominal || 0);
      return sum;
    }, 0);
    const totalKurban = (kurbanResult.data || []).reduce((s, r) => s + (r.jumlah || 0), 0);
    const pengeluaranBulanIni = (pengeluaranBulanResult.data || []).reduce((s, r) => s + (r.nominal || 0), 0);
    const allJamaah = jamaahResult.data || [];
    const totalJamaah = allJamaah.length;
    const tabunganCount = allJamaah.filter((j: any) => !j.grup_id).length;
    const patunganCount = allJamaah.filter((j: any) => !!j.grup_id).length;
    const infaqHariIni = (infaqHariIniResult.data || []).reduce((s, r) => s + (r.nominal || 0), 0);
    const infaqMingguIni = (infaqMingguResult.data || []).reduce((s, r) => s + (r.nominal || 0), 0);
    const pengeluaranMingguIni = (pengeluaranMingguResult.data || []).reduce((s, r) => s + (r.nominal || 0), 0);
    const setoranPending = setoranPendingResult.count || 0;

    // Build 7-day spark arrays
    const days7: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days7.push(d.toISOString().split('T')[0]);
    }
    const sparkKurban = days7.map(d =>
      (sparkKurbanResult.data || []).filter((s: any) => s.tanggal_setor === d).reduce((s: number, r: any) => s + (r.jumlah || 0), 0)
    );
    const sparkInfaq = days7.map(d =>
      (sparkInfaqResult.data || []).filter((t: any) => t.tanggal === d).reduce((s: number, r: any) => s + (r.nominal || 0), 0)
    );

    const tickerItems = (tickerResult.data || []).map((s: any) => {
      const jp = Array.isArray(s.jamaah_profile) ? s.jamaah_profile[0] : s.jamaah_profile;
      const user = jp?.users ? (Array.isArray(jp.users) ? jp.users[0] : jp.users) : null;
      return { nama: user?.nama || 'Jamaah', jumlah: s.jumlah, kategori: s.kategori, tanggal: s.tanggal_setor };
    });

    return NextResponse.json({
      saldoInfaq, totalKurban, pengeluaranBulanIni, totalJamaah,
      tabunganCount, patunganCount, infaqHariIni, infaqMingguIni,
      pengeluaranMingguIni, setoranPending, sparkKurban, sparkInfaq, tickerItems,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
