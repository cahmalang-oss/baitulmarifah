'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition';

export default function TambahDonaturPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [form, setForm] = useState({
    nama_donatur: '',
    no_wa: '',
    nominal_komitmen: '',
    metode_bayar: 'tunai',
    mulai_bulan: defaultBulan,
    keterangan: '',
  });

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/infaq/donatur-tetap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); setLoading(false); return; }
      router.push('/admin/infaq/donatur-tetap');
    } catch {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/infaq/donatur-tetap" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Daftarkan Donatur Tetap</h1>
          <p className="text-white/50 text-sm mt-0.5">Donatur dengan komitmen infaq rutin per bulan.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nama Donatur <span className="text-red-400">*</span></label>
          <input type="text" required value={form.nama_donatur} onChange={e => set('nama_donatur', e.target.value)} className={INPUT_CLS} placeholder="Misal: Haji Budi Santoso" />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nomor WhatsApp <span className="text-white/30 font-normal">(opsional)</span></label>
          <input type="text" value={form.no_wa} onChange={e => set('no_wa', e.target.value.replace(/[^0-9]/g, ''))} className={INPUT_CLS} placeholder="6281234567890" />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nominal Komitmen / Bulan <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/40 font-medium">Rp</span>
            <input type="number" required min="1000" value={form.nominal_komitmen} onChange={e => set('nominal_komitmen', e.target.value)} className={`${INPUT_CLS} pl-12`} placeholder="100000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Metode Bayar</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'tunai', label: '💵 Tunai' },
              { value: 'transfer_bsi', label: '🏦 Transfer BSI' },
              { value: 'qris', label: '📱 QRIS' },
            ].map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => set('metode_bayar', m.value)}
                className={`py-2.5 rounded-xl border-2 font-semibold text-xs transition-colors ${
                  form.metode_bayar === m.value
                    ? 'border-[#C9A84C] bg-[#C9A84C]/20 text-[#C9A84C]'
                    : 'border-white/10 text-white/40 hover:border-white/20 bg-white/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Mulai Bulan <span className="text-red-400">*</span></label>
          <input type="month" required value={form.mulai_bulan} onChange={e => set('mulai_bulan', e.target.value)} className={INPUT_CLS} />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Keterangan <span className="text-white/30 font-normal">(opsional)</span></label>
          <textarea rows={2} value={form.keterangan} onChange={e => set('keterangan', e.target.value)} className={`${INPUT_CLS} resize-none`} placeholder="Catatan tambahan..." />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/admin/infaq/donatur-tetap" className="flex-1 py-3 text-center bg-white/5 border border-white/10 text-white/60 font-semibold rounded-xl hover:bg-white/10 transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Daftarkan Donatur'}
          </button>
        </div>
      </form>
    </div>
  );
}
