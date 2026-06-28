'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nama: '',
    no_wa: '',
    alamat: '',
    pin: '',
    pinConfirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          pin: formData.pin
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

  return (
    <main className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white py-12">
      <div className="bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-8 max-w-md w-full shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Daftar Jamaah</h1>
        <p className="text-white/60 mb-6 text-center text-sm">Buat akun untuk memulai ibadah qurban Anda</p>

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
            className="w-full mt-4 bg-[#C9A84C] text-[#0F172A] font-bold py-3.5 px-4 rounded-xl hover:bg-[#D4B869] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
