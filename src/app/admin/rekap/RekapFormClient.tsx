'use client';

import { useState } from 'react';

const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition';

export default function RekapFormClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState<any>(initialData);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const currentFotos = Array.isArray(formData.foto_urls) ? formData.foto_urls : [];
    if (currentFotos.length >= 5) { alert('Maksimal 5 foto dokumentasi diperbolehkan.'); return; }
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran foto maksimal 5MB'); return; }

    setUploading(true);
    const bodyForm = new FormData();
    bodyForm.append('foto', file);
    try {
      const res = await fetch('/api/admin/rekap/upload', { method: 'POST', body: bodyForm });
      const result = await res.json();
      if (res.ok) setFormData({ ...formData, foto_urls: [...currentFotos, result.key] });
      else alert(result.error || 'Gagal mengunggah foto');
    } catch {
      alert('Kesalahan jaringan saat mengunggah foto');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const hapusFoto = (index: number) => {
    const newFotos = [...(formData.foto_urls || [])];
    newFotos.splice(index, 1);
    setFormData({ ...formData, foto_urls: newFotos });
  };

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent, visible: boolean) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/rekap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, visible }),
      });
      const result = await res.json();
      if (res.ok) {
        setFormData({ ...formData, visible });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else alert(result.error || 'Gagal menyimpan');
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const fotoUrls: string[] = Array.isArray(formData.foto_urls) ? formData.foto_urls : [];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 md:p-8 max-w-3xl">
      <div className="space-y-6">
        {/* Tahun & Peserta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">Tahun Laporan</label>
            <input type="number" name="tahun" value={formData.tahun} onChange={handleTextChange} required className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">Jumlah Jamaah Qurban</label>
            <input type="number" name="jumlah_peserta" value={formData.jumlah_peserta} onChange={handleTextChange} required className={INPUT_CLS} />
            <p className="text-xs text-white/30 mt-1">Dapat disesuaikan manual jika ada tambahan di luar sistem.</p>
          </div>
        </div>

        {/* Total Dana */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-1">Total Dana Qurban Terkumpul (Rp)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-white/40">Rp</span>
            <input type="number" name="total_dana" value={formData.total_dana} onChange={handleTextChange} required className={`${INPUT_CLS} pl-10`} />
          </div>
          {formData.total_dana > 0 && <p className="text-xs text-green-400 mt-1">= Rp {parseInt(formData.total_dana).toLocaleString('id-ID')}</p>}
        </div>

        {/* Jumlah Hewan */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">🐄 Jumlah Sapi</label>
            <input type="number" name="jumlah_sapi" value={formData.jumlah_sapi} onChange={handleTextChange} required className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1">🐐 Jumlah Kambing</label>
            <input type="number" name="jumlah_kambing" value={formData.jumlah_kambing} onChange={handleTextChange} required className={INPUT_CLS} />
          </div>
        </div>

        {/* Wilayah Distribusi */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-1">Wilayah Distribusi</label>
          <textarea name="wilayah_distribusi" value={formData.wilayah_distribusi} onChange={handleTextChange} rows={3}
            placeholder="Contoh: Desa Suka Maju RT 01-05, Panti Asuhan Al-Hidayah, Masjid sekitar..." required className={`${INPUT_CLS} resize-none`}></textarea>
        </div>

        {/* Testimoni */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-1">Testimoni / Kesan Penerima Manfaat</label>
          <textarea name="testimoni" value={formData.testimoni} onChange={handleTextChange} rows={3}
            placeholder="&quot;Alhamdulillah, daging qurbannya sangat bermanfaat untuk keluarga kami...&quot;" required className={`${INPUT_CLS} resize-none`}></textarea>
        </div>

        {/* Upload Foto */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2">Foto Dokumentasi (Maks 5)</label>
          <div className="flex flex-wrap gap-4 mb-3">
            {fotoUrls.map((url: string, idx: number) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl border border-white/10 overflow-hidden bg-white/5 group">
                <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => hapusFoto(idx)}
                  className="absolute inset-0 bg-black/60 text-white flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity text-lg">✕</button>
              </div>
            ))}
            {fotoUrls.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/30 cursor-pointer hover:bg-white/5 hover:border-[#C9A84C]/40 transition-all">
                {uploading ? <span className="text-xs text-white/50">Uploading...</span> : <span className="text-3xl">+</span>}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
              </label>
            )}
          </div>
          <p className="text-xs text-white/30">Unggah satu per satu. Disarankan foto landscape (horizontal). Maks 5MB/foto.</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row gap-4">
          <button type="button" onClick={(e) => handleSubmit(e, false)} disabled={loading}
            className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white/70 font-bold rounded-xl transition-colors disabled:opacity-50">
            Simpan Draf (Hidden)
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading}
            className="px-6 py-3 bg-[#C9A84C] hover:bg-[#D4B869] text-[#0F172A] font-bold rounded-xl transition-colors flex-1 disabled:opacity-50">
            {loading ? 'Menyimpan...' : formData.visible ? '✓ Perbarui Publikasi' : '✨ Publish ke Publik'}
          </button>
        </div>

        {saved && (
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-xl text-sm text-green-300">
            ✅ Berhasil disimpan!
          </div>
        )}

        {formData.visible && (
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-sm text-green-300">
            ✅ Laporan ini sedang <strong>aktif dan publik</strong>. Lihat di{' '}
            <a href={`/rekap/${formData.tahun}`} target="_blank" className="underline font-bold text-green-400">
              /rekap/{formData.tahun}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
