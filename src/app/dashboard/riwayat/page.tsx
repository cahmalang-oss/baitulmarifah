import { createAdminClient } from '@/lib/supabase/admin';
import { requireJamaah } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RiwayatPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const payload = await requireJamaah();
  if (payload instanceof Response) {
    redirect('/login');
  }

  const params = await searchParams;
  const limit = typeof params.limit === 'string' ? parseInt(params.limit) : 10;
  const supabase = createAdminClient();
  
  // Dapatkan ID jamaah
  const { data: profile } = await supabase
    .from('jamaah_profile')
    .select('id')
    .eq('user_id', payload.id)
    .single();

  if (!profile) {
    return <div className="p-6 text-white text-center">Data profil tidak ditemukan.</div>;
  }

  const { data: setoranList, count } = await supabase
    .from('setoran')
    .select('id, jumlah, tanggal_setor, status, alasan_tolak, bukti_url', { count: 'exact' })
    .eq('jamaah_id', profile.id)
    .order('tanggal_setor', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  const formatTanggal = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'dikonfirmasi': return <span className="px-2.5 py-1 bg-green-900/40 text-green-400 border border-green-500/30 rounded-md text-xs font-medium">Dikonfirmasi</span>;
      case 'ditolak': return <span className="px-2.5 py-1 bg-red-900/40 text-red-400 border border-red-500/30 rounded-md text-xs font-medium">Ditolak</span>;
      default: return <span className="px-2.5 py-1 bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 rounded-md text-xs font-medium">Pending</span>;
    }
  };

  const hasMore = count !== null && count > limit;

  return (
    <div className="p-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Riwayat Setoran</h1>
      </header>

      <div className="space-y-4">
        {setoranList && setoranList.length > 0 ? (
          <>
            {setoranList.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/8 p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white/50 text-xs">{formatTanggal(item.tanggal_setor)}</p>
                    <p className="text-lg font-bold text-white mt-0.5">Rp {item.jumlah.toLocaleString('id-ID')}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="mt-3 flex justify-between items-center border-t border-white/8 pt-3">
                  <a
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bukti-transfer/${item.bukti_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#C9A84C] font-medium flex items-center gap-1 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Lihat Bukti
                  </a>
                </div>

                {item.status === 'ditolak' && item.alasan_tolak && (
                  <div className="mt-3 bg-red-900/30 text-red-300 text-xs p-3 rounded-lg border border-red-500/30">
                    <span className="font-semibold block mb-0.5">Alasan penolakan:</span>
                    {item.alasan_tolak}
                  </div>
                )}
              </div>
            ))}
            
            {hasMore && (
              <Link 
                href={`/dashboard/riwayat?limit=${limit + 10}`}
                className="block w-full py-3 mt-6 text-center border border-white/20 rounded-xl text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Muat Lebih Banyak
              </Link>
            )}
          </>
        ) : (
          <div className="text-center py-10 bg-white/3 rounded-2xl border border-white/8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-white/50 font-medium">Belum ada riwayat setoran</p>
            <p className="text-xs text-white/35 mt-1">Setoran Anda akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
