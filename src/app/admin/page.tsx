import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default async function AdminDashboardPage() {
  const payload = await requireAdmin();
  if (payload instanceof Response) redirect('/login');

  const supabase = createAdminClient();

  const [
    { count: totalJamaah },
    { count: totalPending },
    { data: profiles },
    { data: kasData },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'jamaah').eq('status', 'aktif'),
    supabase.from('setoran').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('jamaah_profile').select('saldo'),
    supabase.from('kas_transaksi').select('nominal, jenis, kategori'),
  ]);

  const totalTabunganKurban = profiles?.reduce((s, p) => s + (p.saldo || 0), 0) ?? 0;
  const totalKasMasuk = kasData?.filter(k => k.jenis === 'masuk').reduce((s, k) => s + (k.nominal || 0), 0) ?? 0;
  const totalKasKeluar = kasData?.filter(k => k.jenis === 'keluar').reduce((s, k) => s + (k.nominal || 0), 0) ?? 0;
  const totalInfaq = totalKasMasuk - totalKasKeluar;

  const stats = [
    {
      label: 'Total Jamaah Aktif',
      value: String(totalJamaah ?? 0),
      sub: 'jamaah terdaftar',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      accent: 'text-white',
      gold: false,
      href: '/admin/jamaah',
    },
    {
      label: 'Setoran Pending',
      value: String(totalPending ?? 0),
      sub: (totalPending ?? 0) > 0 ? 'butuh verifikasi' : 'semua terverifikasi',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      accent: (totalPending ?? 0) > 0 ? 'text-[#C9A84C]' : 'text-white',
      gold: (totalPending ?? 0) > 0,
      href: '/admin/setoran',
    },
    {
      label: 'Total Tabungan Kurban',
      value: fmt(totalTabunganKurban),
      sub: 'tabungan seluruh jamaah',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      accent: 'text-emerald-400',
      gold: false,
      href: '/admin/rekap',
    },
    {
      label: 'Saldo Kas Infaq',
      value: fmt(totalInfaq),
      sub: 'total masuk dikurangi pengeluaran',
      icon: '4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      accent: 'text-white',
      gold: false,
      href: '/admin/infaq',
    },
  ];

  const quickActions = [
    { label: 'Verifikasi Setoran', href: '/admin/setoran', desc: 'Konfirmasi pembayaran masuk' },
    { label: 'Tambah Jamaah', href: '/admin/jamaah', desc: 'Daftarkan jamaah baru' },
    { label: 'Input Infaq', href: '/admin/infaq/insidentil', desc: 'Catat penerimaan infaq' },
    { label: 'Export Data', href: '/admin/export', desc: 'Unduh laporan CSV' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pt-2">
        <p className="text-[#C9A84C]/70 text-xs uppercase tracking-[0.2em] font-semibold mb-1">Panel Administrasi</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">
          Selamat datang, <span className="text-white/70 font-medium">{payload.nama}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`glass-card p-5 flex flex-col gap-3 hover:border-[#C9A84C]/25 transition-all duration-200 hover:-translate-y-0.5 group ${s.gold ? 'border-[#C9A84C]/20 bg-[#C9A84C]/4' : ''}`}
          >
            <div className="flex items-start justify-between">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest leading-tight">{s.label}</p>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.gold ? 'bg-[#C9A84C]/15 text-[#C9A84C]' : 'bg-white/5 text-white/30 group-hover:text-white/50'} transition-colors`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </span>
            </div>
            <div>
              <div className={`text-2xl font-bold leading-none ${s.accent}`}>{s.value}</div>
              <div className="text-white/30 text-xs mt-1.5">{s.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="glass-card p-4 hover:border-[#C9A84C]/25 hover:bg-[#C9A84C]/4 transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{a.label}</p>
              <p className="text-[11px] text-white/30 mt-1">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
