'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAccessibility } from '@/lib/accessibilityContext';

const NAV_LINKS = [
  { label: 'Find Care', href: '/emergency' },
  { label: 'Hospitals', href: '/emergency/results' },
  { label: 'Transfers', href: '/transfer' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About Us', href: '/#about-us' },
] as const;

export default function Header() {
  const { theme, toggleTheme } = useAccessibility();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 header-glass">
        <div className="container-xl">
          <div className="flex items-center justify-between h-20">

            {/* Left: MEDROUTE Logo + Tagline */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group" aria-label="MEDROUTE home">
              <div className="w-10 h-10 rounded-xl bg-[#087F8C] flex items-center justify-center shadow-sm flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>

              <div>
                <span
                  className="font-extrabold text-xl tracking-tight leading-none text-[#172033] dark:text-white"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  MED<span className="text-[#087F8C]">ROUTE</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 whitespace-nowrap">
                  The right hospital. Right now.
                </p>
              </div>
            </Link>

            {/* Center: Desktop Nav Links */}
            <nav className="desktop-nav-only md:flex items-center gap-7" aria-label="Primary navigation">
              {NAV_LINKS.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      'text-sm font-semibold transition-colors duration-150',
                      active ? 'text-[#087F8C]' : 'text-slate-700 dark:text-slate-300 hover:text-[#087F8C]',
                    ].join(' ')}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2.5">
              {/* Network Live Badge */}
              <div className="hidden lg:flex items-center gap-2 bg-[#ECFDF5] dark:bg-emerald-950/80 border border-[#A7F3D0] dark:border-emerald-800 text-[#047857] dark:text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full select-none">
                <span className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot" />
                <span>Network Live</span>
              </div>

              {/* DEDICATED LIGHT/DARK THEME TOGGLE BUTTON */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-[#087F8C] hover:border-slate-300 transition-colors shadow-sm"
                aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
              </button>

              {/* Hospital Login Button */}
              <Link
                href="/hospital-dashboard"
                className="hidden sm:inline-flex items-center justify-center h-10 px-5 rounded-xl border-1.5 border-[#087F8C] text-[#087F8C] font-semibold text-xs hover:bg-[#E6F7F5] dark:hover:bg-teal-950 transition-colors shadow-sm"
              >
                Hospital Login
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                className="mobile-menu-btn-only flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="container-xl py-4 space-y-2">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {label}
                </Link>
              ))}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                  className="text-xs font-semibold px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
                >
                  Theme: {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>

                <Link
                  href="/hospital-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#087F8C] text-[#087F8C] text-xs font-semibold"
                >
                  Hospital Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-20" aria-hidden="true" />
    </>
  );
}
