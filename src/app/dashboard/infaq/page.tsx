'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

function MilestoneCapaian({ donatur, riwayat }: { donatur: any; riwayat: any[] }) {
  const tahunIni = new Date().getFullYear();
  const targetTahunan = donatur.nominal_komitmen * 12;
  const totalRealisasi = riwayat
    .filter(r => new Date(r.bulan).getFullYear() === tahunIni)
    .reduce((sum, r) => sum + (r.nominal_realisasi || 0), 0);
  const persen = Math.min(100, Math.round((totalRealisasi / targetTahunan) * 100));
  const bulanTercapai = riwayat.filter(r => new Date(r.bulan).getFullYear() === tahunIni).length;

  return (
    <div className="mb-4 bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-white">🎯 Capaian Target {tahunIni}</p>
        <span className="text-xs font-bold text-[#C9A84C]">{persen}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-2">
        <div className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8CD7A] transition-all duration-700"
          style={{ width: `${persen}%` }} />
      </div>
      <div className="flex justify-between text-xs text-white/50">
        <span>{fmt(totalRealisasi)} terkumpul</span>
        <span>Target {fmt(targetTahunan)}</span>
      </div>

      {/* Milestone bulan */}
      <div className="grid grid-cols-12 gap-1 mt-3">
        {Array.from({ length: 12 }, (_, i) => {
          const bulanKe = i + 1;
          const tercapai = bulanKe <= bulanTercapai;
          return (
            <div key={i} className={`h-1.5 rounded-full ${tercapai ? 'bg-[#C9A84C]' : 'bg-white/10'}`}
              title={`Bulan ${bulanKe}`} />
          );
        })}
      </div>
      <p className="text-[10px] text-white/30 mt-1.5">{bulanTercapai} dari 12 bulan tercatat tahun ini</p>
    </div>
  );
}

