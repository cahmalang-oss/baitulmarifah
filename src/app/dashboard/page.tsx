import { createAdminClient } from '@/lib/supabase/admin';
import { requireJamaah } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const payload = await requireJamaah();
  if (payload instanceof Response) {
    redirect('/login');
  }

  const supabase = createAdminClient();

  // 1. Ambil data profil jamaah
  const { data: profile } = await supabase
    .from('jamaah_profile')
    .select('*, paket(*)')
    .eq('user_id', payload.id)
    .single();

  // 2. Ambil 3 setoran terakhir
  const { data: setoranList } = await supabase
    .from('setoran')
    .select('*')
    .eq('jamaah_id', profile?.id || '')
    .order('tanggal_setor', { ascending: false })
    .limit(3);

  // 3. Ambil fase aktif
  const { data: faseAktif } = await supabase
    .from('hewan_fase')
    .select('*')
    .eq('aktif', true)
    .maybeSingle();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'dikonfirmasi': return <span className="px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-500/30 rounded text-[10px] font-medium">Dikonfirmasi</span>;
      case 'ditolak': return <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded text-[10px] font-medium">Ditolak</span>;
      default: return <span className="px-2 py-0.5 bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 rounded text-[10px] font-medium">Pending</span>;
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const paketData: any = profile?.paket;
  const paket = Array.isArray(paketData) ? paketData[0] : paketData;

  return (
    <div className="p-6 space-y-6">
      {/* Saldo Card */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#C9A84C]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#C9A84C]/10 rounded-full blur-xl"></div>
        <p className="text-white/60 text-sm font-medium mb-1 relative z-10">Total Saldo Qurban</p>
        <h2 className="text-3xl font-bold text-[#C9A84C] relative z-10">
          {formatRupiah(profile?.saldo || 0)}
        </h2>
        
        {paket && (
          <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
            <p className="text-xs text-white/50 mb-1">Paket Diikuti:</p>
            <p className="text-sm text-white font-medium">{paket.nama}</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div 
                className="bg-[#C9A84C] h-1.5 rounded-full" 
                style={{ width: `${Math.min(((profile?.saldo || 0) / paket.harga_target) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>0%</span>
              <span>Target: {formatRupiah(paket.harga_target)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Hewan */}
      {faseAktif && (
        <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl border border-blue-500/20">
            🐄
          </div>
          <div>
            <p className="text-xs text-white/50 mb-0.5">Status Qurban Saat Ini</p>
            <p className="text-sm font-bold text-white">{faseAktif.label}</p>
            <p className="text-xs text-white/60">{faseAktif.deskripsi}</p>
          </div>
        </div>
      )}

      {/* Setoran Terakhir */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Setoran Terakhir</h3>
          <Link href="/dashboard/riwayat" className="text-xs text-[#C9A84C] hover:underline">Lihat Semua</Link>
        </div>
        
        <div className="space-y-3">
          {setoranList && setoranList.length > 0 ? (
            setoranList.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">{formatRupiah(item.jumlah)}</p>
                  <p className="text-[10px] text-white/40">{new Date(item.tanggal_setor).toLocaleDateString('id-ID')}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-white/5 rounded-xl border border-white/5">
              <p className="text-sm text-white/50">Belum ada riwayat setoran</p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Link href="/dashboard/setoran" className="block w-full text-center bg-[#C9A84C] text-[#0F172A] font-bold py-3 rounded-xl hover:bg-[#D4B869] transition-colors shadow-lg shadow-[#C9A84C]/20">
            + Tambah Setoran Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
