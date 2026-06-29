'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function KurbanSetoranPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<Record<string, string>>({});

  const now = new Date();
  const maxDate = now.toISOString().split('T')[0];

  useEffect(() => {
    fetch('/api/jamaah/profil').then(r => r.json()).then(j => setProfile(j.profile || null)).catch(() => {});
    fetch('/api/public/settings').then(r => r.json()).then(j => { if (j.settings) setBankInfo(j.settings); }).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPreview(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    formData.set('kategori', 'kurban');
    try {
      const res = await fetch('/api/jamaah/setoran', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Gagal melaporkan setoran'); setLoading(false); return; }
      setSuccess(true);
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center mt-10">
        <div className="w-16 h-16 bg-green-900/40 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Laporan Terkirim!</h2>
        <p className="text-white/60 mb-6">Bukti setoran tabungan qurban Anda sedang menunggu konfirmasi admin.</p>
        <button onClick={() => router.push('/dashboard/riwayat')} className="w-full py-4 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors">
          Lihat Riwayat
        </button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <header className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl">🐄</div>
          <div>
            <h1 className="text-xl font-bold text-white">Lapor Setoran Qurban</h1>
            <p className="text-white/40 text-xs">Tabungan &amp; Patungan Kurban</p>
          </div>
        </div>
      </header>

      {/* Info paket */}
      {profile?.paket_id ? (
        <div className="mb-4 p-3 rounded-xl text-xs bg-amber-900/20 border border-amber-500/20 text-amber-300">
          🐄 Setoran akan ditambahkan ke saldo tabungan qurban Anda setelah dikonfirmasi admin.
        </div>
      ) : (
        <div className="mb-5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-4">
          <p className="text-[#C9A84C] font-bold text-sm mb-1">⚠️ Belum Terdaftar Paket Qurban</p>
          <p className="text-white/60 text-xs mb-3">
            Anda belum terdaftar dalam program tabungan atau patungan qurban. Hubungi admin/panitia untuk bergabung, kemudian bisa mulai melaporkan setoran.
          </p>
          <Link href="/dashboard" className="text-xs text-[#C9A84C] underline">← Kembali ke Beranda</Link>
        </div>
      )}

      {/* Saldo saat ini */}
      {profile && (
        <div className="mb-5 bg-[#1E293B] border border-[#C9A84C]/20 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-white/40">Saldo Tabungan Qurban</p>
            <p className="text-lg font-bold text-[#C9A84C]">{fmt(profile.saldo || 0)}</p>
          </div>
          {profile.paket?.harga_target && (
            <div className="text-right">
              <p className="text-xs text-white/40">Target</p>
              <p className="text-sm font-semibold text-white/70">{fmt(profile.paket.harga_target)}</p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 mb-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{errorMsg}</div>
      )}

      {/* Info Rekening */}
      {(bankInfo.no_rekening_bsi || bankInfo.info_qris) && (
        <div className="mb-4 space-y-2">
          {bankInfo.no_rekening_bsi && (
            <div className="flex items-center gap-3 bg-[#1E293B] border border-[#C9A84C]/20 rounded-xl p-3">
              <span className="text-xl flex-shrink-0">🏦</span>
              <div>
                <p className="text-[10px] text-white/40">Transfer ke BSI</p>
                <p className="text-white font-bold text-sm">{bankInfo.no_rekening_bsi}</p>
                <p className="text-white/50 text-xs">a.n. {bankInfo.nama_rekening || 'Masjid'}</p>
              </div>
            </div>
          )}
          {bankInfo.info_qris && (
            <div className="flex items-center gap-3 bg-[#1E293B] border border-white/10 rounded-xl p-3">
              <span className="text-xl flex-shrink-0">📱</span>
              <div>
                <p className="text-[10px] text-white/40">QRIS</p>
                <p className="text-white/70 text-sm">{bankInfo.info_qris}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form setoran — selalu tampil */}
      {profile !== null && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Jumlah Setoran (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/50 font-medium text-sm">Rp</span>
              <input type="number" name="jumlah" required min="10000"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none"
                placeholder="50000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Tanggal Transfer</label>
            <input type="date" name="tanggal_setor" required max={maxDate} defaultValue={maxDate}
              className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Bukti Transfer <span className="text-red-400">*</span></label>
            <p className="text-xs text-white/40 mb-2">Format: JPG, PNG. Maks: 5MB</p>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer bg-white/3 border-white/15 hover:bg-white/5 transition-colors overflow-hidden relative">
              {preview && <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
              <div className="flex flex-col items-center justify-center relative z-10">
                <svg className="w-7 h-7 mb-1 text-white/40" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                <p className="text-sm text-white/50 font-medium">{preview ? 'Ganti File' : 'Ketuk untuk pilih file'}</p>
              </div>
              <input type="file" name="bukti" className="hidden" required accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Catatan (Opsional)</label>
            <textarea name="catatan" rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none"
              placeholder="Misal: Setoran minggu ke-3" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
            {loading
              ? <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Memproses...</>
              : '🐄 Kirim Laporan Qurban'
            }
          </button>
        </form>
      )}
    </div>
  );
}
