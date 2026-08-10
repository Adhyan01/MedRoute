'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Siren, Search, FileText, Ambulance } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  isEmergency?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',      icon: Home,      href: '/' },
  { label: 'Emergency', icon: Siren,     href: '/emergency',   isEmergency: true },
  { label: 'Find',      icon: Search,    href: '/emergency' },
  { label: 'Transfers', icon: Ambulance, href: '/transfer' },
  { label: 'Requests',  icon: FileText,  href: '/reservation' },
];

export default function MobileNav() {
  const pathname = usePathname();

  const getActive = (item: NavItem): boolean => {
    if (item.href === '/') return pathname === '/';
    if (item.label === 'Find') return false; // defer to Emergency
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <nav
      className="mobile-nav hidden max-md:block"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-stretch justify-around px-1 py-1">
        {NAV_ITEMS.map((item) => {
          const active = getActive(item);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={[
                'relative flex flex-col items-center justify-center gap-1 min-h-[50px] flex-1 py-1.5 px-1 rounded-xl transition-all duration-150',
                active
                  ? 'text-teal-700 font-bold'
                  : item.isEmergency
                  ? 'text-red-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              <div className="relative">
                <IconComponent
                  size={20}
                  className={active ? 'stroke-[2.5]' : item.isEmergency ? 'stroke-[2.5] text-red-600' : 'stroke-[1.8]'}
                />
                {item.isEmergency && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 animate-ping" />
                )}
              </div>

              <span className="text-[10px] leading-none tracking-tight">
                {item.label}
              </span>

              {active && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
