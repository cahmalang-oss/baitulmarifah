'use client';

import { useState, useEffect } from 'react';

type Paket = {
  id: string; nama: string; jenis: string; harga_target: number;
  aktif: boolean; peserta_count: number; deskripsi?: string; syarat_ketentuan?: string;
};

const JENIS_OPTIONS = [
  { value: 'kambing', label: '🐐 Kambing' },
  { value: 'sapi-patungan', label: '🐄 Sapi Patungan (1/7)' },
  { value: 'tabungan', label: '💰 Tabungan Kurban (Cicilan)' },
];
const jenisBadge = (j: string) => j === 'sapi-patungan' ? 'bg-orange-900/40 text-orange-400' : j === 'kambing' ? 'bg-blue-900/40 text-blue-400' : 'bg-purple-900/40 text-purple-400';
const jenisLabel = (j: string) => JENIS_OPTIONS.find(o => o.value === j)?.label || j;
const INPUT_CLS = 'w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent';

export default function PaketPage() {
  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPaketId, setNewPaketId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ nama: '', jenis: 'kambing', harga_target: '', deskripsi: '', syarat_ketentuan: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  const fetchPaket = async () => {
    try {
      const res = await fetch('/api/admin/paket');
      const json = await res.json();
      if (res.ok) setPaketList(json.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPaket(); }, []);

  const resetAddForm = () => setAddForm({ nama: '', jenis: 'kambing', harga_target: '', deskripsi: '', syarat_ketentuan: '' });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/paket', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const json = await res.json();
      if (res.ok) { setNewPaketId(json.data.id); fetchPaket(); }
      else alert(json.error || 'Gagal membuat paket');
    } catch { alert('Kesalahan jaringan'); }
    finally { setIsSubmitting(false); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/paket/${editForm.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: editForm.nama, jenis: editForm.jenis, harga_target: editForm.harga_target, deskripsi: editForm.deskripsi, syarat_ketentuan: editForm.syarat_ketentuan }),
      });
      if (res.ok) { setShowEditModal(false); fetchPaket(); }
      else { const err = await res.json(); alert(err.error); }
    } catch { alert('Kesalahan jaringan'); }
    finally { setIsSubmitting(false); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/paket/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktif: !current }),
    });
    if (res.ok) fetchPaket();
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus paket "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/admin/paket/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) fetchPaket();
      else alert(json.error || 'Gagal menghapus paket');
    } catch { alert('Kesalahan jaringan'); }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-[#C9A84C]/70 text-xs uppercase tracking-widest font-semibold mb-1">Konfigurasi</p>
          <h1 className="text-2xl font-bold text-white">Manajemen Paket</h1>
          <p className="text-white/40 text-sm mt-1">Kelola paket qurban dan bagikan link pendaftaran ke calon jamaah.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-6 py-2.5 bg-[#C9A84C] hover:bg-[#D4B869] text-[#0F172A] font-bold rounded-xl transition-colors">
          + Buat Paket Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="p-10 col-span-full text-center text-white/40">Memuat data paket...</div>
        ) : paketList.length === 0 ? (
          <div className="p-10 col-span-full text-center glass-card text-white/40">
            Belum ada paket. Buat paket pertama Anda!
          </div>
        ) : paketList.map(paket => (
          <div key={paket.id} className={`glass-card p-6 flex flex-col gap-4 transition-all ${!paket.aktif ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${jenisBadge(paket.jenis)}`}>{jenisLabel(paket.jenis)}</span>
              <button
                onClick={() => handleToggle(paket.id, paket.aktif)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${paket.aktif ? 'border-red-500/30 text-red-400 hover:bg-red-900/20' : 'border-green-500/30 text-green-400 hover:bg-green-900/20'}`}
              >
                {paket.aktif ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{paket.nama}</h3>
              <p className="text-2xl font-black text-green-400 mt-1">Rp {paket.harga_target.toLocaleString('id-ID')}</p>
              {paket.deskripsi && <p className="text-sm text-white/40 mt-2 leading-relaxed line-clamp-2">{paket.deskripsi}</p>}
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/40">Dipakai: <strong className="text-white/70">{paket.peserta_count} Jamaah</strong></span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditForm({ ...paket }); setShowEditModal(true); }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/70 text-sm font-bold rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(paket.id, paket.nama)}
                  disabled={paket.peserta_count > 0}
                  title={paket.peserta_count > 0 ? 'Masih dipakai jamaah, tidak bisa dihapus' : 'Hapus paket'}
                  className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-sm font-bold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-900/20"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-[#0D1526]/95 w-full max-w-lg relative overflow-hidden rounded-3xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{newPaketId ? '✅ Paket Berhasil Dibuat' : 'Buat Paket Baru'}</h2>
              <button onClick={() => { setShowAddModal(false); setNewPaketId(null); resetAddForm(); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/15">✕</button>
            </div>
            {newPaketId ? (
              <div className="p-6 space-y-5">
                <p className="text-white/60 text-sm">Paket berhasil dibuat. Bagikan link berikut ke calon jamaah.</p>
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-400 mb-2 uppercase">Link Pendaftaran</p>
                  <span className="text-xs text-white/60 font-mono break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/daftar?paket={newPaketId}</span>
                </div>
                <button onClick={() => { setShowAddModal(false); setNewPaketId(null); resetAddForm(); }} className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl">Selesai</button>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Nama Paket <span className="text-red-400">*</span></label>
                  <input type="text" value={addForm.nama} onChange={e => setAddForm({ ...addForm, nama: e.target.value })} required placeholder="Contoh: Kambing Standar" className={INPUT_CLS} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Jenis <span className="text-red-400">*</span></label>
                  <select value={addForm.jenis} onChange={e => setAddForm({ ...addForm, jenis: e.target.value })} className={INPUT_CLS}>
                    {JENIS_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#1E293B]">{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Target Harga (Rp) <span className="text-red-400">*</span></label>
                  <input type="number" value={addForm.harga_target} onChange={e => setAddForm({ ...addForm, harga_target: e.target.value })} required placeholder="3500000" className={INPUT_CLS} />
                  {addForm.harga_target && <p className="text-xs text-white/40 mt-1">Rp {parseInt(addForm.harga_target).toLocaleString('id-ID')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Deskripsi</label>
                  <textarea value={addForm.deskripsi} onChange={e => setAddForm({ ...addForm, deskripsi: e.target.value })} rows={2} className={`${INPUT_CLS} resize-none`} placeholder="Jelaskan detail paket ini..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl hover:bg-[#D4B869] transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Buat Paket'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-[#0D1526]/95 w-full max-w-lg rounded-3xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Paket</h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Nama Paket</label>
                <input type="text" value={editForm.nama} onChange={e => setEditForm({ ...editForm, nama: e.target.value })} required className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Jenis</label>
                <select value={editForm.jenis} onChange={e => setEditForm({ ...editForm, jenis: e.target.value })} className={INPUT_CLS}>
                  {JENIS_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#1E293B]">{o.label}</option>)}
                </select>
                {!JENIS_OPTIONS.some(o => o.value === editForm.jenis) && (
                  <p className="text-xs text-yellow-400 mt-1">⚠️ Nilai jenis lama tidak standar: "{editForm.jenis}". Pilih ulang dari daftar di atas lalu simpan untuk memperbaiki.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Target Harga (Rp)</label>
                <input type="number" value={editForm.harga_target} onChange={e => setEditForm({ ...editForm, harga_target: e.target.value })} required className={INPUT_CLS} />
                {editForm.peserta_count > 0 && <p className="text-xs text-red-400 mt-2 bg-red-900/20 p-2 rounded border border-red-500/30">⚠️ Hati-hati! {editForm.peserta_count} jamaah menggunakan paket ini. Mengubah jenis dapat memengaruhi logika tampilan grup/progres.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Deskripsi</label>
                <textarea value={editForm.deskripsi || ''} onChange={e => setEditForm({ ...editForm, deskripsi: e.target.value })} rows={3} className={`${INPUT_CLS} resize-none`} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Syarat & Ketentuan</label>
                <textarea value={editForm.syarat_ketentuan || ''} onChange={e => setEditForm({ ...editForm, syarat_ketentuan: e.target.value })} rows={4} className={`${INPUT_CLS} resize-none`} />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl disabled:opacity-50">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
