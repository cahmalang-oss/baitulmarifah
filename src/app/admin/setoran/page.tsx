'use client';

import { useState, useEffect } from 'react';

export default function SetoranPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [modalImage, setModalImage] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const fetchSetoran = async (pageToFetch: number, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/admin/setoran?page=${pageToFetch}`);
      const json = await res.json();
      if (res.ok) {
        if (isLoadMore) setData(prev => [...prev, ...json.data]);
        else setData(json.data);
        setHasMore(pageToFetch < (json.meta?.totalPages || 1));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { fetchSetoran(1); }, []);

  const handleKonfirmasi = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/setoran/${id}/konfirmasi`, { method: 'POST' });
      const result = await res.json();
      if (res.ok) setData(prev => prev.filter(item => item.id !== id));
      else alert('Gagal: ' + result.error);
    } catch (e) { alert('Terjadi kesalahan jaringan'); }
    finally { setActionLoading(null); }
  };

  const handleTolak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectReason.length < 10) { setRejectError('Alasan tolak minimal 10 karakter'); return; }
    setRejectError('');
    setActionLoading(rejectId);
    try {
      const res = await fetch(`/api/admin/setoran/${rejectId}/tolak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alasan: rejectReason })
      });
      const result = await res.json();
      if (res.ok) { setData(prev => prev.filter(item => item.id !== rejectId)); setRejectId(null); setRejectReason(''); }
      else setRejectError(result.error);
    } catch (e) { setRejectError('Terjadi kesalahan jaringan'); }
    finally { setActionLoading(null); }
  };

  return (
    <div>
      <p className="text-[#C9A84C]/70 text-xs uppercase tracking-widest font-semibold mb-1">Verifikasi</p>
      <h1 className="text-2xl font-bold text-white mb-1">Antrian Setoran</h1>
      <p className="text-white/40 mb-6 text-sm">Setoran yang menunggu konfirmasi masuk ke sistem.</p>

      {/* Modal Zoom Gambar */}
      {modalImage && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setModalImage(null)}>
          <div className="relative max-w-4xl max-h-screen overflow-auto bg-[#0D1526] rounded-lg p-2" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center z-10" onClick={() => setModalImage(null)}>✕</button>
            <img src={modalImage} alt="Bukti Transfer" className="max-w-full max-h-[80vh] object-contain rounded" />
          </div>
        </div>
      )}

      {/* Modal Tolak Setoran */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-card bg-[#0D1526]/95 w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-2">Tolak Setoran</h3>
            <p className="text-sm text-white/50 mb-4">Sebutkan alasan penolakan. Ini akan dikirimkan via WA ke jamaah.</p>
            <form onSubmit={handleTolak}>
              {rejectError && <div className="p-3 bg-red-900/30 text-red-300 text-xs rounded mb-3 border border-red-500/30">{rejectError}</div>}
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                rows={3}
                placeholder="Misal: Bukti transfer buram, mohon upload ulang (min 10 karakter)"
              ></textarea>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setRejectId(null); setRejectReason(''); setRejectError(''); }} className="flex-1 py-3 text-white/60 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={actionLoading === rejectId} className="flex-1 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-bold disabled:opacity-50 transition-colors">
                  {actionLoading === rejectId ? 'Memproses...' : 'Kirim Penolakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="text-center py-20 text-white/40">Memuat antrian...</div>
      ) : data.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-bold text-white mb-1">Antrian Kosong</h3>
          <p className="text-white/40">Semua setoran sudah diproses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.id} className="glass-card p-5 flex flex-col md:flex-row gap-6 hover:border-white/15 transition-colors">

              {/* Thumbnail Bukti */}
              <div
                className="w-full md:w-32 h-40 md:h-24 bg-white/5 rounded-xl flex-shrink-0 cursor-pointer overflow-hidden relative group border border-white/10"
                onClick={() => setModalImage(`${supabaseUrl}/storage/v1/object/public/bukti-transfer/${item.bukti_url}`)}
              >
                <img
                  src={`${supabaseUrl}/storage/v1/object/public/bukti-transfer/${item.bukti_url}`}
                  alt="Bukti"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150?text=File'; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-bold drop-shadow-md">🔍 ZOOM</span>
                </div>
              </div>

              {/* Detail Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-white text-lg">{item.peserta.nama}</h3>
                  <span className="px-2 py-0.5 bg-yellow-900/40 text-yellow-400 text-[10px] font-bold uppercase rounded-md">Pending</span>
                  {item.kategori === 'infaq'
                    ? <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 text-[10px] font-bold uppercase rounded-md">🤲 Infaq</span>
                    : <span className="px-2 py-0.5 bg-amber-900/40 text-amber-300 text-[10px] font-bold uppercase rounded-md">🐄 Qurban</span>
                  }
                </div>
                <p className="text-sm text-white/40 mb-2">No WA: {item.peserta.no_wa}</p>
                <div className="text-xl font-extrabold text-[#C9A84C]">
                  Rp {(item.jumlah || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-white/30 mt-1">Tanggal: {new Date(item.tanggal_setor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/10 md:border-0">
                <button
                  onClick={() => handleKonfirmasi(item.id)}
                  disabled={actionLoading !== null}
                  className="flex-1 md:flex-none px-6 py-3 min-h-[44px] bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === item.id ? 'Loading...' : 'Konfirmasi ✓'}
                </button>
                <button
                  onClick={() => setRejectId(item.id)}
                  disabled={actionLoading !== null}
                  className="flex-1 md:flex-none px-6 py-3 min-h-[44px] bg-white/5 border border-red-500/30 text-red-400 hover:bg-red-900/20 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  Tolak ✗
                </button>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={() => { if (loadingMore) return; const nextPage = page + 1; setPage(nextPage); fetchSetoran(nextPage, true); }}
              disabled={loadingMore}
              className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 font-semibold rounded-xl mt-4 transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
