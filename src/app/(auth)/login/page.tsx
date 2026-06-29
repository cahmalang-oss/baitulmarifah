'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'wa' | 'google'>('wa')
  const [noWa, setNoWa] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLoginWA = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ no_wa: noWa, pin })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal')
      }

      const staffRoles = ['admin', 'bendahara', 'verifikator'];
      if (staffRoles.includes(data.user?.role)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginGoogle = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin.replace('://baitulmarifah.web.id', '://www.baitulmarifah.web.id')}/api/auth/callback`
      }
    })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white">
      <div className="bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-8 max-w-md w-full shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Masuk ke Akun Anda</h1>
        <p className="text-white/60 mb-6 text-center text-sm">Pilih metode masuk yang Anda inginkan</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-[#1E293B] rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('wa')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'wa' ? 'bg-[#C9A84C] text-[#0F172A]' : 'text-white/60 hover:text-white'
            }`}
          >
            No WA + PIN
          </button>
          <button
            onClick={() => setTab('google')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'google' ? 'bg-[#C9A84C] text-[#0F172A]' : 'text-white/60 hover:text-white'
            }`}
          >
            Google
          </button>
        </div>

        {tab === 'wa' ? (
          <form onSubmit={handleLoginWA} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">Nomor WhatsApp</label>
              <input
                type="text"
                value={noWa}
                onChange={(e) => setNoWa(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-white/5 border border-white/15 text-white placeholder:text-white/25 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#C9A84C] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/80">PIN (6 Digit)</label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
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
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              onClick={handleLoginGoogle}
              disabled={loading}
              className="w-full bg-white text-gray-900 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Masuk dengan Google
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-white/60">
          Belum punya akun?{' '}
          <Link href="/daftar" className="text-[#C9A84C] hover:underline font-medium">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </main>
  )
}
