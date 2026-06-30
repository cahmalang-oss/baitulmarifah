'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SUMBER_PRESET = ['Kotak Jumat', 'Kotak Harian', 'Transfer BSI', 'QRIS', 'Donatur Pribadi', 'Event Masjid'];

const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition';

export default function TambahInsidentilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    nominal: '',
    sumber: '',
    tanggal: today,
    catatan: '',
  });
  const [bukti, setBukti] = useState<File | null>(null);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.set('jenis', 'masuk');
      formData.set('nominal', String(parseInt(form.nominal, 10)));
      formData.set('sumber', form.sumber);
      formData.set('tanggal', form.tanggal);
      formData.set('catatan', form.catatan);
      if (bukti) formData.set('bukti', bukti);

      const res = await fetch('/api/admin/infaq/insidentil', {
        method: 'POST',
        body: formData,
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
          <p className="text-white/50 text-sm mt-0.5">Catat penerimaan infaq & shadaqah.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* Sumber */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Sumber Dana
            <span className="text-white/30 font-normal"> (opsional)</span>
          </label>
          <input
            type="text"
            value={form.sumber}
            onChange={e => set('sumber', e.target.value)}
            className={INPUT_CLS}
            placeholder="Nama donatur atau sumber kotak"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {SUMBER_PRESET.map(p => (
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

        {/* Bukti Transfer */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Bukti Transfer / Foto Kotak Amal <span className="text-white/30 font-normal">(opsional)</span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={e => setBukti(e.target.files?.[0] || null)}
            className="w-full text-sm text-white/60 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#C9A84C]/20 file:text-[#C9A84C] file:text-sm file:font-semibold hover:file:bg-[#C9A84C]/30 cursor-pointer"
          />
          <p className="text-xs text-white/30 mt-1.5">Lampirkan jika ada (transfer/QRIS). Untuk kas tunai/kotak amal tanpa bukti fisik boleh dikosongkan.</p>
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
