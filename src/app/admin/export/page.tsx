'use client';

import { useState } from 'react';

const INPUT_CLS = 'w-full px-3 py-2 bg-white/5 border border-white/15 text-white rounded-lg outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm';

const tahunIni = new Date().getFullYear();
const bulanIni = `${tahunIni}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

function Btns({ base }: { base: string }) {
  return (
    <div className="space-y-2">
      <button onClick={() => window.open(`${base}&format=csv`, '_blank')}
        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/15 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
        ⬇️ CSV
      </button>
      <button onClick={() => window.open(`${base}&format=xlsx`, '_blank')}
        className="w-full py-2.5 bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
        📊 Excel (.xlsx)
      </button>
      <button onClick={() => window.open(`${base}&format=pdf`, '_blank')}
        className="w-full py-2.5 bg-red-900/20 hover:bg-red-900/40 text-red-300 border border-red-500/30 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
        🖨️ Cetak / PDF
      </button>
    </div>
  );
}

function DateRangeFilter({ dari, setDari, sampai, setSampai }: {
  dari: string; setDari: (v: string) => void;
  sampai: string; setSampai: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Dari</label>
        <input type="date" value={dari} onChange={e => setDari(e.target.value)} className={INPUT_CLS} />
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Sampai</label>
        <input type="date" value={sampai} onChange={e => setSampai(e.target.value)} className={INPUT_CLS} />
      </div>
    </div>
  );
}

function BulanTahunFilter({ bulan, setBulan, tahun, setTahun, mode, setMode }: {
  bulan: string; setBulan: (v: string) => void;
  tahun: string; setTahun: (v: string) => void;
  mode: 'bulan' | 'tahun'; setMode: (m: 'bulan' | 'tahun') => void;
}) {
  return (
    <>
      <div className="flex gap-2">
        {(['bulan', 'tahun'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors capitalize ${mode === m ? 'bg-[#C9A84C]/20 border-[#C9A84C]/40 text-[#C9A84C]' : 'border-white/15 text-white/40'}`}>
            Per {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      {mode === 'bulan'
        ? <div><label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Bulan</label>
            <input type="month" value={bulan} onChange={e => setBulan(e.target.value)} className={INPUT_CLS} /></div>
        : <div><label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Tahun</label>
            <input type="number" value={tahun} min="2020" max="2099" onChange={e => setTahun(e.target.value)} className={INPUT_CLS} /></div>
      }
    </>
  );
}

