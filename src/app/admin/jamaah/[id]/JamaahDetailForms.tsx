'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JamaahDetailForms({ 
  userId,
  initialVa,
  initialPaketId,
  paketList
}: { 
  userId: string;
  initialVa: string | null;
  initialPaketId: string | null;
  paketList: any[];
}) {
  const router = useRouter();
  const [va, setVa] = useState(initialVa || '');
  const [paketId, setPaketId] = useState(initialPaketId || '');
  
  const [loadingVa, setLoadingVa] = useState(false);
  const [loadingPaket, setLoadingPaket] = useState(false);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
  );
}
