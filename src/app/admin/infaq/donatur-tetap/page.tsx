'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

const STATUS_CONFIG = {
  lunas: { label: 'Lunas ✅', cls: 'bg-green-900/40 text-green-400 border-green-500/30' },
  kurang: { label: 'Kurang ⚠️', cls: 'bg-yellow-900/40 text-yellow-400 border-yellow-500/30' },
  belum: { label: 'Belum ❌', cls: 'bg-red-900/40 text-red-400 border-red-500/30' },
};

export default function DonaturTetapPage() {
  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [bulan, setBulan] = useState(defaultBulan);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const bulanOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return { val, label };
  });

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/infaq/donatur-tetap?bulan=${bulan}`);
        const json = await res.json();
        if (res.ok) setData(json.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [bulan]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Infaq & Shadaqah</h1>
        <p className="text-white/50 text-sm">Kelola pemasukan infaq insidentil dan donatur tetap bulanan.</p>
      </header>

      {/* Tab Nav */}
      <div className="flex gap-3 border-b border-white/10 pb-4">
        <Link href="/admin/infaq/insidentil" className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/60 font-bold rounded-xl text-sm hover:bg-white/10 hover:text-white transition-colors">
          💰 Infaq Insidentil
        </Link>
        <Link href="/admin/infaq/donatur-tetap" className="px-5 py-2.5 bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] font-bold rounded-xl text-sm">
          🤝 Donatur Tetap
        </Link>
      </div>

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <select
          value={bulan}
          onChange={e => setBulan(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/15 text-white rounded-xl text-sm outline-none"
        >
          {bulanOptions.map(b => (
            <option key={b.val} value={b.val}>{b.label}</option>
          ))}
        </select>
        <Link
          href="/admin/infaq/donatur-tetap/tambah"
          className="px-4 py-2 bg-[#C9A84C] hover:bg-[#D4B869] text-[#0F172A] font-bold rounded-xl text-sm transition-colors"
        >
          + Daftarkan Donatur Baru
        </Link>
      </div>

      {/* Tabel */}
      {loading ? (
        <div className="text-center py-16 text-white/30">Memuat data donatur...</div>
      ) : data.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🤝</div>
          <p className="font-semibold text-white">Belum ada donatur tetap</p>
          <p className="text-sm text-white/40 mt-1">Daftarkan donatur yang berkomitmen infaq rutin.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-black/20 border-b border-white/10">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-white/50">Nama Donatur</th>
                  <th className="text-left px-5 py-3 font-semibold text-white/50 hidden md:table-cell">No WA</th>
                  <th className="text-right px-5 py-3 font-semibold text-white/50">Komitmen/Bulan</th>
                  <th className="text-right px-5 py-3 font-semibold text-white/50">Realisasi</th>
                  <th className="text-center px-5 py-3 font-semibold text-white/50">Status</th>
                  <th className="text-right px-5 py-3 font-semibold text-white/50">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map(d => {
                  const st = STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG];
                  return (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">{d.nama_donatur}</div>
                        <div className="text-xs text-white/40 capitalize">{d.metode_bayar}</div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {d.no_wa ? (
                          <a href={`https://wa.me/${d.no_wa}`} target="_blank" rel="noreferrer" className="text-[#C9A84C] hover:underline">{d.no_wa}</a>
                        ) : <span className="text-white/30">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-white">{formatRp(d.nominal_komitmen)}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={d.realisasi_bulan_ini > 0 ? 'text-green-400 font-bold' : 'text-white/30'}>
                          {d.realisasi_bulan_ini > 0 ? formatRp(d.realisasi_bulan_ini) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/infaq/donatur-tetap/${d.id}`}
                          className="inline-block px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white/70 font-medium rounded-lg text-xs transition-colors"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