export default function InfaqPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'insidentil' | 'donatur_tetap'>('insidentil');
  const [donaturData, setDonaturData] = useState<any>(null);
  const [riwayatRealisasi, setRiwayatRealisasi] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<Record<string, string>>({});
  const [showDaftar, setShowDaftar] = useState(false);
  const [daftarLoading, setDaftarLoading] = useState(false);
  const [daftarError, setDaftarError] = useState('');

  const now = new Date();
  const maxDate = now.toISOString().split('T')[0];
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [bulanRealisasi, setBulanRealisasi] = useState(defaultBulan);

  useEffect(() => {
    Promise.all([
      fetch('/api/jamaah/donatur').then(r => r.json()),
      fetch('/api/public/settings').then(r => r.json()),
    ]).then(([donaturJson, settingsJson]) => {
      if (donaturJson.donatur) setDonaturData(donaturJson.donatur);
      if (donaturJson.riwayat) setRiwayatRealisasi(donaturJson.riwayat);
      if (settingsJson.settings) setBankInfo(settingsJson.settings);
      setLoadingData(false);
    }).catch(() => setLoadingData(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPreview(file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  };

  const handleSubmitSetoran = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    const kategori = tab === 'donatur_tetap' ? 'donatur_tetap' : 'infaq';
    formData.set('kategori', kategori);
    if (tab === 'donatur_tetap') formData.set('bulan_realisasi', bulanRealisasi + '-01');
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

  const handleDaftarDonatur = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDaftarLoading(true);
    setDaftarError('');
    const fd = new FormData(e.currentTarget);
    const body = {
      nominal_komitmen: Number(fd.get('nominal_komitmen')),
      metode_bayar: fd.get('metode_bayar'),
      mulai_bulan: fd.get('mulai_bulan'),
      keterangan: fd.get('keterangan'),
    };
    try {
      const res = await fetch('/api/jamaah/donatur', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setDaftarError(data.error || 'Gagal mendaftar'); setDaftarLoading(false); return; }
      setDonaturData(data.donatur);
      setShowDaftar(false);
    } catch {
      setDaftarError('Terjadi kesalahan jaringan');
    } finally {
      setDaftarLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center mt-10">
        <div className="w-16 h-16 bg-green-900/40 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Laporan Terkirim!</h2>
        <p className="text-white/60 mb-6">
          {tab === 'donatur_tetap' ? 'Bukti pembayaran donatur tetap sedang menunggu konfirmasi admin.' : 'Bukti setoran infaq sedang menunggu konfirmasi admin.'}
        </p>
        <button onClick={() => { setSuccess(false); setPreview(null); }} className="w-full py-3 mb-3 border border-white/15 text-white/60 font-semibold rounded-xl hover:bg-white/5">
          Lapor Lagi
        </button>
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
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-xl">🤲</div>
          <div>
            <h1 className="text-xl font-bold text-white">Infaq &amp; Shadaqah</h1>
            <p className="text-white/40 text-xs">Insidentil &amp; Donatur Tetap</p>
          </div>
        </div>
      </header>

      {/* Tab */}
      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => { setTab('insidentil'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${tab === 'insidentil' ? 'border-blue-500 bg-blue-900/30 text-blue-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
          💰 Infaq Insidentil
        </button>
        <button type="button" onClick={() => { setTab('donatur_tetap'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${tab === 'donatur_tetap' ? 'border-green-500 bg-green-900/30 text-green-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
          🤝 Donatur Tetap
        </button>
      </div>

      {/* Info Donatur Tetap */}
      {tab === 'donatur_tetap' && !loadingData && (
        <>
          {donaturData ? (
            <>
              <div className="mb-4 bg-green-900/20 border border-green-500/20 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-green-300 font-bold text-sm">✅ Terdaftar sebagai Donatur Tetap</p>
                    <p className="text-white/50 text-xs mt-0.5">Komitmen: <strong className="text-white">{fmt(donaturData.nominal_komitmen)}</strong>/bulan</p>
                    {donaturData.metode_bayar && <p className="text-white/40 text-xs">Metode: {donaturData.metode_bayar}</p>}
                  </div>
                </div>
              </div>
              <MilestoneCapaian donatur={donaturData} riwayat={riwayatRealisasi} />
            </>
          ) : (
            <div className="mb-4 bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-yellow-300 font-bold text-sm mb-1">Belum Terdaftar Donatur Tetap</p>
              <p className="text-white/50 text-xs mb-3">Daftar terlebih dahulu untuk bisa melaporkan pembayaran donatur tetap.</p>
              <button onClick={() => setShowDaftar(!showDaftar)}
                className="text-xs font-bold text-yellow-300 border border-yellow-500/40 px-3 py-1.5 rounded-lg bg-yellow-900/30 hover:bg-yellow-900/50 transition-colors">
                {showDaftar ? 'Batal' : '+ Daftar Donatur Tetap'}
              </button>
            </div>
          )}

          {/* Form daftar donatur */}
          {showDaftar && !donaturData && (
            <form onSubmit={handleDaftarDonatur} className="mb-5 space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-2">Formulir Pendaftaran Donatur Tetap</h3>
              {daftarError && <p className="text-red-300 text-xs">{daftarError}</p>}
              <div>
                <label className="block text-xs text-white/60 mb-1">Nominal Komitmen per Bulan (Rp)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40 text-sm">Rp</span>
                  <input type="number" name="nominal_komitmen" required min="10000"
                    className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/15 text-white text-sm rounded-lg focus:ring-1 focus:ring-[#C9A84C] outline-none"
                    placeholder="50000" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Mulai Bulan</label>
                <input type="month" name="mulai_bulan" required defaultValue={defaultBulan}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white text-sm rounded-lg focus:ring-1 focus:ring-[#C9A84C] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Metode Pembayaran</label>
                <select name="metode_bayar" className="w-full px-3 py-2.5 bg-[#0F172A] border border-white/15 text-white text-sm rounded-lg focus:ring-1 focus:ring-[#C9A84C] outline-none">
                  <option value="transfer">Transfer Bank</option>
                  <option value="qris">QRIS</option>
                  <option value="tunai">Tunai</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Keterangan (Opsional)</label>
                <textarea name="keterangan" rows={2}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white text-sm placeholder:text-white/25 rounded-lg focus:ring-1 focus:ring-[#C9A84C] outline-none"
                  placeholder="Misal: Infaq untuk kegiatan masjid" />
              </div>
              <button type="submit" disabled={daftarLoading}
                className="w-full py-2.5 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50">
                {daftarLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}
        </>
      )}

      {tab === 'insidentil' && (
        <div className="mb-4 p-3 rounded-xl text-xs bg-blue-900/20 border border-blue-500/20 text-blue-300">
          💰 Setoran infaq akan dicatat ke kas masjid setelah dikonfirmasi admin.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 mb-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{errorMsg}</div>
      )}

      {/* Bulan realisasi donatur */}
      {tab === 'donatur_tetap' && donaturData && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-1">Bulan Pembayaran</label>
          <input type="month" value={bulanRealisasi} onChange={e => setBulanRealisasi(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none" />
        </div>
      )}

      {/* Info Rekening */}
      {(bankInfo.no_rekening_bsi || bankInfo.info_qris) && (
        <div className="mb-4 space-y-2">
          {bankInfo.no_rekening_bsi && (
            <div className="flex items-center gap-3 bg-[#1E293B] border border-[#C9A84C]/20 rounded-xl p-3">
              <span className="text-xl">🏦</span>
              <div>
                <p className="text-[10px] text-white/40">Transfer ke BSI</p>
                <p className="text-white font-bold text-sm">{bankInfo.no_rekening_bsi}</p>
                <p className="text-white/50 text-xs">a.n. {bankInfo.nama_rekening || 'Masjid'}</p>
              </div>
            </div>
          )}
          {bankInfo.qris_image_url ? (
            <div className="bg-[#1E293B] border border-white/10 rounded-xl p-4 flex flex-col items-center">
              <p className="text-[10px] text-white/40 self-start mb-2">📱 Scan QRIS untuk bayar</p>
              <div className="bg-white p-3 rounded-xl">
                <img src={bankInfo.qris_image_url} alt="QRIS Masjid" className="w-56 h-56 object-contain" />
              </div>
              {bankInfo.info_qris && <p className="text-white/50 text-xs mt-2 text-center">{bankInfo.info_qris}</p>}
            </div>
          ) : bankInfo.info_qris ? (
            <div className="flex items-center gap-3 bg-[#1E293B] border border-white/10 rounded-xl p-3">
              <span className="text-xl">📱</span>
              <div>
                <p className="text-[10px] text-white/40">QRIS</p>
                <p className="text-white/70 text-sm">{bankInfo.info_qris}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Form setoran — tampil selalu untuk insidentil, donatur tetap hanya jika terdaftar */}
      {(tab === 'insidentil' || (tab === 'donatur_tetap' && donaturData)) && (
        <form onSubmit={handleSubmitSetoran} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Jumlah {tab === 'donatur_tetap' ? 'Pembayaran' : 'Infaq'} (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/50 font-medium text-sm">Rp</span>
              <input type="number" name="jumlah" required min="10000"
                defaultValue={tab === 'donatur_tetap' && donaturData ? donaturData.nominal_komitmen : ''}
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
              placeholder={tab === 'donatur_tetap' ? 'Opsional' : 'Misal: Infaq Jumat'} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
            {loading
              ? <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Memproses...</>
              : tab === 'donatur_tetap' ? '🤝 Kirim Bukti Pembayaran' : '🤲 Kirim Laporan Infaq'
            }
          </button>
        </form>
      )}
    </div>
  );
}
