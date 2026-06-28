import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import JamaahDetailForms from './JamaahDetailForms';

export default async function JamaahDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await requireAdmin();
  if (payload instanceof Response) redirect('/login');

  const supabase = createAdminClient();

  // Ambil user dan profile
  const { data: user } = await supabase
    .from('users')
    .select(`
      *,
      jamaah_profile (
        id, saldo, no_va, tanggal_daftar, paket_id,
        paket (nama, harga_target)
      )
    `)
    .eq('id', id)
    .single();

  if (!user) {
    return <div className="text-white p-6">Jamaah tidak ditemukan.</div>;
  }

  // Handle tipe data profile yang kadang dikembalikan sebagai array
  const profileData: any = user.jamaah_profile;
  const profile = Array.isArray(profileData) ? profileData[0] : profileData;

  // Ambil list setoran
  const { data: setoranList } = await supabase
    .from('setoran')
    .select('*')
    .eq('jamaah_id', profile?.id || '')
    .order('tanggal_setor', { ascending: false });

  // Ambil master data paket untuk dropdown
  const { data: paketList } = await supabase
    .from('paket')
    .select('id, nama, harga_target')
    .eq('status', 'aktif')
    .order('harga_target', { ascending: true });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const STATUS_BADGE: Record<string, string> = {
    aktif: 'bg-green-900/40 text-green-400',
    lunas: 'bg-blue-900/40 text-blue-400',
    pending: 'bg-yellow-900/40 text-yellow-400',
    nonaktif: 'bg-white/10 text-white/50',
  };

  const getSetoranBadge = (status: string) => {
    switch(status) {
      case 'dikonfirmasi': return <span className="px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-500/30 rounded text-[10px] font-medium">Dikonfirmasi</span>;
      case 'ditolak': return <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded text-[10px] font-medium">Ditolak</span>;
      default: return <span className="px-2 py-0.5 bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 rounded text-[10px] font-medium">Pending</span>;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/jamaah" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Detail Jamaah</h1>
          <p className="text-white/50 text-sm">Informasi lengkap, riwayat setoran, dan pengaturan VA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Profil & Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{user.nama}</h2>
                <a href={`https://wa.me/${user.no_wa}`} target="_blank" rel="noreferrer" className="text-[#C9A84C] text-sm hover:underline block">{user.no_wa}</a>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${STATUS_BADGE[user.status] || 'bg-white/10 text-white/50'}`}>
                {user.status}
              </span>
            </div>
            
            <div className="space-y-3 border-t border-white/10 pt-4 mt-2">
              <div>
                <p className="text-xs text-white/40 mb-0.5">Alamat Lengkap</p>
                <p className="text-sm text-white/80">{user.alamat || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">Tanggal Daftar</p>
                <p className="text-sm text-white/80">{profile?.tanggal_daftar ? new Date(profile.tanggal_daftar).toLocaleDateString('id-ID') : '-'}</p>
              </div>
            </div>

            <div className="mt-6 bg-[#0F172A] rounded-xl p-4 border border-[#C9A84C]/30 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#C9A84C]/10 rounded-full blur-xl"></div>
              <p className="text-white/50 text-xs font-semibold mb-1 relative z-10">Total Saldo Terkumpul</p>
              <div className="text-2xl font-bold text-[#C9A84C] relative z-10">{formatRupiah(profile?.saldo || 0)}</div>
              
              <div className="mt-3 pt-3 border-t border-white/10 relative z-10">
                <p className="text-xs text-white/40 mb-0.5">Paket Qurban</p>
                <p className="text-sm text-white font-medium">{profile?.paket?.nama || 'Belum dipilih'}</p>
              </div>
            </div>
          </div>

          <JamaahDetailForms 
            userId={user.id} 
            initialVa={profile?.no_va} 
            initialPaketId={profile?.paket_id} 
            paketList={paketList || []} 
          />
        </div>

        {/* Kolom Kanan: Riwayat Setoran */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Riwayat Setoran</h3>
            
            <div className="space-y-3">
              {setoranList && setoranList.length > 0 ? (
                setoranList.map((item) => (
                  <div key={item.id} className="bg-[#0F172A] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-white/50 text-xs">{new Date(item.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-lg font-bold text-white mt-0.5">{formatRupiah(item.jumlah)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-1/2">
                      {getSetoranBadge(item.status)}
                      <a
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bukti-transfer/${item.bukti_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#C9A84C] font-medium flex items-center gap-1 hover:underline whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        Bukti
                      </a>
                    </div>
                    
                    {item.alasan_tolak && (
                      <div className="w-full sm:hidden text-xs text-red-400 mt-2 bg-red-900/20 p-2 rounded">
                        Tolak: {item.alasan_tolak}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-white/40">Belum ada riwayat setoran untuk jamaah ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