export default function ExportPage() {
  const tahunStr = String(tahunIni);

  // Filter states per laporan
  const [jamDari, setJamDari] = useState('');
  const [jamSampai, setJamSampai] = useState('');

  const [insidentilMode, setInsidentilMode] = useState<'bulan'|'tahun'>('bulan');
  const [insidentilBulan, setInsidentilBulan] = useState(bulanIni);
  const [insidentilTahun, setInsidentilTahun] = useState(tahunStr);

  const [donaturMode, setDonaturMode] = useState<'bulan'|'tahun'>('bulan');
  const [donaturBulan, setDonaturBulan] = useState(bulanIni);
  const [donaturTahun, setDonaturTahun] = useState(tahunStr);

  const [patunganDari, setPatunganDari] = useState('');
  const [patunganSampai, setPatunganSampai] = useState('');

  const [tabunganDari, setTabunganDari] = useState('');
  const [tabunganSampai, setTabunganSampai] = useState('');

  const [pinfaqMode, setPinfaqMode] = useState<'bulan'|'tahun'>('bulan');
  const [pinfaqBulan, setPinfaqBulan] = useState(bulanIni);
  const [pinfaqTahun, setPinfaqTahun] = useState(tahunStr);

  const [pkurbanMode, setPkurbanMode] = useState<'bulan'|'tahun'>('bulan');
  const [pkurbanBulan, setPkurbanBulan] = useState(bulanIni);
  const [pkurbanTahun, setPkurbanTahun] = useState(tahunStr);

  function btQuery(dari: string, sampai: string) {
    const q = new URLSearchParams();
    if (dari) q.set('dari', dari);
    if (sampai) q.set('sampai', sampai);
    return q.toString() ? `&${q}` : '';
  }
  function btQueryBulanTahun(mode: 'bulan'|'tahun', bulan: string, tahun: string) {
    return mode === 'bulan' ? `&bulan=${bulan}` : `&tahun=${tahun}`;
  }

  const cards = [
    {
      emoji: '👥', title: 'Data Jamaah', color: 'bg-blue-900/30 border-blue-500/20',
      desc: 'Daftar seluruh jamaah: nama, no WA, paket, saldo, tanggal daftar.',
      cols: 'Nama, No WA, Email, Paket, Saldo, Tgl Daftar',
      base: '/api/admin/export/jamaah?x=1',
      filterEl: null,
      baseUrl: () => '/api/admin/export/jamaah?x=1',
    },
    {
      emoji: '🤲', title: 'Infaq Insidentil (Pemasukan)', color: 'bg-purple-900/30 border-purple-500/20',
      desc: 'Pemasukan infaq insidentil (non-donatur tetap).',
      cols: 'Tanggal, Jenis, Nominal, Sumber, Catatan',
      base: '',
      filterEl: 'insidentil',
      baseUrl: () => `/api/admin/export/laporan?jenis=infaq-insidentil${btQueryBulanTahun(insidentilMode, insidentilBulan, insidentilTahun)}`,
    },
    {
      emoji: '💚', title: 'Infaq Donatur Tetap (Pemasukan)', color: 'bg-teal-900/30 border-teal-500/20',
      desc: 'Realisasi pembayaran dari donatur tetap.',
      cols: 'Tanggal, Nama Donatur, Nominal, Catatan',
      base: '',
      filterEl: 'donatur',
      baseUrl: () => `/api/admin/export/laporan?jenis=infaq-donatur${btQueryBulanTahun(donaturMode, donaturBulan, donaturTahun)}`,
    },
    {
      emoji: '🐄', title: 'Patungan Kurban (Pemasukan)', color: 'bg-amber-900/30 border-amber-500/20',
      desc: 'Setoran jamaah yang bergabung dalam grup patungan kurban.',
      cols: 'Tanggal, Nama, No WA, Grup, Jumlah, Status',
      base: '',
      filterEl: 'patungan',
      baseUrl: () => `/api/admin/export/laporan?jenis=kurban-patungan${btQuery(patunganDari, patunganSampai)}`,
    },
    {
      emoji: '🏦', title: 'Tabungan Kurban (Pemasukan)', color: 'bg-orange-900/30 border-orange-500/20',
      desc: 'Setoran jamaah yang menabung kurban secara mandiri.',
      cols: 'Tanggal, Nama, No WA, Paket, Jumlah, Status',
      base: '',
      filterEl: 'tabungan',
      baseUrl: () => `/api/admin/export/laporan?jenis=kurban-tabungan${btQuery(tabunganDari, tabunganSampai)}`,
    },
    {
      emoji: '💸', title: 'Pengeluaran Kas Infaq', color: 'bg-red-900/30 border-red-500/20',
      desc: 'Pengeluaran yang diambil dari kas infaq.',
      cols: 'Tanggal, Keperluan, Nominal, Catatan',
      base: '',
      filterEl: 'pinfaq',
      baseUrl: () => `/api/admin/export/laporan?jenis=pengeluaran-infaq${btQueryBulanTahun(pinfaqMode, pinfaqBulan, pinfaqTahun)}`,
    },
    {
      emoji: '🔪', title: 'Pengeluaran Kas Kurban', color: 'bg-rose-900/30 border-rose-500/20',
      desc: 'Pengeluaran yang diambil dari kas kurban.',
      cols: 'Tanggal, Keperluan, Nominal, Catatan',
      base: '',
      filterEl: 'pkurban',
      baseUrl: () => `/api/admin/export/laporan?jenis=pengeluaran-kurban${btQueryBulanTahun(pkurbanMode, pkurbanBulan, pkurbanTahun)}`,
    },
  ];

  const filterMap: Record<string, React.ReactNode> = {
    insidentil: <BulanTahunFilter bulan={insidentilBulan} setBulan={setInsidentilBulan} tahun={insidentilTahun} setTahun={setInsidentilTahun} mode={insidentilMode} setMode={setInsidentilMode} />,
    donatur: <BulanTahunFilter bulan={donaturBulan} setBulan={setDonaturBulan} tahun={donaturTahun} setTahun={setDonaturTahun} mode={donaturMode} setMode={setDonaturMode} />,
    patungan: <DateRangeFilter dari={patunganDari} setDari={setPatunganDari} sampai={patunganSampai} setSampai={setPatunganSampai} />,
    tabungan: <DateRangeFilter dari={tabunganDari} setDari={setTabunganDari} sampai={tabunganSampai} setSampai={setTabunganSampai} />,
    pinfaq: <BulanTahunFilter bulan={pinfaqBulan} setBulan={setPinfaqBulan} tahun={pinfaqTahun} setTahun={setPinfaqTahun} mode={pinfaqMode} setMode={setPinfaqMode} />,
    pkurban: <BulanTahunFilter bulan={pkurbanBulan} setBulan={setPkurbanBulan} tahun={pkurbanTahun} setTahun={setPkurbanTahun} mode={pkurbanMode} setMode={setPkurbanMode} />,
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#C9A84C]/70 text-xs uppercase tracking-widest font-semibold mb-1">Laporan</p>
        <h1 className="text-2xl font-bold text-white">Export Laporan</h1>
        <p className="text-white/40 text-sm mt-1">Unduh data dalam format CSV, Excel, atau PDF.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map(card => (
          <div key={card.title} className={`glass-card border p-5 flex flex-col gap-3 ${card.color}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">{card.emoji}</div>
              <h2 className="text-base font-bold text-white leading-tight">{card.title}</h2>
            </div>
            <p className="text-xs text-white/50">{card.desc}</p>

            {card.filterEl && (
              <div className="space-y-2 pt-1 border-t border-white/10">
                {filterMap[card.filterEl]}
              </div>
            )}

            <div className="mt-auto pt-3 border-t border-white/10">
              <p className="text-[10px] text-white/25 mb-2">Kolom: {card.cols}</p>
              <Btns base={card.baseUrl()} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-white/25 text-xs text-center mt-8">
        💡 Tombol <strong className="text-white/40">Cetak / PDF</strong> membuka halaman print di tab baru — pilih <em>Simpan sebagai PDF</em> di dialog browser.
        &nbsp;|&nbsp; Data pengeluaran lama (sebelum pemisahan kas) tidak muncul di laporan Pengeluaran Infaq/Kurban.
      </p>
    </div>
  );
}
