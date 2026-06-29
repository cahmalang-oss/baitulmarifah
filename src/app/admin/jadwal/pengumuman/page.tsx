'use client';

import { useState, useEffect } from 'react';

type Pengumuman = { id: string; isi: string; urutan: number; aktif: boolean };

export default function PengumumanPage() {
  const [list, setList] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pengumuman | null>(null);
  const [isi, setIsi] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/jadwal?jenis=pengumuman')
      .then(r => r.json())
      .then(j => { setList(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setIsi(''); setShowForm(true); };
  const openEdit = (p: Pengumuman) => { setEditing(p); setIsi(p.isi); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const method = editing ? 'PATCH' : 'POST';
      const body = editing
        ? { id: editing.id, isi }
        : { isi, urutan: (list.length ? Math.max(...list.map(p => p.urutan)) : 0) + 1, aktif: true };
      const res = await fetch('/api/admin/jadwal?jenis=pengumuman', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setMsg({ type: 'ok', text: editing ? 'Pengumuman diperbarui' : 'Pengumuman ditambahkan' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    await fetch('/api/admin/jadwal?jenis=pengumuman', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    });
    load();
  };

  const handleToggle = async (p: Pengumuman) => {
    await fetch('/api/admin/jadwal?jenis=pengumuman', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, aktif: !p.aktif }),
    });
    load();
  };

  const moveUrutan = async (p: Pengumuman, dir: -1 | 1) => {
    const idx = list.findIndex(x => x.id === p.id);
    const target = list[idx + dir];
    if (!target) return;
    await Promise.all([
      fetch('/api/admin/jadwal?jenis=pengumuman', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, urutan: target.urutan }) }),
      fetch('/api/admin/jadwal?jenis=pengumuman', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: target.id, urutan: p.urutan }) }),
    ]);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pengumuman Ticker</h1>
          <p className="text-white/50 text-sm mt-1">Teks berjalan di layar TV</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-[#C9A84C] text-black font-semibold rounded-xl text-sm hover:bg-[#C9A84C]/90 transition">
          + Tambah
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm border ${msg.type === 'ok' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300'}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Isi Pengumuman</label>
                <textarea required rows={3} value={isi} onChange={e => setIsi(e.target.value)}
                  placeholder="Contoh: Pengajian rutin Ahad pagi pukul 07.00 WIB · Zakat Fitrah dibuka mulai 1 Ramadhan"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white placeholder:text-white/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#C9A84C] text-black font-semibold text-sm disabled:opacity-50 transition">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-white/40">Memuat...</div>
      ) : (
        <div className="space-y-2">
          {list.map((p, idx) => (
            <div key={p.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${p.aktif ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-50'}`}>
              <div className="flex flex-col gap-1">
                <button onClick={() => moveUrutan(p, -1)} disabled={idx === 0} className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition text-xs">▲</button>
                <button onClick={() => moveUrutan(p, 1)} disabled={idx === list.length - 1} className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition text-xs">▼</button>
              </div>
              <span className="text-xs text-white/20 font-mono w-5">{p.urutan}</span>
              <p className="flex-1 text-sm text-white/80">{p.isi}</p>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition ${p.aktif ? 'border-green-500/30 text-green-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-500/30' : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}>
                  {p.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button onClick={() => openEdit(p)} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-300 hover:border-red-500/40 transition">Hapus</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="text-center py-16 text-white/30">Belum ada pengumuman</div>}
        </div>
      )}

      <div className="mt-6 p-4 bg-white/3 border border-white/8 rounded-xl">
        <p className="text-xs text-white/40">Preview ticker: teks aktif akan bergulir di bagian bawah layar TV secara berurutan.</p>
        {list.filter(p => p.aktif).length > 0 && (
          <div className="mt-2 overflow-hidden rounded-lg bg-black/40 border border-white/10">
            <p className="text-xs text-[#C9A84C] py-2 px-3 whitespace-nowrap overflow-hidden text-ellipsis">
              📢 {list.filter(p => p.aktif).map(p => p.isi).join(' · ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
