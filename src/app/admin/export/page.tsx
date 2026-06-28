'use client';

import { useState } from 'react';

const INPUT_CLS = 'w-full px-3 py-2 bg-white/5 border border-white/15 text-white rounded-lg outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm';

const tahunIni = new Date().getFullYear();
const bulanIni = `${tahunIni}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

export default function ExportPage() {
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [tahunInfaq, setTahunInfaq] = useState(String(tahunIni));
  const [bulanInfaq, setBulanInfaq] = useState(bulanIni);
  const [modeInfaq, setModeInfaq] = useState<'bulan' | 'tahun'>('bulan');

  const handleExportJamaah = () => window.open('/api/admin/export/jamaah', '_blank');

  const handleExportSetoran = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (dari) query.append('dari', dari);
    if (sampai) query.append('sampai', sampai);
    window.open(`/api/admin/export/setoran?${query.toString()}`, '_blank');
  };

  const handleExportInfaq = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (modeInfaq === 'bulan') query.append('bulan', bulanInfaq);
    else query.append('tahun', tahunInfaq);
    window.open(`/api/admin/export/infaq?${query.toString()}`, '_blank');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Export Laporan CSV</h1>
        <p className="text-white/50 text-sm mt-1">
          Unduh data dalam format CSV — kompatibel dengan Microsoft Excel dan Google Sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Export Jamaah */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
          <div className="w-12 h-12 bg-blue-900/40 text-blue-400 rounded-xl flex items-center justify-center text-2xl">👥</div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Data Jamaah</h2>
            <p className="text-sm text-white/50">Daftar seluruh jamaah: nama, no WA, paket, saldo, dan tanggal daftar.</p>
          </div>
          <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
            <p className="text-xs text-white/30">Kolom: Nama, No WA, Email, Paket, Saldo, Tgl Daftar</p>
            <button onClick={handleExportJamaah}
              className="w-full py-3 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              ⬇️ Download CSV Jamaah
            </button>
          </div>
        </div>

        {/* Export Setoran */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
          <div className="w-12 h-12 bg-emerald-900/40 text-emerald-400 rounded-xl flex items-center justify-center text-2xl">💰</div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Riwayat Setoran</h2>
            <p className="text-sm text-white/50">Data setoran berdasarkan rentang tanggal. Kosongkan untuk semua data.</p>
          </div>
          <form onSubmit={handleExportSetoran} className="mt-auto pt-4 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase mb-1">Dari</label>
                <input type="date" value={dari} onChange={e => setDari(e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase mb-1">Sampai</label>
                <input type="date" value={sampai} onChange={e => setSampai(e.target.value)} className={INPUT_CLS} />
              </div>
            </div>
            <p className="text-xs text-white/30">Kolom: Tanggal, Nama, No WA, Jumlah, Status, Diverifikasi Oleh</p>
            <button type="submit"
              className="w-full py-3 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              ⬇️ Download CSV Setoran
            </button>
          </form>
        </div>

        {/* Export Infaq */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
          <div className="w-12 h-12 bg-purple-900/40 text-purple-400 rounded-xl flex items-center justify-center text-2xl">💚</div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Transaksi Infaq</h2>
            <p className="text-sm text-white/50">Data kas infaq per bulan atau per tahun dari kas_transaksi.</p>
          </div>
          <form onSubmit={handleExportInfaq} className="mt-auto pt-4 border-t border-white/10 space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setModeInfaq('bulan')}
                className={`flex-1 py-1.5 text-sm font-bold rounded-lg border transition-colors ${modeInfaq === 'bulan' ? 'bg-[#C9A84C]/20 border-[#C9A84C]/40 text-[#C9A84C]' : 'border-white/15 text-white/40'}`}>
                Per Bulan
              </button>
              <button type="button" onClick={() => setModeInfaq('tahun')}
                className={`flex-1 py-1.5 text-sm font-bold rounded-lg border transition-colors ${modeInfaq === 'tahun' ? 'bg-[#C9A84C]/20 border-[#C9A84C]/40 text-[#C9A84C]' : 'border-white/15 text-white/40'}`}>
                Per Tahun
              </button>
            </div>
            {modeInfaq === 'bulan' ? (
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase mb-1">Bulan</label>
                <input type="month" value={bulanInfaq} onChange={e => setBulanInfaq(e.target.value)} className={INPUT_CLS} />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase mb-1">Tahun</label>
                <input type="number" value={tahunInfaq} min="2020" max="2099" onChange={e => setTahunInfaq(e.target.value)} className={INPUT_CLS} />
              </div>
            )}
            <p className="text-xs text-white/30">Kolom: Tanggal, Kategori, Jenis, Nominal, Sumber, Catatan</p>
            <button type="submit"
              className="w-full py-3 bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              ⬇️ Download CSV Infaq
            </button>
          </form>
        </div>
      </div>

      <p className="text-white/30 text-xs text-center mt-8">
        💡 Buka file CSV di Excel dengan memilih <strong className="text-white/50">Data → From Text/CSV</strong> agar format angka benar.
      </p>
    </div>
  );
}
