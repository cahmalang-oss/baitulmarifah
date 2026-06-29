'use client';

import { useState, useEffect, useRef } from 'react';

type ModeTampil = 'flyer' | 'manual' | 'manual_foto';

type Kajian = {
  id: string;
  judul: string;
  pemateri: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  keterangan: string;
  mode_tampil: ModeTampil;
  flyer_url: string | null;
  foto_penceramah_url: string | null;
  aktif: boolean;
};

const EMPTY: Omit<Kajian, 'id'> = {
  judul: '', pemateri: '', tanggal: '', waktu: '', lokasi: '', keterangan: '',
  mode_tampil: 'manual', flyer_url: null, foto_penceramah_url: null, aktif: true,
};

export default function KajianPage() {
  const [list, setList] = useState<Kajian[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Kajian | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const flyerRef = useRef<HTMLInputElement>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/jadwal?jenis=kajian')
      .then(r => r.json())
      .then(j => { setList(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); };
  const openEdit = (k: Kajian) => { setEditing(k); setForm({ ...k }); setShowForm(true); };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
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
      const payload = { ...form };

      // Handle file uploads
      if (form.mode_tampil === 'flyer' || form.mode_tampil === 'manual_foto') {
        setUploading(true);
        if (flyerRef.current?.files?.[0]) {
          payload.flyer_url = await uploadFile(flyerRef.current.files[0], 'flyer');
        }
        if (fotoRef.current?.files?.[0]) {
          payload.foto_penceramah_url = await uploadFile(fotoRef.current.files[0], 'foto-penceramah');
        }
        setUploading(false);
      }

      const method = editing ? 'PATCH' : 'POST';
      const body = editing ? { ...payload, id: editing.id } : payload;
      const res = await fetch('/api/admin/jadwal?jenis=kajian', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setMsg({ type: 'ok', text: editing ? 'Kajian diperbarui' : 'Kajian ditambahkan' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal kajian ini?')) return;
    await fetch('/api/admin/jadwal?jenis=kajian', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const handleToggleAktif = async (k: Kajian) => {
    await fetch('/api/admin/jadwal?jenis=kajian', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: k.id, aktif: !k.aktif }),
    });
    load();
  };

  const modeBadge: Record<ModeTampil, string> = {
    flyer: 'bg-amber-900/40 text-amber-300 border-amber-500/30',
    manual: 'bg-blue-900/40 text-blue-300 border-blue-500/30',
    manual_foto: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
  };
  const modeLabel: Record<ModeTampil, string> = { flyer: 'Flyer', manual: 'Manual', manual_foto: 'Manual + Foto' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Jadwal Kajian</h1>
          <p className="text-white/50 text-sm mt-1">Kelola jadwal kajian masjid</p>
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
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Kajian' : 'Tambah Kajian'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Mode Tampil</label>
                <div className="flex gap-2">
                  {(['manual', 'manual_foto', 'flyer'] as ModeTampil[]).map(m => (
                    <button key={m} type="button"
                      onClick={() => setForm(f => ({ ...f, mode_tampil: m }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${form.mode_tampil === m ? 'bg-[#C9A84C]/20 border-[#C9A84C]/60 text-[#C9A84C]' : 'border-white/10 text-white/40 hover:text-white'}`}>
                      {modeLabel[m]}
                    </button>
                  ))}
                </div>
              </div>

              {form.mode_tampil === 'flyer' ? (
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Upload Flyer</label>
                  <input ref={flyerRef} type="file" accept="image/*"
                    className="w-full text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/70 file:text-sm" />
                  {form.flyer_url && <img src={form.flyer_url} className="mt-2 rounded-lg h-24 object-cover" />}
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Judul Kajian</label>
                    <input required value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Pemateri</label>
                      <input value={form.pemateri} onChange={e => setForm(f => ({ ...f, pemateri: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Tanggal</label>
                      <input required type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Waktu</label>
                      <input type="time" value={form.waktu} onChange={e => setForm(f => ({ ...f, waktu: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Lokasi</label>
                      <input value={form.lokasi} onChange={e => setForm(f => ({ ...f, lokasi: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Keterangan</label>
                    <textarea rows={2} value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none" />
                  </div>
                  {form.mode_tampil === 'manual_foto' && (
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Foto Penceramah</label>
                      <input ref={fotoRef} type="file" accept="image/*"
                        className="w-full text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/70 file:text-sm" />
                      {form.foto_penceramah_url && <img src={form.foto_penceramah_url} className="mt-2 rounded-full h-16 w-16 object-cover" />}
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" id="aktif-kajian" checked={form.aktif}
                  onChange={e => setForm(f => ({ ...f, aktif: e.target.checked }))} className="rounded" />
                <label htmlFor="aktif-kajian" className="text-sm text-white/60">Tampilkan di TV</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition">
                  Batal
                </button>
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 py-2.5 rounded-xl bg-[#C9A84C] text-black font-semibold text-sm hover:bg-[#C9A84C]/90 transition disabled:opacity-50">
                  {uploading ? 'Mengupload...' : saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-white/40">Memuat...</div>
      ) : (
        <div className="space-y-3">
          {list.map(k => (
            <div key={k.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                {k.flyer_url && k.mode_tampil === 'flyer' && (
                  <img src={k.flyer_url} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                {k.foto_penceramah_url && k.mode_tampil === 'manual_foto' && (
                  <img src={k.foto_penceramah_url} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${modeBadge[k.mode_tampil]}`}>
                      {modeLabel[k.mode_tampil]}
                    </span>
                    {!k.aktif && <span className="text-[10px] text-white/30 border border-white/10 px-2 py-0.5 rounded-full">Nonaktif</span>}
                  </div>
                  <p className="font-semibold text-white">{k.judul || '(flyer)'}</p>
                  {k.pemateri && <p className="text-sm text-white/50">{k.pemateri}</p>}
                  <p className="text-xs text-white/30 mt-0.5">{k.tanggal} {k.waktu && `· ${k.waktu}`} {k.lokasi && `· ${k.lokasi}`}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openEdit(k)} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition">Edit</button>
                  <button onClick={() => handleToggleAktif(k)} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition">
                    {k.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => handleDelete(k.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-300 hover:border-red-500/40 transition">Hapus</button>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="text-center py-16 text-white/30">Belum ada jadwal kajian</div>}
        </div>
      )}
    </div>
  );
}
