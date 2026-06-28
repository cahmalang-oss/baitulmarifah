'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilForm({ 
  initialData 
}: { 
  initialData: { nama: string; alamat: string | null; no_wa: string; paket_nama?: string } 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pinMode, setPinMode] = useState(false);

  const [formData, setFormData] = useState({
    nama: initialData.nama,
    alamat: initialData.alamat || ''
  });

  const [pinData, setPinData] = useState({
    oldPin: '',
    newPin: '',
    newPinConfirm: ''
  });

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess('');

    try {
      const res = await fetch('/api/jamaah/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profil', ...formData })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('Profil berhasil diperbarui');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess('');

    if (pinData.newPin !== pinData.newPinConfirm) {
      setErrorMsg('Konfirmasi PIN baru tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/jamaah/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_pin', ...pinData })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('PIN berhasil diperbarui');
      setPinMode(false);
      setPinData({ oldPin: '', newPin: '', newPinConfirm: '' });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-900/30 border border-green-500/30 text-green-300 rounded-xl text-sm">
          {success}
        </div>
      )}

      {/* Info Read-Only */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-xs text-white/50 block mb-1">Nomor WhatsApp (Tidak dapat diubah)</label>
          <div className="text-white font-medium bg-black/20 p-3 rounded-lg border border-white/5">
            {initialData.no_wa}
          </div>
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">Paket yang Diikuti</label>
          <div className="text-[#C9A84C] font-bold bg-black/20 p-3 rounded-lg border border-[#C9A84C]/20">
            {initialData.paket_nama || 'Belum memilih paket'}
          </div>
        </div>
      </div>

      {/* Form Update Profil */}
      <form onSubmit={handleUpdateProfil} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">Data Pribadi</h2>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={formData.nama}
            onChange={(e) => setFormData({...formData, nama: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Alamat Lengkap</label>
          <textarea
            value={formData.alamat}
            onChange={(e) => setFormData({...formData, alamat: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none resize-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#1E293B] text-white border border-[#C9A84C]/50 font-bold rounded-xl hover:bg-[#C9A84C] hover:text-[#0F172A] transition-colors"
        >
          Simpan Profil
        </button>
      </form>

      {/* Form Ganti PIN */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Keamanan</h2>
          <button 
            onClick={() => setPinMode(!pinMode)}
            className="text-xs text-[#C9A84C] hover:underline"
          >
            {pinMode ? 'Batal' : 'Ganti PIN'}
          </button>
        </div>

        {pinMode && (
          <form onSubmit={handleUpdatePin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">PIN Saat Ini</label>
              <input
                type="password"
                maxLength={6}
                value={pinData.oldPin}
                onChange={(e) => setPinData({...pinData, oldPin: e.target.value.replace(/[^0-9]/g, '')})}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl tracking-widest text-center focus:border-[#C9A84C] outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">PIN Baru</label>
              <input
                type="password"
                maxLength={6}
                value={pinData.newPin}
                onChange={(e) => setPinData({...pinData, newPin: e.target.value.replace(/[^0-9]/g, '')})}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl tracking-widest text-center focus:border-[#C9A84C] outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Konfirmasi PIN Baru</label>
              <input
                type="password"
                maxLength={6}
                value={pinData.newPinConfirm}
                onChange={(e) => setPinData({...pinData, newPinConfirm: e.target.value.replace(/[^0-9]/g, '')})}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl tracking-widest text-center focus:border-[#C9A84C] outline-none font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-900/50 text-red-200 border border-red-500/30 font-bold rounded-xl hover:bg-red-800 transition-colors"
            >
              Update PIN
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
