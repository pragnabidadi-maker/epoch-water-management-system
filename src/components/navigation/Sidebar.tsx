'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Drop,
  MapTrifold,
  Scales,
  ClipboardText,
  List,
  X,
} from '@phosphor-icons/react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard',      label: 'Dashboard',     icon: MapTrifold },
  { href: '/redistribution', label: 'Redistribution', icon: Scales },
  { href: '/audit',          label: 'Audit Trail',    icon: ClipboardText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-[#e5e7eb] text-[#111111]"
        aria-label="Open navigation"
      >
        <List size={18} weight="bold" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[220px]
          bg-white border-r border-[#e5e7eb]
          flex flex-col transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#e5e7eb]">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Drop
              size={18}
              weight="fill"
              className="text-[#059669]"
            />
            <span className="text-sm font-semibold tracking-tight text-[#111111]">
              UrbanTwin
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded text-[#6b7280] hover:text-[#111111] transition-colors"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    relative flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors
                    ${
                      isActive
                        ? 'text-[#111111] bg-[#f3f4f6]'
                        : 'text-[#6b7280] hover:text-[#111111] hover:bg-[#f9fafb]'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-[#f3f4f6] rounded-md"
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <Icon size={17} weight={isActive ? 'fill' : 'regular'} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer user row */}
        <div className="px-4 py-4 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center text-xs font-semibold text-[#111111]">
              N
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#111111] truncate">Ramesh K.</p>
              <p className="text-[11px] text-[#6b7280]">Operator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
