'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminGrupPage() {
  const [grups, setGrups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paketList, setPaketList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nama: '', paket_id: '', target_anggota: '7' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/grup').then(r => r.json()).then(j => { if (j.data) setGrups(j.data); }).finally(() => setLoading(false));
    fetch('/api/public/paket').then(r => r.json()).then(j => { if (j.data) setPaketList(j.data.filter((p: any) => p.jenis === 'sapi-patungan')); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/admin/grup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setShowModal(false);
      fetch('/api/admin/grup').then(r => r.json()).then(j => { if (j.data) setGrups(j.data); });
    } else alert(data.error || 'Gagal membuat grup');
    setSubmitting(false);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Grup Patungan</h1>
          <p className="text-white/50 text-sm mt-1">Pantau seluruh aktivitas grup patungan sapi.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[#C9A84C] hover:bg-[#D4B869] text-[#0F172A] font-bold rounded-xl text-sm transition-colors">
            + Buat Grup Baru
          </button>
          <Link href="/admin/paket" className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm transition-colors">
            ⚙️ Kelola Paket
          </Link>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-xs uppercase text-white/50 font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Nama Grup</th>
                <th className="px-6 py-4">Paket Patungan</th>
                <th className="px-6 py-4">Anggota</th>
                <th className="px-6 py-4">Progres Patungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-white/40">Memuat data grup...</td></tr>
              ) : grups.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-white/40">Belum ada grup patungan. Buat grup pertama!</td></tr>
              ) : grups.map(g => (
                <tr key={g.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{g.nama}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{g.paket_nama}</div>
                    <div className="text-xs text-white/40">Rp {g.paket_harga.toLocaleString('id-ID')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${g.anggota_saat_ini >= g.target_anggota ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                      {g.anggota_saat_ini}/{g.target_anggota} Anggota
                    </span>
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

      {/* Modal Buat Grup */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md border border-white/10 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">Buat Grup Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nama Grup <span className="text-red-400">*</span></label>
                <input type="text" required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  placeholder="Grup Sapi Bersama 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Paket Patungan <span className="text-red-400">*</span></label>
                <select required value={form.paket_id} onChange={e => setForm({ ...form, paket_id: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0F172A] border border-white/15 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#C9A84C]">
                  <option value="">-- Pilih Paket Sapi --</option>
                  {paketList.map(p => <option key={p.id} value={p.id}>{p.nama} (Rp {p.harga_target.toLocaleString('id-ID')})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Kapasitas Anggota</label>
                <input type="number" min="2" max="7" value={form.target_anggota} onChange={e => setForm({ ...form, target_anggota: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                <p className="text-xs text-white/30 mt-1">Default 7 orang per sapi</p>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] disabled:opacity-50">
                {submitting ? 'Membuat...' : 'Buat Grup'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
