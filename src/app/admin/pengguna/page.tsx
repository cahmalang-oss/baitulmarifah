'use client';

import { useState, useEffect } from 'react';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  bendahara: 'Bendahara',
  verifikator: 'Verifikator',
  jamaah: 'Jamaah',
  petugas_keuangan: 'Petugas Keuangan',
  petugas_verifikasi: 'Petugas Verifikasi',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-900/40 text-red-300 border-red-500/30',
  bendahara: 'bg-blue-900/40 text-blue-300 border-blue-500/30',
  verifikator: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
  jamaah: 'bg-white/10 text-white/50 border-white/15',
  petugas_keuangan: 'bg-cyan-900/40 text-cyan-300 border-cyan-500/30',
  petugas_verifikasi: 'bg-indigo-900/40 text-indigo-300 border-indigo-500/30',
};

export default function PenggunaPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/pengguna')
      .then(r => r.json())
      .then(j => { setUsers(j.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/pengguna', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: 'err', text: data.error || 'Gagal mengubah role' }); return; }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMsg({ type: 'ok', text: 'Role berhasil diubah' });
    } catch {
      setMsg({ type: 'err', text: 'Terjadi kesalahan jaringan' });
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter(u =>
    u.nama?.toLowerCase().includes(search.toLowerCase()) ||
    u.no_wa?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Pengguna</h1>
          <p className="text-white/50 text-sm mt-1">Kelola role dan akses pengguna</p>
        </div>
        <span className="text-xs text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
          {users.length} pengguna
        </span>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm border ${msg.type === 'ok' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300'}`}>
          {msg.text}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama atau nomor WA..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/30 rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/40">Memuat data...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => (
            <div key={user.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.nama}</p>
                  <p className="text-xs text-white/40 mt-0.5">{user.no_wa || '—'}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border flex-shrink-0 ${ROLE_COLORS[user.role] || ROLE_COLORS.jamaah}`}>
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                {Object.entries(ROLE_LABELS).map(([roleKey, roleLabel]) => (
                  <button
                    key={roleKey}
                    disabled={user.role === roleKey || updating === user.id}
                    onClick={() => handleRoleChange(user.id, roleKey)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all disabled:opacity-40 ${
                      user.role === roleKey
                        ? 'border-[#C9A84C]/50 bg-[#C9A84C]/10 text-[#C9A84C]'
                        : 'border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    {updating === user.id && user.role !== roleKey ? '...' : roleLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">Tidak ada pengguna ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
}
