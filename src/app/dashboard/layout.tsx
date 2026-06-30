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
    <div className="min-h-screen bg-[#0F172A] md:flex">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 fixed top-0 left-0 bottom-0 z-40 bg-[#080E1A]/95 backdrop-blur-xl border-r border-white/8">
        <div className="px-5 py-5 border-b border-white/8">
          <h1 className="text-lg font-bold text-[#C9A84C]">BaitulMarifah</h1>
          <p className="text-xs text-white/40 mt-0.5 truncate">{payload.nama}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-3 pb-4 border-t border-white/8 pt-3">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full text-left text-sm font-semibold text-white/40 hover:text-red-400 px-3 py-2.5 rounded-xl hover:bg-red-900/20 transition-all">
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="w-full md:max-w-none md:flex-1 md:ml-60 bg-[#0F172A] min-h-screen relative flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden bg-[#1E293B] text-white px-4 py-3 flex justify-between items-center border-b border-white/10 sticky top-0 z-30">
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

        {/* Main Content — padding bottom mobile utk bottom nav, normal di desktop */}
        <main className="flex-1 w-full pb-20 md:pb-0 md:max-w-3xl md:mx-auto">{children}</main>

        {/* Bottom Navigation (mobile only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080E1A]/95 backdrop-blur-xl border-t border-white/8 z-50">
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
