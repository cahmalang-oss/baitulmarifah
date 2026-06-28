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
    { label: 'Beranda', href: `/dashboard`, icon: '🏠' },
    { label: 'Setor', href: `/dashboard/setoran`, icon: '💸' },
    { label: 'Riwayat', href: `/dashboard/riwayat`, icon: '📋' },
    { label: 'Profil', href: `/dashboard/profil`, icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0 md:flex md:flex-col md:items-center">
      <div className="w-full max-w-md bg-[#0F172A] min-h-screen relative">
        <header className="bg-[#1E293B] text-white p-4 flex justify-between items-center border-b border-white/10 sticky top-0 z-40">
          <h1 className="text-xl font-bold text-[#C9A84C]">BaitulMarifah</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block">{payload.nama}</span>
            <div className="w-8 h-8 rounded-full bg-[#C9A84C] text-[#0F172A] flex items-center justify-center font-bold uppercase">
              {payload.nama.charAt(0)}
            </div>
          </div>
        </header>

        {/* Install Banner */}
        <InstallBanner />

        {/* Main Content Area */}
        <main className="w-full">{children}</main>

        {/* Bottom Navigation (Mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#080E1A] border-t border-white/8 z-50 md:absolute md:bottom-0">
          <div className="max-w-md mx-auto flex justify-around items-center h-16">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full text-white/40 hover:text-[#C9A84C] active:text-[#C9A84C] transition-colors"
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
