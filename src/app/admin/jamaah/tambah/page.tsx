'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TambahJamaahPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paketList, setPaketList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nama: '',
    no_wa: '',
    alamat: '',
    pin: '',
    paket_id: ''
  });

  useEffect(() => {
    // Fetch paket for dropdown
    const fetchPaket = async () => {
      try {
        const res = await fetch('/api/public/paket'); // I'll create this or use a supabase client directly
        // Let's just use supabase client here since it's an internal admin tool, or we can fetch a specific api
      } catch (e) {
        console.error(e);
      }
    };
    
    // Better fetch directly with supabase client in useEffect
    const getPaket = async () => {
      try {
        // Since it's client component, we use fetch to a public api, but I haven't created it.
        // Let's create an API route for it if needed, or I can just leave it empty for now 
        // since the MVP prompt doesn't explicitly mention it, but it's good to have.
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/jamaah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan jamaah');

      router.push('/admin/jamaah');
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/jamaah" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tambah Jamaah Manual</h1>
          <p className="text-white/50 text-sm">Masukkan data jamaah baru ke dalam sistem.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-5">
        {errorMsg && (
          <div className="p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nama Lengkap <span className="text-red-400">*</span></label>
          <input
            type="text"
            required
            value={formData.nama}
            onChange={(e) => setFormData({...formData, nama: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none"
            placeholder="Misal: Budi Santoso"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Nomor WhatsApp <span className="text-red-400">*</span></label>
          <input
            type="text"
            required
            value={formData.no_wa}
            onChange={(e) => setFormData({...formData, no_wa: e.target.value.replace(/[^0-9]/g, '')})}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none"
            placeholder="6281234567890"
          />
          <p className="text-[10px] text-white/40 mt-1">Gunakan format 628...</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">PIN Sementara <span className="text-red-400">*</span></label>
          <input
            type="text"
            required
            maxLength={6}
            value={formData.pin}
            onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/[^0-9]/g, '')})}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none font-mono"
            placeholder="123456"
          />
          <p className="text-[10px] text-white/40 mt-1">Berikan PIN ini ke jamaah untuk login pertama kali.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Alamat (Opsional)</label>
          <textarea
            value={formData.alamat}
            onChange={(e) => setFormData({...formData, alamat: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none resize-none"
            placeholder="Alamat lengkap..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 bg-[#C9A84C] text-[#0F172A] font-bold rounded-xl shadow-lg hover:bg-[#D4B869] transition-colors disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan Jamaah'}
        </button>
      </form>
    </div>
  );
}
