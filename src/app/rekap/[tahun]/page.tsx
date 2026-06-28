import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

type Props = { params: Promise<{ tahun: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tahun } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from('rekap_tahunan').select('*').eq('tahun', parseInt(tahun)).maybeSingle();
  if (!data || !data.visible) return { title: 'Rekap Tidak Ditemukan' };
  const { data: setting } = await supabase.from('settings').select('value').eq('key', 'nama_masjid').maybeSingle();
  const namaMasjid = setting?.value || 'Masjid Baitul Marifah';
  return {
    title: `Rekap Qurban ${data.tahun} — ${namaMasjid}`,
    description: `Alhamdulillah, terkumpul Rp ${data.total_dana.toLocaleString('id-ID')} dengan total ${data.jumlah_peserta} jamaah qurban.`,
    openGraph: {
      title: `Laporan Penyaluran Qurban ${data.tahun} — ${namaMasjid}`,
      description: `Total ${data.jumlah_sapi} Sapi & ${data.jumlah_kambing} Kambing disalurkan.`,
      images: data.foto_urls?.length > 0 ? [data.foto_urls[0]] : [],
      type: 'website',
    },
  };
}

export default async function PublicRekapPage({ params }: Props) {
  const { tahun } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('rekap_tahunan')
    .select('*')
    .eq('tahun', parseInt(tahun))
    .maybeSingle();

  if (!data || !data.visible) notFound();

  const { data: setting } = await supabase.from('settings').select('value').eq('key', 'nama_masjid').maybeSingle();
  const namaMasjid = setting?.value || 'Masjid Baitul Marifah';
  const fotoUrls: string[] = Array.isArray(data.foto_urls) ? data.foto_urls : [];

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#C9A84C] via-[#B8973B] to-[#A8863A] text-white pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-black/20 rounded-full text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
            Laporan Transparansi
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-md">
            Rekap Qurban {data.tahun}
          </h1>
          <p className="text-lg md:text-xl opacity-90 font-medium">{namaMasjid}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        {/* Statistik Utama */}
        <div className="bg-[#1E293B] backdrop-blur-sm rounded-3xl border border-white/10 p-6 md:p-8 mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Total Dana</p>
            <p className="text-2xl font-black text-green-400">
              Rp {data.total_dana >= 1_000_000
                ? `${(data.total_dana / 1_000_000).toFixed(1)}Jt`
                : data.total_dana.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Jamaah Qurban</p>
            <p className="text-2xl font-black text-white">{data.jumlah_peserta} <span className="text-sm font-medium text-white/50">Orang</span></p>
          </div>
          <div className="text-center">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Hewan Sapi</p>
            <p className="text-2xl font-black text-white">{data.jumlah_sapi} <span className="text-sm font-medium text-white/50">Ekor</span></p>
          </div>
          <div className="text-center">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Hewan Kambing</p>
            <p className="text-2xl font-black text-white">{data.jumlah_kambing} <span className="text-sm font-medium text-white/50">Ekor</span></p>
          </div>
        </div>

        {/* Distribusi & Testimoni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
            <div className="w-12 h-12 bg-blue-900/40 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center text-xl mb-6">📍</div>
            <h3 className="text-xl font-bold text-white mb-3">Wilayah Distribusi</h3>
            <p className="text-white/60 leading-relaxed whitespace-pre-line">{data.wilayah_distribusi}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-6 right-6 text-7xl text-white/5 font-serif leading-none select-none">"</div>
            <div className="w-12 h-12 bg-orange-900/40 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center text-xl mb-6">💬</div>
            <h3 className="text-xl font-bold text-white mb-3">Kesan Penerima Manfaat</h3>
            <p className="text-white/60 italic leading-relaxed whitespace-pre-line relative z-10">{data.testimoni}</p>
          </div>
        </div>

        {/* Galeri Dokumentasi */}
        {fotoUrls.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-center text-white mb-8">📸 Galeri Dokumentasi</h2>
            <div className={`grid gap-4 ${fotoUrls.length === 1 ? 'grid-cols-1' : fotoUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
              {fotoUrls.map((url: string, i: number) => (
                <div key={i} className={`rounded-2xl overflow-hidden border border-white/10 bg-white/5 ${i === 0 && fotoUrls.length > 2 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''}`}>
                  <img src={url} alt={`Dokumentasi Qurban ${i + 1}`}
                    className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-12 text-white/30 text-sm">
          <p>Laporan transparansi qurban — {namaMasjid} {data.tahun}</p>
          <p className="mt-1 text-white/20 text-xs">Powered by BaitulMarifah App</p>
        </div>
      </div>
    </div>
  );
}
