import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white">
      <div className="bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <div className="w-20 h-20 bg-[#1E293B] rounded-full mx-auto mb-6 flex items-center justify-center border border-[#C9A84C]/30 shadow-[0_0_20px_rgba(201,168,76,0.15)]">
          {/* Logo placeholder, we can use an image later */}
          <span className="text-[#C9A84C] text-3xl font-bold">BM</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          BaitulMarifah <span className="text-[#C9A84C]">App</span>
        </h1>
        
        <p className="text-white/60 mb-10 text-sm leading-relaxed">
          Portal Digital Masjid Baitul Marifat — Infaq, Kurban & Keuangan Masjid yang Transparan dan Terpercaya.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/login" 
            className="w-full bg-[#C9A84C] text-[#0F172A] font-bold py-3.5 px-4 rounded-xl hover:bg-[#D4B869] transition-all duration-300 shadow-lg shadow-[#C9A84C]/20 flex items-center justify-center gap-2"
          >
            Masuk
          </Link>
          <Link 
            href="/daftar" 
            className="w-full bg-white/5 border border-white/15 text-white font-medium py-3.5 px-4 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            Daftar Jamaah
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-white/40 text-xs">
        &copy; {new Date().getFullYear()} Masjid Baitul Marifat
      </div>
    </main>
  );
}
