'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JamaahPage() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [filterVA, setFilterVA] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');

  useEffect(() => {
    const fetchJamaah = async () => {
      try {
        const res = await fetch('/api/admin/jamaah');
        const json = await res.json();
        if (res.ok) {
          setData(json.data);
          setFilteredData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchJamaah();
  }, []);

  useEffect(() => {
    let result = data;

    // Search filter
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(item => 
        item.nama.toLowerCase().includes(q) || 
        item.no_wa.includes(q)
      );
    }

    // VA filter
    if (filterVA === 'sudah') {
      result = result.filter(item => item.no_va);
    } else if (filterVA === 'belum') {
      result = result.filter(item => !item.no_va);
    }

    // Status filter
    if (filterStatus !== 'semua') {
      result = result.filter(item => item.status === filterStatus);
    }

    setFilteredData(result);
  }, [search, filterVA, filterStatus, data]);

  const STATUS_BADGE: Record<string, string> = {
    aktif: 'bg-green-900/40 text-green-400',
    lunas: 'bg-blue-900/40 text-blue-400',
    pending: 'bg-yellow-900/40 text-yellow-400',
    nonaktif: 'bg-white/10 text-white/50',
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <p className="text-[#C9A84C]/70 text-xs uppercase tracking-widest font-semibold mb-1">Database</p>
          <h1 className="text-2xl font-bold text-white">Manajemen Jamaah</h1>
          <p className="text-white/40 text-sm">Kelola data, status, dan Virtual Account jamaah.</p>
        </div>
        <Link
          href="/admin/jamaah/tambah"
          className="px-4 py-2 bg-[#C9A84C] hover:bg-[#D4B869] text-[#0F172A] font-bold rounded-xl text-sm transition-colors text-center"
        >
          + Tambah Manual
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari nama atau no WA..."
            className="w-full px-4 py-2 bg-white/5 border border-white/15 text-white placeholder:text-white/30 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterVA}
            onChange={(e) => setFilterVA(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/15 text-white rounded-lg text-sm flex-1 md:w-48 outline-none"
          >
            <option value="semua" className="bg-[#1E293B] text-white">Semua Virtual Account</option>
            <option value="sudah" className="bg-[#1E293B] text-white">Sudah ada VA</option>
            <option value="belum" className="bg-[#1E293B] text-white">Belum ada VA</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/15 text-white rounded-lg text-sm flex-1 md:w-40 outline-none"
          >
            <option value="semua" className="bg-[#1E293B] text-white">Semua Status</option>
            <option value="aktif" className="bg-[#1E293B] text-white">Aktif</option>
            <option value="lunas" className="bg-[#1E293B] text-white">Lunas</option>
            <option value="nonaktif" className="bg-[#1E293B] text-white">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-xs uppercase text-white/50 font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Nama Jamaah</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Status & VA</th>
                <th className="px-6 py-4">Saldo Tabungan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/40">Memuat data jamaah...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/40">Tidak ada jamaah yang cocok.</td></tr>
              ) : filteredData.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{p.nama}</div>
                    <div className="text-xs text-white/40 truncate max-w-[200px]">{p.paket?.nama || 'Belum pilih paket'}</div>
                    {p.paket_status === 'pending' && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-900/40 text-amber-300 border border-amber-500/30">
                        ⏳ Menunggu Verifikasi
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <a href={`https://wa.me/${p.no_wa}`} target="_blank" rel="noreferrer" className="text-[#C9A84C] hover:underline block">{p.no_wa}</a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_BADGE[p.status] || 'bg-white/10 text-white/50'}`}>
                        {p.status}
                      </span>
                      {p.no_va
                        ? <span className="text-[10px] font-mono text-white/50 border border-white/10 bg-white/5 px-1.5 py-0.5 rounded">{p.no_va}</span>
                        : <span className="text-[10px] text-red-400/80 font-medium bg-red-900/20 px-1.5 py-0.5 rounded">Belum ada VA</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{formatRupiah(p.saldo)}</div>
                    <div className="text-[10px] text-white/35 mt-0.5">Target: {formatRupiah(p.paket?.harga_target || 0)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/jamaah/${p.id}`}
                      className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 font-medium rounded-lg text-xs transition-colors"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
