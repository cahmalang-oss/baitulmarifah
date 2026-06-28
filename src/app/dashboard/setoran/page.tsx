'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<Record<string, string>>({});

  const maxDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(j => { if (j.settings) setBankInfo(j.settings); })
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/jamaah/setoran`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal melaporkan setoran');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center mt-10">
        <div className="w-16 h-16 bg-green-900/40 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Laporan Terkirim!</h2>
        <p className="text-white/60 mb-6">Bukti setoran Anda sedang menunggu konfirmasi dari Admin.</p>
        <button
          onClick={() => router.push(`/dashboard/riwayat`)}
          className="w-full py-4 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors shadow-lg shadow-[#C9A84C]/20"
        >
          Lihat Riwayat
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Lapor Setoran</h1>
        <p className="text-white/50 text-sm mt-1">Unggah bukti transfer untuk ditambahkan ke saldo.</p>
      </header>

      {errorMsg && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {/* Info Transfer */}
      {(bankInfo.no_rekening_bsi || bankInfo.info_qris) && (
        <div className="mb-6 space-y-3">
          {bankInfo.no_rekening_bsi && (
            <div className="flex items-center gap-3 bg-[#1E293B] border border-[#C9A84C]/20 rounded-xl p-4">
              <div className="w-10 h-10 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏦</div>
              <div>
                <p className="text-xs text-white/40 font-medium">Transfer ke BSI</p>
                <p className="text-white font-bold">{bankInfo.no_rekening_bsi}</p>
                <p className="text-white/60 text-xs">a.n. {bankInfo.nama_rekening || 'Masjid'}</p>
              </div>
            </div>
          )}
          {bankInfo.info_qris && (
            <div className="flex items-center gap-3 bg-[#1E293B] border border-white/10 rounded-xl p-4">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📱</div>
              <div>
                <p className="text-xs text-white/40 font-medium">QRIS</p>
                <p className="text-white/70 text-sm">{bankInfo.info_qris}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Jumlah Setoran (Rp)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/50 font-medium">Rp</span>
            <input
              type="number"
              name="jumlah"
              required
              min="10000"
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
              placeholder="50000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Tanggal Transfer</label>
          <input
            type="date"
            name="tanggal_setor"
            required
            max={maxDate}
            defaultValue={maxDate}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Unggah Bukti Transfer <span className="text-red-400">*</span></label>
          <p className="text-xs text-white/40 mb-2">Format: JPG, PNG. Maks: 5MB</p>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-white/3 border-white/15 hover:bg-white/5 transition-colors overflow-hidden relative">
              {preview ? (
                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              ) : null}
              <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                <svg className="w-8 h-8 mb-2 text-white/40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="text-sm text-white/50 font-semibold">{preview ? 'Ganti File' : 'Ketuk untuk pilih file'}</p>
              </div>
              <input
                type="file"
                name="bukti"
                className="hidden"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Catatan (Opsional)</label>
          <textarea
            name="catatan"
            rows={2}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
            placeholder="Misal: Setoran minggu pertama"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl shadow-lg hover:bg-[#D4B869] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? (
             <><svg className="animate-spin h-5 w-5 text-[#0F172A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...</>
          ) : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  );
}
