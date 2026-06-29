import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white">
      <div className="bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">

        {/* Logo */}
        <div className="w-24 h-24 mx-auto mb-5 relative">
          <Image
            src="/icons/logo.png"
            alt="BaitulMarifah"
            width={96}
            height={96}
            className="rounded-2xl shadow-[0_0_24px_rgba(201,168,76,0.25)]"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          BaitulMarifah <span className="text-[#C9A84C]">App</span>
        </h1>

        <p className="text-white/60 mb-8 text-sm leading-relaxed">
          Portal Digital Masjid Baitul Marifah — Infaq, Kurban & Keuangan Masjid yang Transparan dan Terpercaya.
        </p>

        {/* Fitur highlights */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { img: '/icons/infaq.png', label: 'Infaq' },
            { img: '/icons/patungan.png', label: 'Patungan Kurban' },
            { img: '/icons/kajian.png', label: 'Kajian' },
          ].map(f => (
            <div key={f.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/8">
              <Image src={f.img} alt={f.label} width={40} height={40} className="rounded-lg" />
              <span className="text-[11px] text-white/50 font-medium">{f.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full bg-[#C9A84C] text-[#0F172A] font-bold py-3.5 px-4 rounded-xl hover:bg-[#D4B869] transition-all duration-300 shadow-lg shadow-[#C9A84C]/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="w-full bg-white/5 border border-white/15 text-white font-medium py-3.5 px-4 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Daftar Jamaah
          </Link>

          {/* TV Dashboard link */}
          <Link
            href="/tv"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white/3 border border-[#C9A84C]/20 text-[#C9A84C]/80 font-medium py-3 px-4 rounded-xl hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Dashboard Publik (Layar TV)
          </Link>
        </div>
      </div>

      <div className="mt-6 text-white/30 text-xs">
        &copy; {new Date().getFullYear()} Masjid Baitul Marifah
      </div>
    </main>
  );
}
