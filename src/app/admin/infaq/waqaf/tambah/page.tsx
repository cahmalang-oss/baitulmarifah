'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SUMBER_PRESET = ['Kotak Waqaf', 'Transfer BSI', 'QRIS', 'Donatur Pribadi', 'Waqaf Kanopi Masjid'];

const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition';

export default function TambahWaqafPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({ nominal: '', sumber: '', tanggal: today, catatan: '' });
  const [bukti, setBukti] = useState<File | null>(null);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.set('nominal', String(parseInt(form.nominal, 10)));
      formData.set('sumber', form.sumber);
      formData.set('tanggal', form.tanggal);
      formData.set('catatan', form.catatan);
      if (bukti) formData.set('bukti', bukti);

      const res = await fetch('/api/admin/infaq/waqaf', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); setLoading(false); return; }
      router.push('/admin/infaq/waqaf');
    } catch {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/infaq/waqaf" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tambah Penerimaan Waqaf</h1>
          <p className="text-white/50 text-sm mt-0.5">Catat pemasukan dana waqaf.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nominal (Rp)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/40 font-medium">Rp</span>
            <input type="number" required min="1000" value={form.nominal}
              onChange={e => set('nominal', e.target.value)} className={`${INPUT_CLS} pl-12`} placeholder="500000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Sumber / Donatur <span className="text-white/30 font-normal">(opsional)</span>
          </label>
          <input type="text" value={form.sumber} onChange={e => set('sumber', e.target.value)}
            className={INPUT_CLS} placeholder="Nama donatur atau sumber" />
          <div className="flex flex-wrap gap-2 mt-2">
            {SUMBER_PRESET.map(p => (
              <button key={p} type="button" onClick={() => set('sumber', p)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors border ${
                  form.sumber === p ? 'bg-teal-500/20 border-teal-500/50 text-teal-300' : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-white/10'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Tanggal Transaksi</label>
          <input type="date" required max={today} value={form.tanggal}
            onChange={e => set('tanggal', e.target.value)} className={INPUT_CLS} />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Catatan <span className="text-white/30 font-normal">(opsional)</span>
          </label>
          <textarea rows={2} value={form.catatan} onChange={e => set('catatan', e.target.value)}
            className={`${INPUT_CLS} resize-none`} placeholder="Keterangan tambahan..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Bukti Transfer / Foto <span className="text-white/30 font-normal">(opsional)</span>
          </label>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={e => setBukti(e.target.files?.[0] || null)}
            className="w-full text-sm text-white/60 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-teal-500/20 file:text-teal-300 file:text-sm file:font-semibold hover:file:bg-teal-500/30 cursor-pointer" />
          <p className="text-xs text-white/30 mt-1.5">Lampirkan jika ada. Untuk kas tunai boleh dikosongkan.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/admin/infaq/waqaf"
            className="flex-1 py-3 text-center bg-white/5 border border-white/10 text-white/60 font-semibold rounded-xl hover:bg-white/10 transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-teal-500 text-[#0F172A] font-bold rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </div>
  );
}
