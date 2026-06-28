'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import RealisasiForm from './RealisasiForm';

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

const STATUS_CONFIG = {
  lunas: { label: 'Lunas ✅', cls: 'bg-green-900/40 text-green-400 border-green-500/30' },
  kurang: { label: 'Kurang ⚠️', cls: 'bg-yellow-900/40 text-yellow-400 border-yellow-500/30' },
  belum: { label: 'Belum ❌', cls: 'bg-red-900/40 text-red-400 border-red-500/30' },
};

export default function DonaturDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [donatur, setDonatur] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<string | null>(null);

  // Buat 12 bulan terakhir sejak mulai_bulan donatur
  const generateBulanList = (mulai: string) => {
    const now = new Date();
    const [mulaiYear, mulaiMonth] = mulai.split('-').map(Number);
    const bulanList = [];
    for (let y = now.getFullYear(), m = now.getMonth() + 1; ; ) {
      const val = `${y}-${String(m).padStart(2, '0')}`;
      bulanList.push(val);
      if (y === mulaiYear && m === mulaiMonth) break;
      m--;
      if (m === 0) { m = 12; y--; }
      if (bulanList.length > 24) break; // Safety limit
    }
    return bulanList;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/infaq/donatur-tetap?bulan=all`);
      const json = await res.json();
      const found = json.data?.find((d: any) => d.id === id);
      if (found) {
        setDonatur(found);

        // Fetch riwayat realisasi
        const res2 = await fetch(`/api/admin/infaq/donatur-tetap/${id}/riwayat`);
        const json2 = await res2.json();
        if (res2.ok) setRiwayat(json2.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="text-center py-20 text-white/40">Memuat...</div>;
  if (!donatur) return <div className="text-center py-20 text-white/40">Donatur tidak ditemukan.</div>;

  const bulanList = generateBulanList(donatur.mulai_bulan || '2024-01');
  const realisasiMap = new Map(riwayat.map(r => [r.bulan.slice(0, 7), r]));

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/infaq/donatur-tetap" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{donatur.nama_donatur}</h1>
          <p className="text-white/50 text-sm">Detail & riwayat realisasi infaq tetap.</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-white/40 mb-0.5">No WhatsApp</p>
            {donatur.no_wa ? (
              <a href={`https://wa.me/${donatur.no_wa}`} target="_blank" rel="noreferrer" className="text-[#C9A84C] font-medium hover:underline">{donatur.no_wa}</a>
            ) : <p className="text-white/50">—</p>}
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Komitmen / Bulan</p>
            <p className="text-white font-bold">{formatRp(donatur.nominal_komitmen)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Metode Bayar</p>
            <p className="text-white/80 capitalize">{donatur.metode_bayar?.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Mulai Bulan</p>
            <p className="text-white/80">{donatur.mulai_bulan}</p>
          </div>
        </div>
      </div>

      {/* Tabel Realisasi */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-bold">Riwayat Realisasi Bulanan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-black/20 border-b border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-white/50">Bulan</th>
                <th className="text-right px-5 py-3 font-semibold text-white/50">Komitmen</th>
                <th className="text-right px-5 py-3 font-semibold text-white/50">Realisasi</th>
                <th className="text-center px-5 py-3 font-semibold text-white/50">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-white/50">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bulanList.map(bln => {
                const real = realisasiMap.get(bln);
                const realisasi = real?.nominal_realisasi || 0;
                const status: 'lunas' | 'kurang' | 'belum' = realisasi === 0 ? 'belum' : realisasi >= donatur.nominal_komitmen ? 'lunas' : 'kurang';
                const st = STATUS_CONFIG[status];
                const bulanLabel = new Date(bln + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

                return (
                  <tr key={bln} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-white/80">{bulanLabel}</td>
                    <td className="px-5 py-3 text-right text-white/60">{formatRp(donatur.nominal_komitmen)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={realisasi > 0 ? 'text-green-400 font-bold' : 'text-white/30'}>
                        {realisasi > 0 ? formatRp(realisasi) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {status !== 'lunas' && (
                        <button
                          onClick={() => setActiveForm(activeForm === bln ? null : bln)}
                          className="px-3 py-1.5 bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] font-medium rounded-lg text-xs hover:bg-[#C9A84C]/30 transition-colors"
                        >
                          Input Realisasi
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Inline forms */}
          {bulanList.map(bln => {
            if (activeForm !== bln) return null;
            const real = realisasiMap.get(bln);
            return (
              <div key={`form-${bln}`} className="px-5 pb-4">
                <RealisasiForm
                  donaturId={id}
                  bulan={bln}
                  komitmen={donatur.nominal_komitmen}
                  realisasiAwal={real?.nominal_realisasi || 0}
                  onSuccess={() => { setActiveForm(null); fetchData(); }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
