'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nama: '',
    no_wa: '',
    alamat: '',
    pin: '',
    pinConfirm: '',
    paket_id: ''
  })
  const [paketList, setPaketList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/public/paket')
      .then(r => r.json())
      .then(j => { if (j.data) setPaketList(j.data) })
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('pin')) {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.pin !== formData.pinConfirm) {
      setError('PIN dan Konfirmasi PIN tidak cocok')
      return
    }

    if (formData.pin.length !== 6) {
      setError('PIN harus 6 digit angka')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          no_wa: formData.no_wa,
          alamat: formData.alamat,
          pin: formData.pin,
          paket_id: formData.paket_id || null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Pendaftaran gagal')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const jenisLabel: Record<string, string> = {
    kambing: '🐐 Kambing',
    sapi_patungan: '🐄 Sapi Patungan',
    tabungan: '💰 Tabungan Cicilan',
  }

  return (
    <main className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white py-12">
      <div className="bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#C9A84C]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Daftar Jamaah</h1>
          <p className="text-white/60 text-sm mt-1">Buat akun untuk memulai ibadah qurban Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Nama Lengkap</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: Budi Santoso"
              className="w-full bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C9A84C] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Nomor WhatsApp</label>
            <input
              type="text"
              name="no_wa"
              value={formData.no_wa}
              onChange={handleChange}
              placeholder="Contoh: 081234567890"
              className="w-full bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C9A84C] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Alamat Lengkap</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat Anda"
              rows={3}
              className="w-full bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C9A84C] outline-none transition-all resize-none"
              required
            />
          </div>

          {/* Pilih Paket Kurban */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">
              Paket Qurban
              <span className="text-white/40 font-normal ml-1">(opsional, bisa dipilih nanti)</span>
            </label>
            {paketList.length > 0 ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paket_id: '' }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                    !formData.paket_id
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/10 bg-white/3 text-white/50 hover:border-white/20'
                  }`}
                >
                  Belum pilih paket
                </button>
                {paketList.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paket_id: p.id }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.paket_id === p.id
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                        : 'border-white/10 bg-white/3 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-semibold text-sm ${formData.paket_id === p.id ? 'text-[#C9A84C]' : 'text-white/80'}`}>
                          {jenisLabel[p.jenis] || p.jenis} — {p.nama}
                        </p>
                        {p.deskripsi && <p className="text-xs text-white/40 mt-0.5">{p.deskripsi}</p>}
                      </div>
                      <span className={`text-sm font-bold ml-3 flex-shrink-0 ${formData.paket_id === p.id ? 'text-[#C9A84C]' : 'text-white/60'}`}>
                        {fmt(p.harga_target)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                Belum ada paket aktif. Hubungi admin untuk informasi paket.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Buat PIN (6 Digit Angka)</label>
            <input
              type="password"
              name="pin"
              maxLength={6}
              value={formData.pin}
              onChange={handleChange}
              placeholder="••••••"
              className="w-full bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C9A84C] outline-none transition-all tracking-[0.3em] font-mono text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/80">Konfirmasi PIN</label>
            <input
              type="password"
              name="pinConfirm"
              maxLength={6}
              value={formData.pinConfirm}
              onChange={handleChange}
              placeholder="••••••"
              className="w-full bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C9A84C] outline-none transition-all tracking-[0.3em] font-mono text-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#C9A84C] text-[#0F172A] font-bold py-3.5 px-4 rounded-xl hover:bg-[#D4B869] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/60">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[#C9A84C] hover:underline font-medium">
            Masuk di sini
          </Link>
        </div>
      </div>
    </main>
  )
}
