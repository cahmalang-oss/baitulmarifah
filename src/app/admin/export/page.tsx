'use client';

import { useState } from 'react';

const INPUT_CLS = 'w-full px-3 py-2 bg-white/5 border border-white/15 text-white rounded-lg outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm';

const tahunIni = new Date().getFullYear();
const bulanIni = `${tahunIni}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

function DownloadButtons({ csvUrl, xlsxUrl, pdfUrl }: { csvUrl: string; xlsxUrl: string; pdfUrl: string }) {
  return (
    <div className="space-y-2">
      <button onClick={() => window.open(csvUrl, '_blank')}
        className="w-full py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
        ⬇️ Download CSV
      </button>
      <button onClick={() => window.open(xlsxUrl, '_blank')}
        className="w-full py-2.5 bg-green-900/40 hover:bg-green-900/60 text-green-300 border border-green-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
        📊 Download Excel (.xlsx)
      </button>
      <button onClick={() => window.open(pdfUrl, '_blank')}
        className="w-full py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
        🖨️ Cetak / Simpan PDF
      </button>
    </div>
  );
}

export default function ExportPage() {
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [tahunInfaq, setTahunInfaq] = useState(String(tahunIni));
  const [bulanInfaq, setBulanInfaq] = useState(bulanIni);
  const [modeInfaq, setModeInfaq] = useState<'bulan' | 'tahun'>('bulan');

  const setoranQuery = () => {
    const q = new URLSearchParams();
    if (dari) q.append('dari', dari);
    if (sampai) q.append('sampai', sampai);
    return q.toString();
  };

  const infaqQuery = () => {
    const q = new URLSearchParams();
    if (modeInfaq === 'bulan') q.append('bulan', bulanInfaq);
    else q.append('tahun', tahunInfaq);
    return q.toString();
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C]/70 text-xs uppercase tracking-widest font-semibold mb-1">Laporan</p>
        <h1 className="text-2xl font-bold text-white">Export Laporan</h1>
        <p className="text-white/40 text-sm mt-1">
          Unduh data dalam format CSV, Excel, atau PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Export Jamaah */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 bg-blue-900/40 text-blue-400 rounded-xl flex items-center justify-center text-2xl">👥</div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Data Jamaah</h2>
            <p className="text-sm text-white/50">Daftar seluruh jamaah: nama, no WA, paket, saldo, dan tanggal daftar.</p>
          </div>
          <div className="mt-auto pt-4 border-t border-white/10">
            <p className="text-xs text-white/30 mb-3">Kolom: Nama, No WA, Email, Paket, Saldo, Tgl Daftar</p>
            <DownloadButtons
              csvUrl="/api/admin/export/jamaah"
              xlsxUrl="/api/admin/export/jamaah?format=xlsx"
              pdfUrl="/api/admin/export/pdf?jenis=jamaah"
            />
          </div>
        </div>

        {/* Export Setoran */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 bg-amber-900/40 text-amber-400 rounded-xl flex items-center justify-center text-2xl">💰</div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Riwayat Setoran</h2>
            <p className="text-sm text-white/50">Data setoran berdasarkan rentang tanggal. Kosongkan untuk semua data.</p>
          </div>
          <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
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
            <p className="text-xs text-white/30">Kolom: Tanggal, Nama, No WA, Jumlah, Status, Diverifikasi</p>
            <DownloadButtons
              csvUrl={`/api/admin/export/setoran?${setoranQuery()}`}
              xlsxUrl={`/api/admin/export/setoran?${setoranQuery()}&format=xlsx`}
              pdfUrl={`/api/admin/export/pdf?jenis=setoran&${setoranQuery()}`}
            />
          </div>
        </div>

        {/* Export Infaq */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 bg-purple-900/40 text-purple-400 rounded-xl flex items-center justify-center text-2xl">💚</div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Transaksi Infaq</h2>
            <p className="text-sm text-white/50">Data kas infaq per bulan atau per tahun.</p>
          </div>
          <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
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
            <DownloadButtons
              csvUrl={`/api/admin/export/infaq?${infaqQuery()}`}
              xlsxUrl={`/api/admin/export/infaq?${infaqQuery()}&format=xlsx`}
              pdfUrl={`/api/admin/export/pdf?jenis=infaq&${infaqQuery()}`}
            />
          </div>
        </div>
      </div>

      <p className="text-white/30 text-xs text-center mt-8">
        💡 Tombol <strong className="text-white/50">Cetak / Simpan PDF</strong> membuka halaman cetak di tab baru — pilih <em>Simpan sebagai PDF</em> di dialog print browser.
      </p>
    </div>
  );
}
