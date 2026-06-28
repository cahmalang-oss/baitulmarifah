'use client';

import { useState } from 'react';

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

interface Props {
  donaturId: string;
  bulan: string;
  komitmen: number;
  realisasiAwal: number;
  onSuccess: () => void;
}

export default function RealisasiForm({ donaturId, bulan, komitmen, realisasiAwal, onSuccess }: Props) {
  const [nominal, setNominal] = useState(realisasiAwal > 0 ? String(realisasiAwal) : '');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/infaq/donatur-tetap/${donaturId}/realisasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulan, nominal_realisasi: parseInt(nominal), catatan }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); setLoading(false); return; }
      onSuccess();
    } catch {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 p-4 bg-[#0F172A] border border-[#C9A84C]/30 rounded-xl">
      {error && <div className="p-3 bg-red-900/30 text-red-300 text-xs rounded-lg border border-red-500/30">{error}</div>}
      <p className="text-xs text-white/50">Komitmen bulan ini: <span className="text-[#C9A84C] font-bold">{formatRp(komitmen)}</span></p>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40 text-sm font-medium">Rp</span>
        <input
          type="number" required min="1000"
          value={nominal}
          onChange={e => setNominal(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none text-sm"
          placeholder="Nominal realisasi..."
        />
      </div>
      <input
        type="text"
        value={catatan}
        onChange={e => setCatatan(e.target.value)}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none text-sm"
        placeholder="Catatan (opsional)..."
      />
      <button
        type="submit" disabled={loading}
        className="w-full py-2.5 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50 text-sm"
      >
        {loading ? 'Menyimpan...' : 'Simpan Realisasi'}
      </button>
    </form>
  );
}
