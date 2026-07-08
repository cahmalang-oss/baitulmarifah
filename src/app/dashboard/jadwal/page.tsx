import { createAdminClient } from '@/lib/supabase/admin';
import { requireJamaah } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';

export default async function JadwalPage() {
  const payload = await requireJamaah();
  if (payload instanceof Response) redirect('/login');

  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  const [{ data: kajian }, { data: pengumuman }] = await Promise.all([
    supabase.from('jadwal_kajian')
      .select('id, judul, pemateri, tanggal, waktu, lokasi, keterangan, mode_tampil, flyer_url, foto_penceramah_url')
      .eq('aktif', true)
      .gte('tanggal', today)
      .order('tanggal', { ascending: true })
      .order('waktu', { ascending: true, nullsFirst: false })
      .limit(10),
    supabase.from('pengumuman')
      .select('id, judul, isi, flyer_url, urutan')
      .eq('aktif', true)
      .order('urutan', { ascending: true }),
  ]);

  const fmtTanggal = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-5 pb-24 space-y-6">
      <header>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-xl">📅</div>
          <div>
            <h1 className="text-xl font-bold text-white">Jadwal &amp; Pengumuman</h1>
            <p className="text-white/40 text-xs">Kajian mendatang &amp; info masjid</p>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-sm font-bold text-white mb-3">📚 Jadwal Kajian</h2>
        <div className="space-y-3">
          {kajian && kajian.length > 0 ? (
            kajian.map(k => (
              <div key={k.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {k.mode_tampil === 'flyer' && k.flyer_url && (
                  <img src={k.flyer_url} alt={k.judul || 'Flyer kajian'} className="w-full object-cover max-h-72" />
                )}
                <div className="p-4">
                  {k.mode_tampil === 'manual_foto' && k.foto_penceramah_url && (
                    <img src={k.foto_penceramah_url} alt={k.pemateri || ''} className="w-14 h-14 rounded-full object-cover mb-2" />
                  )}
                  {(k.judul || k.mode_tampil !== 'flyer') && <p className="text-white font-bold">{k.judul || '—'}</p>}
                  {k.pemateri && <p className="text-[#C9A84C] text-sm mt-0.5">{k.pemateri}</p>}
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#C9A84C]/15 text-[#E8CD7A]">
                      📅 {fmtTanggal(k.tanggal)}
                    </span>
                    {k.waktu && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300">
                        🕐 {k.waktu.slice(0, 5)} WIB
                      </span>
                    )}
                  </div>
                  {k.lokasi && <p className="text-white/40 text-xs mt-2">📍 {k.lokasi}</p>}
                  {k.keterangan && <p className="text-white/50 text-xs mt-2">{k.keterangan}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/8">
              <p className="text-sm text-white/40">Belum ada jadwal kajian mendatang</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-white mb-3">📢 Pengumuman</h2>
        <div className="space-y-3">
          {pengumuman && pengumuman.length > 0 ? (
            pengumuman.map(p => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {p.flyer_url && <img src={p.flyer_url} alt={p.judul || 'Flyer pengumuman'} className="w-full object-cover max-h-72" />}
                <div className="p-4">
                  {p.judul && <p className="text-white font-bold mb-1">{p.judul}</p>}
                  {p.isi && <p className="text-white/60 text-sm whitespace-pre-line">{p.isi}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/8">
              <p className="text-sm text-white/40">Belum ada pengumuman</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
