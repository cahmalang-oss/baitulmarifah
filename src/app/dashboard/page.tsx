import { createAdminClient } from '@/lib/supabase/admin';
import { requireJamaah } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const fmt2 = (n: number) =>
  n >= 1_000_000_000 ? `${(n / 1_000_000_000).toFixed(1)} M`
  : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} jt`
  : n >= 1_000 ? `${(n / 1_000).toFixed(0)} rb`
  : String(n);

export default async function DashboardPage() {
  const payload = await requireJamaah();
  if (payload instanceof Response) redirect('/login');

  const supabase = createAdminClient();

  const [
    { data: profile },
    { data: kasData },
    { count: totalJamaah },
    { data: faseAktif },
  ] = await Promise.all([
    supabase.from('jamaah_profile').select('*, paket(*)').eq('user_id', payload.id).maybeSingle(),
    supabase.from('kas_transaksi').select('nominal, jenis'),
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'jamaah').eq('status', 'aktif'),
    supabase.from('hewan_fase').select('label, deskripsi').eq('aktif', true).maybeSingle(),
  ]);

  // Setoran milik jamaah ini saja — jangan tampilkan data jamaah lain
  let mySetoranList: any[] = [];
  if (profile?.id) {
    const { data } = await supabase.from('setoran').select('id, jumlah, tanggal_setor, status, kategori')
      .eq('jamaah_id', profile.id).order('tanggal_setor', { ascending: false }).limit(4);
    mySetoranList = data || [];
  }

  const totalKasMasuk = kasData?.filter(k => k.jenis === 'masuk').reduce((s, k) => s + (k.nominal || 0), 0) ?? 0;
  const totalKasKeluar = kasData?.filter(k => k.jenis === 'keluar').reduce((s, k) => s + (k.nominal || 0), 0) ?? 0;
  const kasInfaq = totalKasMasuk - totalKasKeluar;

  const paketData: any = profile?.paket;
  const paket = Array.isArray(paketData) ? paketData[0] : paketData;

  const persen = paket?.harga_target ? Math.min(((profile?.saldo || 0) / paket.harga_target) * 100, 100) : 0;

  const statusBadge = (status: string) => {
    if (status === 'dikonfirmasi') return <span className="px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-500/30 rounded text-[10px] font-medium">✓ Dikonfirmasi</span>;
    if (status === 'ditolak') return <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded text-[10px] font-medium">✗ Ditolak</span>;
    return <span className="px-2 py-0.5 bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 rounded text-[10px] font-medium">⏳ Pending</span>;
  };

  const kategoriLabel = (k: string) => {
    if (k === 'kurban') return '🐄';
    if (k === 'donatur_tetap') return '🤝';
    if (k === 'waqaf') return '🕌';
    return '🤲';
  };

  return (
    <div className="p-5 space-y-5">

      {/* ── Saldo Kurban Personal ── */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#C9A84C]/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#C9A84C]/10 rounded-full blur-xl pointer-events-none" />
        <p className="text-white/50 text-xs font-medium mb-0.5">Saldo Tabungan Qurban Saya</p>
        <h2 className="text-3xl font-bold text-[#C9A84C]">{fmt(profile?.saldo || 0)}</h2>

        {paket ? (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 mb-1">Paket: <span className="text-white/70 font-semibold">{paket.nama}</span></p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-1.5">
              <div className="bg-[#C9A84C] h-2 rounded-full transition-all" style={{ width: `${persen}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>{persen.toFixed(0)}% tercapai</span>
              <span>Target: {fmt(paket.harga_target)}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/40 mt-2">Belum terdaftar paket qurban — hubungi admin/panitia</p>
        )}

        <div className="flex gap-2 mt-4">
          <Link href="/dashboard/kurban"
            className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl bg-[#C9A84C] text-[#0F172A] hover:bg-[#D4B869] transition-colors">
            🐄 Lapor Setoran Qurban
          </Link>
          <Link href="/dashboard/infaq"
            className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl border border-white/20 text-white/60 hover:bg-white/5 transition-colors">
            🤲 Lapor Infaq
          </Link>
        </div>
      </div>

      {/* ── Status Qurban (fase aktif) ── */}
      {faseAktif && (
        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl border border-blue-500/20 flex-shrink-0">🐄</div>
          <div>
            <p className="text-[10px] text-white/40 mb-0.5">Status Qurban Saat Ini</p>
            <p className="text-sm font-bold text-white">{faseAktif.label}</p>
            {faseAktif.deskripsi && <p className="text-xs text-white/50">{faseAktif.deskripsi}</p>}
          </div>
        </div>
      )}

      {/* ── Setoran Terakhir Saya ── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-bold text-sm">Setoran Terakhir Saya</h3>
          <Link href="/dashboard/riwayat" className="text-xs text-[#C9A84C] hover:underline">Lihat Semua →</Link>
        </div>
        <div className="space-y-2">
          {mySetoranList && mySetoranList.length > 0 ? (
            mySetoranList.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/8 px-4 py-3 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-base">{kategoriLabel(item.kategori)}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{fmt(item.jumlah)}</p>
                    <p className="text-[10px] text-white/40">{new Date(item.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                {statusBadge(item.status)}
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/8">
              <p className="text-sm text-white/40">Belum ada riwayat setoran</p>
            </div>
          )}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Info Masjid</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* ── Data Publik Masjid ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] text-white/40 mb-1">Kas Infaq Masjid</p>
          <p className="text-lg font-bold text-emerald-400">{fmt2(kasInfaq)}</p>
          <p className="text-[10px] text-white/30 mt-1">Saldo bersih</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] text-white/40 mb-1">Jamaah Aktif</p>
          <p className="text-lg font-bold text-blue-400">{totalJamaah ?? 0}</p>
          <p className="text-[10px] text-white/30 mt-1">orang terdaftar</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] text-white/40 mb-1">Total Pemasukan</p>
          <p className="text-lg font-bold text-white">{fmt2(totalKasMasuk)}</p>
          <p className="text-[10px] text-white/30 mt-1">dari infaq</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] text-white/40 mb-1">Total Pengeluaran</p>
          <p className="text-lg font-bold text-red-400">{fmt2(totalKasKeluar)}</p>
          <p className="text-[10px] text-white/30 mt-1">kas keluar</p>
        </div>
      </div>
    </div>
  );
}
