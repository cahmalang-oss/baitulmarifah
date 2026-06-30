'use client';

import { useState, useEffect, useCallback } from 'react';

/* ── Types ── */
type TvData = {
  saldoInfaq: number; totalKurban: number; pengeluaranBulanIni: number;
  totalJamaah: number; tabunganCount: number; patunganCount: number;
  infaqHariIni: number; infaqMingguIni: number; pengeluaranMingguIni: number;
  setoranPending: number; sparkKurban: number[]; sparkInfaq: number[];
  tickerItems: { nama: string; jumlah: number; kategori: string; tanggal: string }[];
};
type JadwalData = {
  kajian: any[]; imam: any[]; pengumuman: { id: string; isi: string }[];
};

const IDR = (n: number) =>
  n >= 1_000_000_000 ? `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  : n >= 1_000_000 ? `Rp ${(n / 1_000_000).toFixed(1)}jt`
  : `Rp ${n.toLocaleString('id-ID')}`;

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm opacity-80 transition-all"
          style={{ height: `${Math.max(4, (v / max) * 32)}px`, background: color }} />
      ))}
    </div>
  );
}

/* ── Slide 1: Keuangan ── */
function SlideKeuangan({ tv }: { tv: TvData }) {
  const cards = [
    { label: 'Saldo Kas Infaq', value: IDR(tv.saldoInfaq), sub: `Infaq hari ini: ${IDR(tv.infaqHariIni)}`, color: '#22d3ee', spark: tv.sparkInfaq },
    { label: 'Total Terkumpul Kurban', value: IDR(tv.totalKurban), sub: `${tv.tabunganCount} tabungan · ${tv.patunganCount} patungan`, color: '#C9A84C', spark: tv.sparkKurban },
    { label: 'Pengeluaran Bulan Ini', value: IDR(tv.pengeluaranBulanIni), sub: `Minggu ini: ${IDR(tv.pengeluaranMingguIni)}`, color: '#f87171', spark: null },
    { label: 'Total Jamaah', value: tv.totalJamaah.toString(), sub: `Setoran pending: ${tv.setoranPending}`, color: '#a78bfa', spark: null },
  ];

  return (
    <div className="flex-1 grid grid-cols-2 gap-5 p-8">
      {cards.map(c => (
        <div key={c.label} className="rounded-3xl border p-6 flex flex-col justify-between"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: `${c.color}30` }}>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest mb-1" style={{ color: `${c.color}99` }}>{c.label}</p>
            <p className="text-4xl font-bold tracking-tight" style={{ color: c.color }}>{c.value}</p>
            <p className="text-sm mt-1" style={{ color: `${c.color}70` }}>{c.sub}</p>
          </div>
          {c.spark && (
            <div className="mt-4">
              <Spark data={c.spark} color={c.color} />
              <p className="text-[10px] mt-1" style={{ color: `${c.color}50` }}>7 hari terakhir</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Slide 2: Jadwal ── */
function JadwalMeta({ tanggal, waktu, lokasi }: { tanggal: string; waktu?: string | null; lokasi?: string | null }) {
  const fmtDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  return (
    <div className="flex items-center gap-2 flex-wrap mt-2">
      <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(201,168,76,0.18)', color: '#E8CD7A' }}>
        📅 {fmtDate(tanggal)}
      </span>
      {waktu && (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(34,211,238,0.15)', color: '#67e8f9' }}>
          🕐 {waktu.slice(0, 5)} WIB
        </span>
      )}
      {lokasi && <span className="text-xs text-white/40">📍 {lokasi}</span>}
    </div>
  );
}

/* ── Slide 2: Kajian (2 kolom) ── */
function SlideKajian({ jadwal }: { jadwal: JadwalData }) {
  const items = jadwal.kajian.slice(0, 2);
  return (
    <div className="flex-1 grid grid-cols-2 gap-5 p-8 overflow-hidden">
      {items.length === 0 && (
        <div className="col-span-2 flex items-center justify-center rounded-3xl border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white/30 text-lg">Tidak ada jadwal kajian</p>
        </div>
      )}
      {items.map(k => (
        <div key={k.id} className="rounded-3xl border border-white/10 p-6 flex flex-col overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]/70 mb-4">📚 Jadwal Kajian</p>
          {k.mode_tampil === 'flyer' && k.flyer_url ? (
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden bg-black/20">
              <img src={k.flyer_url} className="flex-1 w-full object-contain" />
              <div className="px-3 py-2"><JadwalMeta tanggal={k.tanggal} waktu={k.waktu} lokasi={k.lokasi} /></div>
            </div>
          ) : (
            <div className="flex gap-4 items-start">
              {k.mode_tampil === 'manual_foto' && k.foto_penceramah_url && (
                <img src={k.foto_penceramah_url} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-2xl leading-tight">{k.judul || '—'}</p>
                {k.pemateri && <p className="text-[#C9A84C] text-base mt-1">{k.pemateri}</p>}
                <JadwalMeta tanggal={k.tanggal} waktu={k.waktu} lokasi={k.lokasi} />
                {k.keterangan && <p className="text-white/40 text-sm mt-3">{k.keterangan}</p>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Slide 3: Imam (kiri) + Hadits/Ayat (kanan) ── */
const QUOTES: { teks: string; sumber: string }[] = [
  { teks: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.', sumber: 'HR. Ahmad, Thabrani, Daruquthni' },
  { teks: 'Dan dirikanlah shalat, tunaikanlah zakat, dan ruku\'lah beserta orang-orang yang ruku\'.', sumber: 'QS. Al-Baqarah: 43' },
  { teks: 'Barangsiapa membangun masjid karena Allah, maka Allah akan membangunkan untuknya rumah yang serupa di surga.', sumber: 'HR. Bukhari & Muslim' },
  { teks: 'Perumpamaan orang yang berinfak hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai.', sumber: 'QS. Al-Baqarah: 261' },
  { teks: 'Tidak beriman salah seorang dari kalian sehingga ia mencintai saudaranya seperti ia mencintai dirinya sendiri.', sumber: 'HR. Bukhari & Muslim' },
  { teks: 'Sesungguhnya shalat itu mencegah dari perbuatan keji dan mungkar.', sumber: 'QS. Al-Ankabut: 45' },
  { teks: 'Sebaik-baik kalian adalah yang belajar Al-Qur\'an dan mengajarkannya.', sumber: 'HR. Bukhari' },
  { teks: 'Dan tolong-menolonglah kalian dalam kebaikan dan takwa, jangan tolong-menolong dalam dosa dan permusuhan.', sumber: 'QS. Al-Maidah: 2' },
  { teks: 'Senyummu kepada saudaramu adalah sedekah.', sumber: 'HR. Tirmidzi' },
  { teks: 'Barangsiapa yang bertakwa kepada Allah, niscaya Dia akan memberikan jalan keluar baginya.', sumber: 'QS. At-Talaq: 2' },
];

function SlideImamQuran({ jadwal }: { jadwal: JadwalData }) {
  const JENIS_LABEL: Record<string, string> = { jumat: "Jum'at", idul_fitri: 'Idul Fitri', idul_adha: 'Idul Adha' };
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  const quote = QUOTES[quoteIdx];

  return (
    <div className="flex-1 grid grid-cols-2 gap-5 p-8 overflow-hidden">
      {/* Imam */}
      <div className="rounded-3xl border border-white/10 p-6 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]/70 mb-4">🕌 Jadwal Imam</p>
        {jadwal.imam.length === 0 ? (
          <p className="text-white/30 text-sm">Tidak ada jadwal</p>
        ) : (
          <div className="space-y-5">
            {jadwal.imam.slice(0, 3).map(im => (
              im.mode_tampil === 'flyer' && im.flyer_url ? (
                <div key={im.id} className="rounded-2xl overflow-hidden bg-black/20">
                  <img src={im.flyer_url} className="w-full max-h-[300px] object-contain" />
                  <div className="px-3 py-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C9A84C]/40 text-[#C9A84C] mr-2">{JENIS_LABEL[im.jenis] || im.jenis}</span>
                    <JadwalMeta tanggal={im.tanggal} />
                  </div>
                </div>
              ) : (
                <div key={im.id} className="flex gap-3 items-start">
                  {im.mode_tampil === 'manual_foto' && im.foto_imam_url && (
                    <img src={im.foto_imam_url} className="w-12 h-12 rounded-full object-cover flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C9A84C]/40 text-[#C9A84C]">
                        {JENIS_LABEL[im.jenis] || im.jenis}
                      </span>
                    </div>
                    <p className="font-bold text-white text-lg leading-tight">{im.nama_imam || '—'}</p>
                    {im.tema_khutbah && <p className="text-white/50 text-sm mt-0.5 line-clamp-1">{im.tema_khutbah}</p>}
                    <JadwalMeta tanggal={im.tanggal} />
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Hadits / Ayat */}
      <div className="rounded-3xl border border-[#C9A84C]/20 p-8 flex flex-col items-center justify-center text-center" style={{ background: 'rgba(201,168,76,0.06)' }}>
        <span className="text-5xl mb-4 opacity-50">❝</span>
        <p className="text-white text-2xl leading-relaxed font-medium" style={{ maxWidth: 480 }}>{quote.teks}</p>
        <p className="text-[#C9A84C] text-sm font-bold mt-6 uppercase tracking-wide">{quote.sumber}</p>
      </div>
    </div>
  );
}

/* ── Main TV Page ── */
export default function TvPage() {
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tv, setTv] = useState<TvData | null>(null);
  const [jadwal, setJadwal] = useState<JadwalData | null>(null);
  const [clock, setClock] = useState('');
  const SLIDE_DURATION = 15;

  const fetchTv = useCallback(() => {
    fetch('/api/public/tv').then(r => r.json()).then(setTv).catch(() => {});
  }, []);
  const fetchJadwal = useCallback(() => {
    fetch('/api/public/jadwal').then(r => r.json()).then(setJadwal).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTv(); fetchJadwal();
    const tvTimer = setInterval(fetchTv, 60_000);
    const jadwalTimer = setInterval(fetchJadwal, 60_000);
    return () => { clearInterval(tvTimer); clearInterval(jadwalTimer); };
  }, [fetchTv, fetchJadwal]);

  useEffect(() => {
    const tick = setInterval(() => {
      setClock(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    setClock(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    return () => clearInterval(tick);
  }, []);

  // Progress bar & auto-advance
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setSlide(s => (s + 1) % 3);
          return 0;
        }
        return p + (100 / (SLIDE_DURATION * 10));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [slide]);

  // Build ticker text
  const allTickerItems: string[] = [];
  if (tv) {
    tv.tickerItems.forEach(t => {
      const kat = t.kategori === 'kurban' ? 'Kurban' : 'Infaq';
      allTickerItems.push(`${t.nama} · ${kat} ${IDR(t.jumlah)}`);
    });
  }
  if (jadwal) {
    jadwal.pengumuman.forEach(p => allTickerItems.push(`📢 ${p.isi}`));
  }
  const tickerText = allTickerItems.join('   ·   ');

  const todayDate = new Date();
  const today = todayDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayHijri = (() => {
    try {
      return todayDate.toLocaleDateString('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  })();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0A0F1E', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#C9A84C">
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#C9A84C', letterSpacing: '-0.5px' }}>Masjid BaitulMarifah</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{today}</div>
            {todayHijri && <div style={{ fontSize: 11, color: 'rgba(201,168,76,0.6)', marginTop: 1 }}>{todayHijri} H</div>}
          </div>
        </div>

        {/* Slide selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['Keuangan', 'Kajian', 'Imam & Hikmah'].map((label, i) => (
            <button key={i} onClick={() => { setSlide(i); setProgress(0); }}
              style={{ padding: '8px 20px', borderRadius: 10, border: slide === i ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.1)', background: slide === i ? 'rgba(201,168,76,0.15)' : 'transparent', color: slide === i ? '#C9A84C' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#C9A84C', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>{clock}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: '#C9A84C', width: `${progress}%`, transition: 'width 0.1s linear' }} />
      </div>

      {/* Slides */}
      {tv && slide === 0 && <SlideKeuangan tv={tv} />}
      {jadwal && slide === 1 && <SlideKajian jadwal={jadwal} />}
      {jadwal && slide === 2 && <SlideImamQuran jadwal={jadwal} />}
      {(!tv || !jadwal) && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>
          Memuat data...
        </div>
      )}

      {/* Ticker */}
      <div style={{ height: 44, background: 'rgba(201,168,76,0.1)', borderTop: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
        {tickerText ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', overflow: 'hidden' }}>
            <span style={{ flexShrink: 0, padding: '0 16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#C9A84C', borderRight: '1px solid rgba(201,168,76,0.3)' }}>INFO</span>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="tv-ticker" style={{ whiteSpace: 'nowrap', display: 'inline-block', fontSize: 14, color: 'rgba(255,255,255,0.85)', paddingLeft: '100%' }}>
                {tickerText}
              </div>
            </div>
          </div>
        ) : (
          <span style={{ padding: '0 24px', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Tidak ada pengumuman</span>
        )}
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .tv-ticker {
          animation: ticker 40s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .tv-ticker { animation: none; }
        }
      `}</style>
    </div>
  );
}
