'use client';

import { useState, useEffect } from 'react';

export default function AdminHewanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const fetchHewan = async () => {
    try {
      const res = await fetch('/api/public/hewan');
      const json = await res.json();
      if (res.ok) setData(json.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHewan(); }, []);

  const handleSubmit = async (e: React.FormEvent, urutan: number) => {
    e.preventDefault();
    setActionLoading(urutan);
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const res = await fetch(`/api/admin/hewan/${urutan}`, { method: 'POST', body: formData });
      const result = await res.json();
      if (res.ok) { fetchHewan(); }
      else alert(result.error || 'Gagal memperbarui');
    } catch { alert('Terjadi kesalahan jaringan'); }
    finally { setActionLoading(null); }
  };

  const INPUT_CLS = 'w-full px-3 py-2 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]';

  if (loading) return <div className="p-10 text-center text-white/40">Memuat status hewan...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Manajemen Status Hewan</h1>
        <p className="text-white/50 text-sm mt-1">Perbarui progres penyediaan hewan qurban.<br />Hanya satu fase yang dapat aktif pada satu waktu.</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <p className="text-white/50 mb-4">Belum ada fase hewan. Buat fase awal di SQL Editor Supabase:</p>
          <pre className="text-xs text-[#C9A84C] bg-black/30 p-4 rounded-xl text-left overflow-auto">{`INSERT INTO hewan_fase (urutan, label, deskripsi, aktif) VALUES
(1, 'Pencarian & Seleksi Hewan', 'Panitia sedang mencari hewan qurban terbaik', true),
(2, 'Pembayaran & Pembelian', 'Transaksi pembelian hewan qurban dilakukan', false),
(3, 'Hewan Diterima & Dirawat', 'Hewan sudah tiba dan dalam perawatan', false),
(4, 'Hari Penyembelihan', 'Proses penyembelihan sesuai syariat Islam', false),
(5, 'Distribusi Daging', 'Distribusi daging ke mustahiq dan peserta', false),
(6, 'Selesai', 'Proses qurban telah selesai 100%', false);`}</pre>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {data.map((fase) => (
            <div key={fase.urutan} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
              {/* Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-sm transition-all mt-3 ${fase.aktif ? 'bg-[#C9A84C] border-[#C9A84C]/30 text-[#0F172A] shadow-lg shadow-[#C9A84C]/30' : 'bg-white/10 border-white/5 text-white/40'}`}>
                {fase.aktif ? '✓' : fase.urutan}
              </div>
              {/* Card */}
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border backdrop-blur-sm transition-all ${fase.aktif ? 'bg-[#C9A84C]/5 border-[#C9A84C]/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white text-lg">Fase {fase.urutan}</h3>
                  {fase.aktif && <span className="bg-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-bold uppercase px-2 py-1 rounded-md border border-[#C9A84C]/30 animate-pulse">Aktif Saat Ini</span>}
                </div>
                <form onSubmit={(e) => handleSubmit(e, fase.urutan)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase mb-1">Label Fase</label>
                    <input type="text" name="label" defaultValue={fase.label} required className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase mb-1">Deskripsi</label>
                    <textarea name="deskripsi" defaultValue={fase.deskripsi} required rows={2} className={`${INPUT_CLS} resize-none`}></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase mb-1">Foto Dokumentasi <span className="text-white/20 normal-case font-normal">(Opsional)</span></label>
                    {fase.foto_url && (
                      <div className="mb-2">
                        <img src={fase.foto_url} alt="Foto" className="h-24 w-auto rounded-lg border border-white/10 object-cover" />
                      </div>
                    )}
                    <input type="file" name="foto" accept="image/*" className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white/70 hover:file:bg-white/15" />
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="aktif" value="true" defaultChecked={fase.aktif} className="w-4 h-4 accent-[#C9A84C] rounded" />
                      <span className="text-sm font-medium text-white">Jadikan Fase Aktif</span>
                    </label>
                    <button type="submit" disabled={actionLoading === fase.urutan} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                      {actionLoading === fase.urutan ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
