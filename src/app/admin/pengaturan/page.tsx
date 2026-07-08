'use client';

import { useState, useEffect } from 'react';

const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition';

const SETTING_FIELDS = [
  { key: 'nama_masjid', label: 'Nama Masjid', placeholder: 'Masjid Baitul Marifah', icon: '🕌' },
  { key: 'alamat_masjid', label: 'Alamat Masjid', placeholder: 'Jl. ...', icon: '📍' },
  { key: 'no_rekening_bsi', label: 'Nomor Rekening BSI', placeholder: '7XXXXXXXXXX', icon: '🏦' },
  { key: 'nama_rekening', label: 'Nama Rekening', placeholder: 'Masjid Baitul Marifah', icon: '👤' },
  { key: 'info_qris', label: 'Info QRIS', placeholder: 'Scan QRIS di papan pengumuman masjid, atau tanyakan ke marbot', icon: '📱' },
  { key: 'no_wa_pengurus', label: 'No WA Pengurus (untuk kontak)', placeholder: '6281234567890', icon: '📞' },
];

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingQris, setUploadingQris] = useState(false);

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQris(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'qris');
      const res = await fetch('/api/admin/jadwal/upload', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setSettings(prev => ({ ...prev, qris_image_url: j.url }));
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah QRIS');
    } finally {
      setUploadingQris(false);
    }
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(j => { if (j.settings) setSettings(j.settings); })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="text-[#C9A84C]/70 text-xs uppercase tracking-widest font-semibold mb-1">Sistem</p>
        <h1 className="text-2xl font-bold text-white">Pengaturan Masjid</h1>
        <p className="text-white/40 text-sm mt-1">Informasi masjid, rekening bank, dan kontak pengurus.</p>
      </header>

      {loading ? (
        <div className="text-center py-20 text-white/40">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Info Masjid */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-xs font-semibold text-[#C9A84C]/70 uppercase tracking-widest border-b border-white/8 pb-3">Informasi Masjid</h2>

            {SETTING_FIELDS.slice(0, 2).map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-white/70 mb-1">{field.label}</label>
                <input
                  type="text"
                  value={settings[field.key] || ''}
                  onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className={INPUT_CLS}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          {/* Info Bank */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-xs font-semibold text-[#C9A84C]/70 uppercase tracking-widest border-b border-white/8 pb-3">Rekening &amp; Pembayaran</h2>
            <p className="text-xs text-white/40">Info ini akan ditampilkan di halaman setoran jamaah sebagai panduan transfer.</p>

            {SETTING_FIELDS.slice(2, 5).map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-white/70 mb-1">{field.label}</label>
                {field.key === 'info_qris' ? (
                  <textarea
                    rows={3}
                    value={settings[field.key] || ''}
                    onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className={`${INPUT_CLS} resize-none`}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={settings[field.key] || ''}
                    onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className={INPUT_CLS}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            {/* Upload gambar QRIS */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Gambar QRIS</label>
              <p className="text-xs text-white/40 mb-2">Upload gambar QRIS resmi. Akan ditampilkan di halaman infaq jamaah.</p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleQrisUpload}
                disabled={uploadingQris}
                className="w-full text-sm text-white/60 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#C9A84C]/20 file:text-[#C9A84C] file:text-sm file:font-semibold hover:file:bg-[#C9A84C]/30 cursor-pointer"
              />
              {uploadingQris && <p className="text-xs text-[#C9A84C] mt-2">Mengupload...</p>}
              {settings.qris_image_url && (
                <div className="mt-3 inline-block bg-white p-2 rounded-xl">
                  <img src={settings.qris_image_url} alt="QRIS" className="h-40 w-40 object-contain" />
                </div>
              )}
            </div>

            {/* Preview info rekening */}
            {(settings.no_rekening_bsi || settings.nama_rekening) && (
              <div className="bg-[#0F172A] border border-[#C9A84C]/20 rounded-xl p-4">
                <p className="text-xs text-[#C9A84C] font-semibold mb-2">Preview tampilan di halaman setoran:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-xl flex items-center justify-center text-xl">🏦</div>
                  <div>
                    <p className="text-white font-bold">BSI — {settings.no_rekening_bsi || 'XXXXXXXXXXXXX'}</p>
                    <p className="text-white/50 text-sm">a.n. {settings.nama_rekening || 'Nama Rekening'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kontak */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-xs font-semibold text-[#C9A84C]/70 uppercase tracking-widest border-b border-white/8 pb-3">Kontak Pengurus</h2>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">{SETTING_FIELDS[5].label}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/40 text-sm">+</span>
                <input
                  type="text"
                  value={settings.no_wa_pengurus || ''}
                  onChange={e => setSettings(prev => ({ ...prev, no_wa_pengurus: e.target.value.replace(/[^0-9]/g, '') }))}
                  className={`${INPUT_CLS} pl-8`}
                  placeholder={SETTING_FIELDS[5].placeholder}
                />
              </div>
              <p className="text-xs text-white/30 mt-1">Format internasional tanpa + (contoh: 6281234567890)</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">{error}</div>
          )}

          {saved && (
            <div className="p-4 bg-green-900/30 border border-green-500/30 text-green-300 rounded-xl text-sm flex items-center gap-2">
              <span>✅</span> Pengaturan berhasil disimpan!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-gold-shimmer w-full py-3.5 disabled:opacity-50 disabled:animate-none"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      )}
    </div>
  );
}
