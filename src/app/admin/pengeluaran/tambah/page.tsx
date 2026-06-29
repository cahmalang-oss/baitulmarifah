'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const KEPERLUAN_PRESET: Record<string, string[]> = {
  pengeluaran_infaq: ['Operasional Masjid', 'Listrik & Air', 'Gaji Marbot', 'Pembelian ATK', 'Kebersihan', 'Perbaikan Ringan', 'Perlengkapan Ibadah', 'Konsumsi Rapat'],
  pengeluaran_kurban: ['Pembelian Hewan Kurban', 'Biaya Penyembelihan', 'Biaya Distribusi Daging', 'Perlengkapan Kurban', 'Konsumsi Panitia'],
};

const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition';

export default function TambahPengeluaranPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    jenis_kas: '',
    nominal: '',
    sumber: '',
    tanggal: today,
    catatan: '',
  });

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.jenis_kas) { setError('Pilih jenis kas terlebih dahulu'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nominal: parseInt(form.nominal, 10),
          sumber: form.sumber,
          tanggal: form.tanggal,
          catatan: form.catatan,
          jenis_kas: form.jenis_kas,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); setLoading(false); return; }
      router.push('/admin/pengeluaran');
    } catch {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  const presets = KEPERLUAN_PRESET[form.jenis_kas] || [];

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pengeluaran" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tambah Pengeluaran</h1>
          <p className="text-white/50 text-sm mt-0.5">Catat pengeluaran masjid.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Jenis Kas — wajib dipilih dulu */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Jenis Kas <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'pengeluaran_infaq', label: 'Kas Infaq', emoji: '🤲', color: 'border-purple-500/50 bg-purple-900/20 text-purple-300' },
              { val: 'pengeluaran_kurban', label: 'Kas Kurban', emoji: '🐄', color: 'border-amber-500/50 bg-amber-900/20 text-amber-300' },
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => { set('jenis_kas', opt.val); set('sumber', ''); }}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-1.5 font-semibold text-sm transition-all ${
                  form.jenis_kas === opt.val ? opt.color + ' scale-[1.02]' : 'border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nominal (Rp) <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/40 font-medium">Rp</span>
            <input
              type="number"
              required
              min="1000"
              value={form.nominal}
              onChange={e => set('nominal', e.target.value)}
              className={`${INPUT_CLS} pl-12`}
              placeholder="150000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Keperluan / Tujuan <span className="text-white/30 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={form.sumber}
            onChange={e => set('sumber', e.target.value)}
            className={INPUT_CLS}
            placeholder="Misal: Pembelian hewan kurban sapi"
          />
          {presets.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {presets.map(p => (
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
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Tanggal <span className="text-red-400">*</span></label>
          <input
            type="date"
            required
            max={today}
            value={form.tanggal}
            onChange={e => set('tanggal', e.target.value)}
            className={INPUT_CLS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Catatan <span className="text-white/30 font-normal">(opsional)</span></label>
          <textarea
            rows={2}
            value={form.catatan}
            onChange={e => set('catatan', e.target.value)}
            className={`${INPUT_CLS} resize-none`}
            placeholder="Keterangan tambahan..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/pengeluaran"
            className="flex-1 py-3 text-center bg-white/5 border border-white/10 text-white/60 font-semibold rounded-xl hover:bg-white/10 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || !form.jenis_kas}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
          </button>
        </div>
      </form>
    </div>
  );
}
