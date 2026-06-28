'use client';

import { useState, useEffect } from 'react';

export default function DashboardGrupPage() {
  const [myGrup, setMyGrup] = useState<any>(null);
  const [availableGrups, setAvailableGrups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil profil jamaah (termasuk grup_id yang diikuti)
      const profileRes = await fetch('/api/jamaah/profil');
      const profileJson = await profileRes.json();
      const grupId = profileJson.profile?.grup_id;

      // Ambil semua grup dari admin (public endpoint sederhana)
      const grups = await fetch('/api/admin/grup').then(r => r.json());
      const allGrups = grups.data || [];

      if (grupId) {
        setMyGrup(allGrups.find((g: any) => g.id === grupId) || null);
        setAvailableGrups([]);
      } else {
        setMyGrup(null);
        // Hanya tampilkan yang belum penuh
        setAvailableGrups(allGrups.filter((g: any) => g.anggota_saat_ini < g.target_anggota));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleJoin = async (grupId: string) => {
    setJoining(grupId);
    const res = await fetch(`/api/jamaah/grup/${grupId}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) { fetchData(); }
    else alert(data.error || 'Gagal bergabung');
    setJoining(null);
  };

  if (loading) return <div className="p-10 text-center text-white/50">Memuat data grup...</div>;

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Grup Patungan</h1>
        <p className="text-white/50 text-sm">Bergabung dengan grup patungan sapi qurban.</p>
      </header>

      {myGrup ? (
        // Tampilkan grup yang sedang diikuti
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#C9A84C]/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐄</span>
              <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider bg-[#C9A84C]/10 px-2 py-0.5 rounded">Grup Anda</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">{myGrup.nama}</h2>
            <p className="text-white/50 text-sm">{myGrup.paket_nama}</p>

            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/40">Anggota</span>
                <span className="font-bold text-white">{myGrup.anggota_saat_ini}/{myGrup.target_anggota} orang</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-[#C9A84C] h-2 rounded-full" style={{ width: `${(myGrup.anggota_saat_ini / myGrup.target_anggota) * 100}%` }}></div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/40">Total Terkumpul Grup</p>
                  <p className="text-xl font-bold text-green-400">Rp {myGrup.terkumpul_saldo.toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Target Total</p>
                  <p className="text-lg font-bold text-white">Rp {myGrup.paket_harga.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${myGrup.progress_persen}%` }}></div>
              </div>
              <p className="text-right text-xs text-green-400 mt-1 font-bold">{myGrup.progress_persen}% terkumpul</p>
            </div>
          </div>

          <p className="text-white/30 text-xs text-center">Untuk pindah grup atau keluar, hubungi admin masjid.</p>
        </div>
      ) : (
        // Tampilkan daftar grup yang bisa diikuti
        <div className="space-y-4">
          <p className="text-white/50 text-sm">Anda belum bergabung dengan grup patungan. Pilih grup di bawah:</p>

          {availableGrups.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <p className="text-white/40">Tidak ada grup yang tersedia saat ini.</p>
              <p className="text-white/30 text-sm mt-1">Semua grup sudah penuh atau belum ada yang dibuka. Hubungi admin masjid.</p>
            </div>
          ) : availableGrups.map(g => (
            <div key={g.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">{g.nama}</h3>
                  <p className="text-white/50 text-sm">{g.paket_nama}</p>
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-900/30 px-2 py-1 rounded-lg">
                  {g.anggota_saat_ini}/{g.target_anggota} anggota
                </span>
              </div>

              <div className="flex gap-3 items-center mt-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">Slot tersisa</span>
                    <span className="text-green-400 font-bold">{g.target_anggota - g.anggota_saat_ini} slot</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(g.anggota_saat_ini / g.target_anggota) * 100}%` }}></div>
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(g.id)}
                  disabled={joining === g.id}
                  className="px-5 py-2.5 bg-[#C9A84C] hover:bg-[#D4B869] text-[#0F172A] font-bold rounded-xl text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {joining === g.id ? 'Bergabung...' : 'Gabung'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
