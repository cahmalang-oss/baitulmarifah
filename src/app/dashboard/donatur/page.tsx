'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition';

export default function DonaturPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'terdaftar' | 'belum'>('loading');
  const [donaturData, setDonaturData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [form, setForm] = useState({
    nominal_komitmen: '',
    metode_bayar: 'tunai',
    mulai_bulan: defaultBulan,
    keterangan: '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch('/api/jamaah/donatur')
      .then(r => r.json())
      .then(j => {
        if (j.donatur) {
          setDonaturData(j.donatur);
          setRiwayat(j.riwayat || []);
          setStatus('terdaftar');
        } else {
          setStatus('belum');
        }
      })
      .catch(() => setStatus('belum'));
  }, []);

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/jamaah/donatur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nominal_komitmen: parseInt(form.nominal_komitmen, 10) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Gagal mendaftar'); setLoading(false); return; }
      setDonaturData(data.donatur);
      setStatus('terdaftar');
      setShowForm(false);
      setSuccess('Berhasil terdaftar sebagai donatur tetap!');
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-6 text-center text-white/40 pt-16">Memuat data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Donatur Tetap</h1>
        <p className="text-white/50 text-sm mt-1">Daftarkan diri sebagai donatur infaq rutin bulanan.</p>
      </header>

      {success && (
        <div className="p-4 bg-green-900/30 border border-green-500/30 text-green-300 rounded-xl text-sm">
          ✅ {success}
        </div>
      )}

      {status === 'terdaftar' && donaturData ? (
        <div className="space-y-4">
          {/* Status Card */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#C9A84C]/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl">🤝</div>
              <div>
                <p className="text-xs text-white/50">Status</p>
                <p className="text-green-400 font-bold text-sm">Donatur Tetap Aktif</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Komitmen / Bulan</span>
                <span className="text-[#C9A84C] font-bold">{fmt(donaturData.nominal_komitmen)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Metode Bayar</span>
                <span className="text-white font-medium capitalize">{donaturData.metode_bayar?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Mulai Sejak</span>
                <span className="text-white font-medium">
                  {new Date(donaturData.mulai_bulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              {donaturData.keterangan && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Keterangan</span>
                  <span className="text-white/70">{donaturData.keterangan}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
            💡 Untuk mengubah nominal komitmen atau metode bayar, hubungi admin masjid.
          </div>

          {/* Riwayat Realisasi */}
          {riwayat.length > 0 && (
            <div>
              <h3 className="text-white font-bold mb-3">Riwayat Realisasi</h3>
              <div className="space-y-2">
                {riwayat.map((r: any) => (
                  <div key={r.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white/70 text-sm font-medium">
                        {new Date(r.bulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#C9A84C] font-bold text-sm">{fmt(r.nominal_realisasi)}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        r.status === 'lunas' ? 'bg-green-900/40 text-green-400' :
                        r.status === 'kurang' ? 'bg-yellow-900/40 text-yellow-400' :
                        'bg-red-900/40 text-red-400'
                      }`}>
                        {r.status === 'lunas' ? 'Lunas' : r.status === 'kurang' ? 'Kurang' : 'Belum Bayar'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!showForm ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-3xl mx-auto">🤲</div>
              <div>
                <p className="text-white font-bold">Belum Terdaftar sebagai Donatur Tetap</p>
                <p className="text-white/50 text-sm mt-1">Daftarkan diri untuk berkomitmen infaq rutin setiap bulan.</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3.5 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors"
              >
                Daftar Donatur Tetap
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setShowForm(false)} className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white">←</button>
                <h2 className="text-lg font-bold text-white">Form Pendaftaran</h2>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{error}</div>
              )}

              <form onSubmit={handleDaftar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nominal Komitmen / Bulan <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/40 font-medium">Rp</span>
                    <input
                      type="number"
                      required
                      min="10000"
                      value={form.nominal_komitmen}
                      onChange={e => set('nominal_komitmen', e.target.value)}
                      className={`${INPUT_CLS} pl-12`}
                      placeholder="100000"
                    />
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[50000, 100000, 150000, 200000, 500000].map(n => (
                      <button key={n} type="button" onClick={() => set('nominal_komitmen', String(n))}
                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${form.nominal_komitmen === String(n) ? 'bg-[#C9A84C]/20 border-[#C9A84C]/50 text-[#C9A84C]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}>
                        {fmt(n)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Metode Bayar</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'tunai', label: '💵 Tunai' },
                      { value: 'transfer_bsi', label: '🏦 Transfer' },
                      { value: 'qris', label: '📱 QRIS' },
                    ].map(m => (
                      <button key={m.value} type="button" onClick={() => set('metode_bayar', m.value)}
                        className={`py-2.5 rounded-xl border-2 font-semibold text-xs transition-colors ${form.metode_bayar === m.value ? 'border-[#C9A84C] bg-[#C9A84C]/20 text-[#C9A84C]' : 'border-white/10 text-white/40 bg-white/5'}`}>
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

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50">
                  {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
