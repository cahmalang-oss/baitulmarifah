'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JamaahDetailForms({
  userId,
  initialVa,
  initialPaketId,
  paketList,
  paketStatus,
  paketNama,
}: {
  userId: string;
  initialVa: string | null;
  initialPaketId: string | null;
  paketList: any[];
  paketStatus?: string | null;
  paketNama?: string | null;
}) {
  const router = useRouter();
  const [va, setVa] = useState(initialVa || '');
  const [paketId, setPaketId] = useState(initialPaketId || '');

  const [loadingVa, setLoadingVa] = useState(false);
  const [loadingPaket, setLoadingPaket] = useState(false);
  const [loadingVerifikasi, setLoadingVerifikasi] = useState(false);

  const handleVerifikasiPaket = async (action: 'approve_paket' | 'reject_paket') => {
    if (action === 'reject_paket' && !confirm('Tolak pendaftaran paket jamaah ini?')) return;
    setLoadingVerifikasi(true);
    try {
      const res = await fetch(`/api/admin/jamaah/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert('Gagal: ' + data.error);
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    }
    setLoadingVerifikasi(false);
  };

  const handleUpdateVa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingVa(true);
    try {
      const res = await fetch(`/api/admin/jamaah/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_va', no_va: va })
      });
      if (res.ok) {
        alert('VA berhasil disimpan');
        router.refresh();
      } else {
        const data = await res.json();
        alert('Gagal: ' + data.error);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
    setLoadingVa(false);
  };

  const handleUpdatePaket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPaket(true);
    try {
      const res = await fetch(`/api/admin/jamaah/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_paket', paket_id: paketId })
      });
      if (res.ok) {
        alert('Paket berhasil disimpan');
        router.refresh();
      } else {
        const data = await res.json();
        alert('Gagal: ' + data.error);
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
    setLoadingPaket(false);
  };

  return (
    <div className="space-y-6 mt-6">
      {paketStatus === 'pending' && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-5">
          <p className="text-amber-300 font-bold text-sm mb-1">⏳ Pendaftaran Paket Menunggu Verifikasi</p>
          <p className="text-white/60 text-xs mb-4">
            Jamaah mendaftar mandiri untuk paket <strong className="text-white">{paketNama || '-'}</strong>. Verifikasi untuk mengaktifkan, atau tolak jika tidak valid.
          </p>
          <div className="flex gap-2">
            <button
              disabled={loadingVerifikasi}
              onClick={() => handleVerifikasiPaket('approve_paket')}
              className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              ✓ Setujui
            </button>
            <button
              disabled={loadingVerifikasi}
              onClick={() => handleVerifikasiPaket('reject_paket')}
              className="flex-1 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 font-bold rounded-xl text-sm transition-colors disabled:opacity-50 border border-red-500/30"
            >
              ✗ Tolak
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form onSubmit={handleUpdateVa} className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Virtual Account</h3>
        <input 
          type="text"
          value={va}
          onChange={(e) => setVa(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Nomor Virtual Account..."
          className="w-full px-4 py-2 bg-white/5 border border-white/15 text-white rounded-xl mb-3 focus:border-[#C9A84C] outline-none font-mono"
        />
        <button disabled={loadingVa} type="submit" className="w-full py-2 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50">
          {loadingVa ? 'Menyimpan...' : 'Simpan VA'}
        </button>
      </form>

      <form onSubmit={handleUpdatePaket} className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Paket Qurban</h3>
        <select
          value={paketId}
          onChange={(e) => setPaketId(e.target.value)}
          className="w-full px-4 py-2 bg-[#1E293B] border border-white/15 text-white rounded-xl mb-3 focus:border-[#C9A84C] outline-none"
        >
          <option value="">-- Pilih Paket --</option>
          {paketList.map(p => (
            <option key={p.id} value={p.id}>{p.nama} (Rp {p.harga_target.toLocaleString('id-ID')})</option>
          ))}
        </select>
        <button disabled={loadingPaket} type="submit" className="w-full py-2 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50">
          {loadingPaket ? 'Menyimpan...' : 'Simpan Paket'}
        </button>
      </form>
      </div>
    </div>
  );
}
