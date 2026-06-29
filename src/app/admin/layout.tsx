import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-middleware';
import Link from 'next/link';

// roles yang boleh akses tiap menu
const allNavItems = [
  { label: 'Dashboard',        href: '/admin',           icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['admin','bendahara','verifikator'] },
  { label: 'Setoran',          href: '/admin/setoran',   icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['admin','bendahara'] },
  { label: 'Jamaah',           href: '/admin/jamaah',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin','verifikator'] },
  { label: 'Infaq',            href: '/admin/infaq',     icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', roles: ['admin','bendahara'] },
  { label: 'Pengeluaran',      href: '/admin/pengeluaran', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', roles: ['admin','bendahara'] },
  { label: 'Paket',            href: '/admin/paket',     icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', roles: ['admin','verifikator'] },
  { label: 'Data Grup Patungan', href: '/admin/grup',    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: ['admin','verifikator'] },
  { label: 'Progress Qurban',  href: '/admin/hewan',    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['admin','verifikator'] },
  { label: 'Rekap',            href: '/admin/rekap',     icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['admin','bendahara'] },
  { label: 'Export Laporan',   href: '/admin/export',    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', roles: ['admin','bendahara'] },
  { label: 'Pengguna',    href: '/admin/pengguna',     icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['admin'] },
  { label: 'Pengaturan',  href: '/admin/pengaturan',   icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin'] },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const payload = await requireAdmin();
  if (payload instanceof Response) redirect('/login');

  const userRole = payload.role as string;
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));
  const roleLabel = userRole.replace(/_/g, ' ');

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* ── Geometric pattern overlay (fixed, full-screen) ── */}
      <div className="pattern-girih fixed inset-0 pointer-events-none z-0" />

      {/* ── Mobile Header ── */}
      <header className="md:hidden sticky top-0 z-30 flex justify-between items-center px-4 py-3
        bg-black/60 backdrop-blur-xl border-b border-white/8">
        {/* crescent + wordmark */}
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#C9A84C]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
          </svg>
          <span className="font-bold text-[#C9A84C] tracking-tight text-base">BaitulMarifah</span>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit"
            className="text-xs font-bold text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg bg-red-900/20">
            Logout
          </button>
        </form>
      </header>

      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 left-0 bottom-0 z-20
        bg-black/50 backdrop-blur-2xl border-r border-white/8">

        {/* logo area */}
        <div className="px-6 py-6 border-b border-white/8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#C9A84C]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight tracking-tight">BaitulMarifah</h2>
            <p className="text-[10px] text-[#C9A84C]/70 uppercase tracking-widest font-semibold mt-0.5 capitalize">{roleLabel}</p>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50
                hover:text-white hover:bg-white/5 transition-all duration-150 relative"
            >
              {/* gold right-edge indicator on hover */}
              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-l bg-[#C9A84C]
                scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />

              <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#C9A84C]/15 flex items-center justify-center transition-colors duration-150 text-white/40 group-hover:text-[#C9A84C]">
                <NavIcon d={item.icon} />
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* logout */}
        <div className="px-3 pb-4 border-t border-white/8 pt-3">
          <form action="/api/auth/logout" method="POST">
            <button type="submit"
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60
                hover:text-red-300 hover:bg-red-900/20 transition-all text-sm font-medium">
              <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-900/30 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 relative z-10 w-full md:pl-64 pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30
        bg-black/60 backdrop-blur-xl border-t border-white/8 flex overflow-x-auto">
        {navItems.slice(0, 6).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center text-white/40 p-2 min-w-[60px] flex-1
              hover:text-[#C9A84C] transition-colors"
          >
            <NavIcon d={item.icon} />
            <span className="text-[9px] font-medium mt-1 leading-none">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
