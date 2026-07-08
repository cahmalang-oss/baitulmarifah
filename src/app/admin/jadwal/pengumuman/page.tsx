'use client';

import { useState, useEffect, useRef } from 'react';

type Pengumuman = { id: string; judul: string | null; isi: string; flyer_url: string | null; urutan: number; aktif: boolean };

export default function PengumumanPage() {
  const [list, setList] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pengumuman | null>(null);
  const [form, setForm] = useState({ judul: '', isi: '', aktif: true });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const flyerRef = useRef<HTMLInputElement>(null);

  // Hadits harian (multi)
  type Hadits = { id: string; teks: string; sumber: string | null; aktif: boolean };
  const [haditsList, setHaditsList] = useState<Hadits[]>([]);
  const [hadits, setHadits] = useState('');
  const [sumber, setSumber] = useState('');
  const [savingHadits, setSavingHadits] = useState(false);
  const [haditsMsg, setHaditsMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/jadwal?jenis=pengumuman')
      .then(r => r.json())
      .then(j => { setList(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const loadHadits = () => {
    fetch('/api/admin/hadits').then(r => r.json()).then(j => setHaditsList(j.data || [])).catch(() => {});
  };

  useEffect(() => {
    load();
    loadHadits();
  }, []);

  const openAdd = () => { setEditing(null); setForm({ judul: '', isi: '', aktif: true }); setShowForm(true); };
  const openEdit = (p: Pengumuman) => { setEditing(p); setForm({ judul: p.judul || '', isi: p.isi, aktif: p.aktif }); setShowForm(true); };

  const uploadFlyer = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'pengumuman');
    const res = await fetch('/api/admin/jadwal/upload', { method: 'POST', body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error);
    return j.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      let flyer_url = editing?.flyer_url || null;
      if (flyerRef.current?.files?.[0]) {
        setUploading(true);
        flyer_url = await uploadFlyer(flyerRef.current.files[0]);
        setUploading(false);
      }

      const method = editing ? 'PATCH' : 'POST';
      const body = editing
        ? { id: editing.id, ...form, flyer_url }
        : { ...form, flyer_url, urutan: (list.length ? Math.max(...list.map(p => p.urutan)) : 0) + 1 };

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
      setUploading(false);
    }
  };

  const handleSaveHadits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHadits(true);
    setHaditsMsg(null);
    try {
      const res = await fetch('/api/admin/hadits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teks: hadits, sumber }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setHaditsMsg({ type: 'ok', text: 'Hadits ditambahkan' });
      setHadits(''); setSumber('');
      loadHadits();
    } catch (err: any) {
      setHaditsMsg({ type: 'err', text: err.message });
    } finally {
      setSavingHadits(false);
    }
  };

  const handleToggleHadits = async (h: Hadits) => {
    await fetch('/api/admin/hadits', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: h.id, aktif: !h.aktif }),
    });
    loadHadits();
  };

  const handleDeleteHadits = async (id: string) => {
    if (!confirm('Hapus hadits ini?')) return;
    await fetch('/api/admin/hadits', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    });
    loadHadits();
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
    <div className="space-y-8">
      {/* ── Pengumuman ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Pengumuman</h1>
            <p className="text-white/50 text-sm mt-1">Dengan flyer → tampil di slide TV · Tanpa flyer → tampil di teks berjalan (ticker)</p>
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
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Judul (Opsional)</label>
                  <input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                    placeholder="Contoh: Agenda Masjid Bulan Juli"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white placeholder:text-white/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Isi Pengumuman <span className="text-red-400">*</span></label>
                  <textarea required rows={3} value={form.isi} onChange={e => setForm(f => ({ ...f, isi: e.target.value }))}
                    placeholder="Contoh: Pengajian rutin Ahad pagi pukul 07.00 WIB"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white placeholder:text-white/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Flyer / Gambar (Opsional)</label>
                  <input ref={flyerRef} type="file" accept="image/*"
                    className="w-full text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/70 file:text-sm" />
                  {editing?.flyer_url && (
                    <img src={editing.flyer_url} className="mt-2 rounded-lg h-24 object-cover" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="aktif-p" checked={form.aktif}
                    onChange={e => setForm(f => ({ ...f, aktif: e.target.checked }))} className="rounded" />
                  <label htmlFor="aktif-p" className="text-sm text-white/60">Tampilkan di TV</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition">
                    Batal
                  </button>
                  <button type="submit" disabled={saving || uploading}
                    className="flex-1 py-2.5 rounded-xl bg-[#C9A84C] text-black font-semibold text-sm disabled:opacity-50 transition">
                    {uploading ? 'Mengupload...' : saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-white/40">Memuat...</div>
        ) : (
          <div className="space-y-2">
            {list.map((p, idx) => (
              <div key={p.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${p.aktif ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-50'}`}>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveUrutan(p, -1)} disabled={idx === 0} className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition text-xs">▲</button>
                  <button onClick={() => moveUrutan(p, 1)} disabled={idx === list.length - 1} className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition text-xs">▼</button>
                </div>
                {p.flyer_url && <img src={p.flyer_url} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  {p.judul && <p className="text-sm font-bold text-[#C9A84C] truncate">{p.judul}</p>}
                  <p className="text-sm text-white/80 line-clamp-2">{p.isi}</p>
                  {p.flyer_url && <p className="text-xs text-white/30 mt-0.5">📎 Ada flyer</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition ${p.aktif ? 'border-green-500/30 text-green-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-500/30' : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}>
                    {p.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => openEdit(p)} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-300 hover:border-red-500/40 transition">Hapus</button>
                </div>
              </div>
            ))}
            {list.length === 0 && <div className="text-center py-12 text-white/30">Belum ada pengumuman</div>}
          </div>
        )}
      </div>

      {/* ── Hadits Harian ── */}
      <div className="border-t border-white/10 pt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Hadits / Ayat Harian</h2>
          <p className="text-white/50 text-sm mt-1">Ditampilkan di slide "Imam & Hikmah" pada layar TV</p>
        </div>

        {haditsMsg && (
          <div className={`mb-4 p-3 rounded-xl text-sm border ${haditsMsg.type === 'ok' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300'}`}>
            {haditsMsg.text}
          </div>
        )}

        <p className="text-xs text-white/40 mb-4">Tambahkan beberapa hadits/ayat. Yang aktif akan tampil bergantian secara acak di TV.</p>

        <form onSubmit={handleSaveHadits} className="space-y-3 max-w-2xl mb-6 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Teks Hadits / Ayat</label>
            <textarea required rows={3} value={hadits} onChange={e => setHadits(e.target.value)}
              placeholder="Contoh: Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya."
              className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white placeholder:text-white/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Sumber (HR. / QS.)</label>
            <input value={sumber} onChange={e => setSumber(e.target.value)}
              placeholder="Contoh: HR. Ahmad, Thabrani · atau · QS. Al-Baqarah: 261"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white placeholder:text-white/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]" />
          </div>
          <button type="submit" disabled={savingHadits}
            className="px-6 py-2.5 bg-[#C9A84C] text-black font-semibold rounded-xl text-sm hover:bg-[#C9A84C]/90 transition disabled:opacity-50">
            {savingHadits ? 'Menyimpan...' : '+ Tambah Hadits'}
          </button>
        </form>

        {/* Daftar hadits */}
        <div className="space-y-2 max-w-2xl">
          {haditsList.length === 0 && <p className="text-white/30 text-sm text-center py-6">Belum ada hadits</p>}
          {haditsList.map(h => (
            <div key={h.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${h.aktif ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-50'}`}>
              <span className="text-[#C9A84C] text-lg leading-none mt-0.5">❝</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-relaxed">{h.teks}</p>
                {h.sumber && <p className="text-[#C9A84C] text-xs font-bold mt-1 uppercase tracking-wide">{h.sumber}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleToggleHadits(h)} className={`text-xs px-3 py-1.5 rounded-lg border transition ${h.aktif ? 'border-green-500/30 text-green-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-500/30' : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}>
                  {h.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button onClick={() => handleDeleteHadits(h.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-300 hover:border-red-500/40 transition">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
