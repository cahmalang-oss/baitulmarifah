import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/auth-middleware';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await requireAdmin();
  if (payload instanceof Response) {
    redirect('/login');
  }

  const navItems = [
    { label: 'Dashboard', href: `/admin`, icon: '📊' },
    { label: 'Setoran', href: `/admin/setoran`, icon: '💰' },
    { label: 'Jamaah', href: `/admin/jamaah`, icon: '👥' },
    { label: 'Infaq', href: `/admin/infaq`, icon: '💚' },
    { label: 'Paket', href: `/admin/paket`, icon: '📦' },
    { label: 'Grup', href: `/admin/grup`, icon: '🐄' },
    { label: 'Hewan', href: `/admin/hewan`, icon: '🌙' },
    { label: 'Rekap', href: `/admin/rekap`, icon: '📋' },
    { label: 'Export', href: `/admin/export`, icon: '📥' },
    { label: 'Pengaturan', href: `/admin/pengaturan`, icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#080E1A] border-b border-white/10 sticky top-0 z-30 p-4 flex justify-between items-center">
        <div className="font-bold text-[#C9A84C] text-lg">Admin Panel</div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="text-xs font-bold text-red-400 border border-red-500/30 px-3 py-1.5 rounded bg-red-900/20">
            Logout
          </button>
        </form>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#080E1A] border-r border-white/10 min-h-screen fixed z-20">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-[#C9A84C] tracking-tight">BaitulMarifah</h2>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">Role: {payload.role.replace('_', ' ')}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-900/20 transition-colors text-left">
              <span>🚪</span> Logout Admin
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full md:pl-64 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080E1A] border-t border-white/10 z-50 flex justify-around p-2 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center text-white/50 p-2 min-w-[60px]"
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
