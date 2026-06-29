import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireJamaah } from '@/lib/auth-middleware';
import InstallBanner from '@/components/InstallBanner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await requireJamaah();

  if (payload instanceof Response) {
    redirect('/login');
  }

  const navItems = [
    { label: 'Beranda',  href: '/dashboard',         emoji: '🏠' },
    { label: 'Kurban',   href: '/dashboard/kurban',  emoji: '🐄' },
    { label: 'Infaq',    href: '/dashboard/infaq',   emoji: '🤲' },
    { label: 'Riwayat',  href: '/dashboard/riwayat', emoji: '📋' },
    { label: 'Profil',   href: '/dashboard/profil',  emoji: '👤' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] md:flex md:flex-col md:items-center">
      <div className="w-full max-w-md bg-[#0F172A] min-h-screen relative flex flex-col">
        <header className="bg-[#1E293B] text-white px-4 py-3 flex justify-between items-center border-b border-white/10 sticky top-0 z-40">
          <h1 className="text-lg font-bold text-[#C9A84C]">BaitulMarifah</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden sm:block text-white/70">{payload.nama}</span>
            <div className="w-8 h-8 rounded-full bg-[#C9A84C] text-[#0F172A] flex items-center justify-center font-bold uppercase text-sm flex-shrink-0">
              {payload.nama.charAt(0)}
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-xs font-semibold text-white/50 hover:text-red-400 border border-white/15 hover:border-red-500/40 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-900/20 transition-all">
                Keluar
              </button>
            </form>
          </div>
        </header>

        <InstallBanner />

        {/* Main Content — padding bottom = tinggi nav (64px) + ekstra 16px supaya tombol tidak tertutup */}
        <main className="flex-1 w-full pb-20">{children}</main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#080E1A]/95 backdrop-blur-xl border-t border-white/8 z-50">
          <div className="max-w-md mx-auto flex justify-around items-stretch h-16">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 text-white/40 hover:text-[#C9A84C] active:text-[#C9A84C] transition-colors py-2"
              >
                <span className="text-xl leading-none">{item.emoji}</span>
                <span className="text-[9px] font-semibold mt-1 leading-none">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
