'use client';

import { useState, useEffect } from 'react';

export default function HewanTrackerPage() {
  const [hewan, setHewan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/hewan').then(r => r.json()).then(j => { if (j.data) setHewan(j.data); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-white/50">Memuat status hewan...</div>;
  if (hewan.length === 0) return (
    <div className="p-10 text-center">
      <p className="text-white/40">Belum ada informasi status hewan dari panitia.</p>
      <p className="text-white/30 text-sm mt-2">Silakan cek kembali nanti.</p>
    </div>
  );

  const currentFaseNumber = hewan.find(h => h.aktif)?.urutan || 0;

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Tracker Status Hewan</h1>
        <p className="text-white/50 text-sm mt-1">Pantau progres penyediaan dan distribusi hewan qurban Anda secara transparan.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 md:p-10">
        <div className="relative border-l-2 border-white/10 ml-3 md:ml-6 space-y-12">
          {hewan.map((fase) => {
            const isCompleted = fase.urutan < currentFaseNumber;
            const isActive = fase.urutan === currentFaseNumber;
            const isUpcoming = fase.urutan > currentFaseNumber;

            return (
              <div key={fase.urutan} className={`relative pl-8 md:pl-10 transition-opacity ${isUpcoming ? 'opacity-40' : 'opacity-100'}`}>
                {/* Bullet */}
                <span className={`absolute -left-[11px] top-1 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-[#0F172A] ${isCompleted ? 'bg-green-500' : isActive ? 'bg-[#C9A84C] ring-[#C9A84C]/20 animate-pulse' : 'bg-white/20'}`}>
                  {isCompleted && <span className="text-white text-[10px] font-bold">✓</span>}
                </span>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-2 ${isActive ? 'text-[#C9A84C]' : 'text-white'}`}>
                      {fase.urutan}. {fase.label}
                      {isActive && <span className="ml-3 inline-block bg-[#C9A84C] text-[#0F172A] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider align-middle">Sedang Berlangsung</span>}
                      {isCompleted && <span className="ml-3 inline-block bg-green-900/40 text-green-400 border border-green-500/30 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold align-middle">Selesai ✓</span>}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">{fase.deskripsi}</p>
                  </div>

                  {fase.foto_url && (isActive || isCompleted) && (
                    <div className="w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                      <img src={fase.foto_url} alt={fase.label} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
