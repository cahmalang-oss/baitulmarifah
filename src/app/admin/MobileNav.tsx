'use client';

import { useState } from 'react';
import Link from 'next/link';

type NavItem = { label: string; href: string; icon: string };

function NavIcon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={`${className} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const MAIN_COUNT = 4;

export default function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const mainItems = items.slice(0, MAIN_COUNT);
  const hasMore = items.length > MAIN_COUNT;

  return (
    <>
      {/* Sheet "Lainnya" */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-[#0D1526] border-t border-white/10 rounded-t-3xl pb-24 pt-4 px-4 max-h-[70vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest px-2 mb-3">Semua Menu</p>
            <div className="grid grid-cols-4 gap-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#C9A84C]">
                    <NavIcon d={item.icon} className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30
        bg-black/60 backdrop-blur-xl border-t border-white/8 flex">
        {mainItems.map((item) => (
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
        {hasMore && (
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center text-white/40 p-2 min-w-[60px] flex-1
              hover:text-[#C9A84C] transition-colors"
          >
            <NavIcon d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zM13 12a1 1 0 11-2 0 1 1 0 012 0zM20 12a1 1 0 11-2 0 1 1 0 012 0z" />
            <span className="text-[9px] font-medium mt-1 leading-none">Lainnya</span>
          </button>
        )}
      </nav>
    </>
  );
}
