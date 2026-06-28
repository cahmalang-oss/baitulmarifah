import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const payload = await requireAdmin();
  if (payload instanceof Response) redirect('/login');

  const supabase = createAdminClient();

  // 1. Total jamaah aktif
  const { count: totalJamaah } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('role', 'jamaah')
    .eq('status', 'aktif');

  // 2. Total setoran pending
  const { count: totalPending } = await supabase
    .from('setoran')
    .select('id', { count: 'exact' })
    .eq('status', 'pending');

  // 3. Total saldo terkumpul
  const { data: profiles } = await supabase
    .from('jamaah_profile')
    .select('saldo');
  
  const totalSaldo = profiles?.reduce((sum, p) => sum + (p.saldo || 0), 0) || 0;

  // 4. Total infaq bulan ini
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { data: infaq } = await supabase
    .from('kas_transaksi')
    .select('nominal')
    .eq('kategori', 'infaq')
    .gte('tanggal', startOfMonth);
    
  const totalInfaq = infaq?.reduce((sum, i) => sum + (i.nominal || 0), 0) || 0;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-white/50 text-sm">Ringkasan data BaitulMarifah App saat ini.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Total Jamaah Aktif</p>
          <div className="text-3xl font-bold text-white">{totalJamaah || 0}</div>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-5">
          <p className="text-yellow-500/70 text-xs font-semibold uppercase tracking-wider mb-2">Setoran Pending</p>
          <div className="text-3xl font-bold text-yellow-400">{totalPending || 0}</div>
          {totalPending && totalPending > 0 ? (
             <p className="text-[10px] text-yellow-500/50 mt-1">Butuh verifikasi Anda</p>
          ) : null}
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-500/30 rounded-2xl p-5">
          <p className="text-green-500/70 text-xs font-semibold uppercase tracking-wider mb-2">Total Saldo Terkumpul</p>
          <div className="text-2xl font-bold text-green-400">{formatRupiah(totalSaldo)}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Infaq Bulan Ini</p>
          <div className="text-2xl font-bold text-white">{formatRupiah(totalInfaq)}</div>
        </div>
      </div>
    </div>
  );
}
