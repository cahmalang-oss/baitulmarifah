'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminGrupPage() {
  const [grups, setGrups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/grup').then(r => r.json()).then(j => { if (j.data) setGrups(j.data); }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Grup Patungan</h1>
          <p className="text-white/50 text-sm mt-1">Otomatis dari jamaah yang terdaftar pada paket sapi patungan.</p>
        </div>
        <Link href="/admin/paket" className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm transition-colors">
          ⚙️ Kelola Paket
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-xs uppercase text-white/50 font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Paket Patungan</th>
                <th className="px-6 py-4">Anggota</th>
                <th className="px-6 py-4">Progres Patungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-white/40">Memuat data grup...</td></tr>
              ) : grups.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-white/40">Belum ada paket sapi patungan aktif dengan jamaah terdaftar.</td></tr>
              ) : grups.map(g => (
                <tr key={g.id} className="hover:bg-white/5 transition-colors align-top">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{g.paket_nama}</div>
                    <div className="text-xs text-white/40">Rp {g.paket_harga.toLocaleString('id-ID')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${g.anggota_saat_ini >= g.target_anggota ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                      {g.anggota_saat_ini}/{g.target_anggota} Anggota
                    </span>
                    {g.anggota_nama?.length > 0 && (
                      <div className="text-xs text-white/40 mt-1.5 max-w-xs">{g.anggota_nama.join(', ')}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 w-52">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-green-400">Rp {g.terkumpul_saldo.toLocaleString('id-ID')}</span>
                      <span className="font-bold text-white">{g.progress_persen}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${g.progress_persen}%` }}></div>
                    </div>
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
