'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SUMBER_PRESET: Record<string, string[]> = {
  masuk: ['Kotak Jumat', 'Kotak Harian', 'Transfer BSI', 'QRIS', 'Donatur Pribadi', 'Event Masjid'],
  keluar: ['Pembelian ATK', 'Kebersihan Masjid', 'Perbaikan Ringan', 'Perlengkapan Ibadah', 'Gaji Marbot'],
};

const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition';

export default function TambahInsidentilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    jenis: 'masuk',
    nominal: '',
    sumber: '',
    tanggal: today,
    catatan: '',
  });

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/infaq/insidentil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nominal: parseInt(form.nominal, 10) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); setLoading(false); return; }
      router.push('/admin/infaq/insidentil');
    } catch {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/infaq/insidentil" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tambah Infaq Insidentil</h1>
          <p className="text-white/50 text-sm mt-0.5">Catat penerimaan atau pengeluaran infaq.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Jenis */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Jenis Transaksi</label>
          <div className="grid grid-cols-2 gap-3">
            {(['masuk', 'keluar'] as const).map(j => (
              <button
                key={j}
                type="button"
                onClick={() => set('jenis', j)}
                className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  form.jenis === j
                    ? j === 'masuk'
                      ? 'border-green-500 bg-green-900/30 text-green-400'
                      : 'border-red-500 bg-red-900/30 text-red-400'
                    : 'border-white/10 text-white/40 hover:border-white/20 bg-white/5'
                }`}
              >
                {j === 'masuk' ? '⬆ Masuk (Pemasukan)' : '⬇ Keluar (Pengeluaran)'}
              </button>
            ))}
          </div>
        </div>

        {/* Nominal */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nominal (Rp)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/40 font-medium">Rp</span>
            <input
              type="number"
              required
              min="1000"
              value={form.nominal}
              onChange={e => set('nominal', e.target.value)}
              className={`${INPUT_CLS} pl-12`}
              placeholder="500000"
            />
          </div>
        </div>

        {/* Sumber / Tujuan */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            {form.jenis === 'masuk' ? 'Sumber Dana' : 'Tujuan / Keterangan'}
            <span className="text-white/30 font-normal"> (opsional)</span>
          </label>
          <input
            type="text"
            value={form.sumber}
            onChange={e => set('sumber', e.target.value)}
            className={INPUT_CLS}
            placeholder={form.jenis === 'masuk' ? 'Nama donatur atau sumber kotak' : 'Keperluan pengeluaran'}
          />
          {/* Preset chips */}
          <div className="flex flex-wrap gap-2 mt-2">
            {SUMBER_PRESET[form.jenis].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => set('sumber', p)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors border ${
                  form.sumber === p
                    ? 'bg-[#C9A84C]/20 border-[#C9A84C]/50 text-[#C9A84C]'
                    : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Tanggal Transaksi</label>
          <input
            type="date"
            required
            max={today}
            value={form.tanggal}
            onChange={e => set('tanggal', e.target.value)}
            className={INPUT_CLS}
          />
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Catatan <span className="text-white/30 font-normal">(opsional)</span>
          </label>
          <textarea
            rows={2}
            value={form.catatan}
            onChange={e => set('catatan', e.target.value)}
            className={`${INPUT_CLS} resize-none`}
            placeholder="Keterangan tambahan..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/infaq/insidentil"
            className="flex-1 py-3 text-center bg-white/5 border border-white/10 text-white/60 font-semibold rounded-xl hover:bg-white/10 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </div>
  );
}
