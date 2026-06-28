import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function InfaqPage() {
  const payload = await requireAdmin();
  if (payload instanceof Response) redirect('/login');

  const supabase = createAdminClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Total insidentil masuk
  const { data: insidentilData } = await supabase
    .from('kas_transaksi')
    .select('nominal, jenis')
    .eq('kategori', 'infaq_insidentil');

  const totalInsidentil = insidentilData?.reduce((sum, t) => {
    return sum + (t.jenis === 'masuk' ? t.nominal : -t.nominal);
  }, 0) || 0;

  // Total realisasi donatur tetap
  const { data: realisasiData } = await supabase
    .from('kas_transaksi')
    .select('nominal')
    .eq('kategori', 'infaq_donatur_tetap');

  const totalRealisasi = realisasiData?.reduce((sum, t) => sum + t.nominal, 0) || 0;

  // Total donatur tetap aktif
  const { count: totalDonatur } = await supabase
    .from('infaq_donatur_tetap')
    .select('id', { count: 'exact' })
    .eq('aktif', true);

  // Donatur yang belum bayar bulan ini
  const bulanIni = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const bulanIniStart = bulanIni + '-01';
  const bulanIniEnd = bulanIni + '-31';

  const { data: semuaDonatur } = await supabase
    .from('infaq_donatur_tetap')
    .select('id')
    .eq('aktif', true);

  const { data: sudahBayar } = await supabase
    .from('infaq_donatur_realisasi')
    .select('donatur_id')
    .gte('bulan', bulanIniStart)
    .lte('bulan', bulanIniEnd);

  const sudahBayarIds = new Set(sudahBayar?.map(r => r.donatur_id) || []);
  const belumBayar = (semuaDonatur || []).filter(d => !sudahBayarIds.has(d.id)).length;

  const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[#C9A84C]/70 text-xs uppercase tracking-widest font-semibold mb-1">Kas Masjid</p>
        <h1 className="text-2xl font-bold text-white">Infaq &amp; Shadaqah</h1>
        <p className="text-white/40 text-sm">Kelola pemasukan infaq insidentil dan donatur tetap bulanan.</p>
      </header>

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-1">Total Saldo Infaq</p>
          <p className="text-2xl font-extrabold text-[#C9A84C]">{formatRp(totalInsidentil + totalRealisasi)}</p>
          <p className="text-xs text-white/30 mt-1">Insidentil + Realisasi donatur tetap</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-1">Donatur Tetap Aktif</p>
          <p className="text-2xl font-extrabold text-green-400">{totalDonatur || 0}</p>
          <p className="text-xs text-white/30 mt-1">Berkomitmen infaq rutin per bulan</p>
        </div>

        <div className={`glass-card p-5 ${belumBayar > 0 ? 'border-red-500/30 bg-red-900/10' : ''}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${belumBayar > 0 ? 'text-red-400/70' : 'text-white/40'}`}>Belum Bayar Bulan Ini</p>
          <p className={`text-2xl font-extrabold ${belumBayar > 0 ? 'text-red-400' : 'text-white'}`}>{belumBayar}</p>
          <p className={`text-xs mt-1 ${belumBayar > 0 ? 'text-red-400/60' : 'text-white/30'}`}>{belumBayar > 0 ? '⚠️ Perlu follow-up!' : '✅ Semua sudah lunas'}</p>
        </div>
      </div>

      {/* Tab Navigasi */}
      <div className="flex gap-3 border-b border-white/10 pb-4">
        <Link
          href="/admin/infaq/insidentil"
          className="px-5 py-2.5 bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] font-bold rounded-xl text-sm hover:bg-[#C9A84C]/30 transition-colors"
        >
          💰 Infaq Insidentil
        </Link>
        <Link
          href="/admin/infaq/donatur-tetap"
          className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/60 font-bold rounded-xl text-sm hover:bg-white/10 hover:text-white transition-colors"
        >
          🤝 Donatur Tetap
        </Link>
      </div>

      <div className="glass-card p-8 text-center">
        <p className="text-white/40 text-sm">Pilih tab di atas untuk melihat daftar transaksi.</p>
      </div>
    </div>
  );
}
