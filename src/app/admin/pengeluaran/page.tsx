'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function PengeluaranPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [filterBulan, setFilterBulan] = useState(defaultBulan);

  const fetchData = async (pg: number, bulan: string, append = false) => {
    if (!append) setLoading(true);
    try {
      const res = await fetch(`/api/admin/pengeluaran?page=${pg}&bulan=${bulan}`);
      const json = await res.json();
      if (res.ok) {
        setData(prev => append ? [...prev, ...json.data] : json.data);
        setHasMore(pg < json.meta.totalPages);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); fetchData(1, filterBulan); }, [filterBulan]);

  const bulanOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return { val, label };
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[#C9A84C]/70 text-xs uppercase tracking-widest font-semibold mb-1">Kas Masjid</p>
        <h1 className="text-2xl font-bold text-white">Pengeluaran</h1>
        <p className="text-white/40 text-sm">Kelola transaksi pengeluaran & belanja masjid.</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <select
          value={filterBulan}
          onChange={e => setFilterBulan(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/15 text-white rounded-xl text-sm outline-none"
        >
          {bulanOptions.map(b => (
            <option key={b.val} value={b.val} className="bg-[#1E293B] text-white">{b.label}</option>
          ))}
        </select>
        <Link
          href="/admin/pengeluaran/tambah"
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-colors"
        >
          + Tambah Pengeluaran
        </Link>
      </div>

      {loading && data.length === 0 ? (
        <div className="text-center py-16 text-white/30">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🧾</div>
          <p className="font-semibold text-white">Belum ada pengeluaran</p>
          <p className="text-sm text-white/40 mt-1">Catat pengeluaran masjid di bulan ini.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-black/20 border-b border-white/10">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-white/50">Tanggal</th>
                  <th className="text-left px-5 py-3 font-semibold text-white/50">Keperluan</th>
                  <th className="text-left px-5 py-3 font-semibold text-white/50">Jenis Kas</th>
                  <th className="text-left px-5 py-3 font-semibold text-white/50 hidden md:table-cell">Catatan</th>
                  <th className="text-right px-5 py-3 font-semibold text-white/50">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-white/60">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-white/80 font-medium">{item.sumber || '—'}</td>
                    <td className="px-5 py-3">
                      {item.kategori === 'pengeluaran_infaq'
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30">Infaq</span>
                        : item.kategori === 'pengeluaran_kurban'
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-500/30">Kurban</span>
                        : item.kategori === 'pengeluaran_waqaf'
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-900/40 text-teal-300 border border-teal-500/30">Waqaf</span>
                        : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/30 border border-white/10">Lama</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-white/40 text-xs hidden md:table-cell max-w-[200px] truncate">{item.catatan || '—'}</td>
                    <td className="px-5 py-3 font-bold text-right text-red-400">
                      - {formatRp(item.nominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => { const next = page + 1; setPage(next); fetchData(next, filterBulan, true); }}
                className="w-full py-2 text-sm text-white/50 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-colors"
              >
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
