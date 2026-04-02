'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Menu,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  latestActiveSurveyId?: string;
}

export function AdminSidebar({ latestActiveSurveyId }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');

  const surveysHref = latestActiveSurveyId
    ? `admin/surveys/${latestActiveSurveyId}`
    : 'admin/surveys';

  const navItems = [
    { key: 'dashboard', icon: LayoutDashboard, href: 'admin' },
    { key: 'surveys', icon: ClipboardList, href: surveysHref },
  ] as const;

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push(`/${locale}/login`);
  }

  const sidebarContent = (
    <div className={cn(
      'flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
      collapsed ? 'w-[56px]' : 'w-[200px]'
    )}>
      {/* Brand */}
      <div className={cn(
        'flex items-center h-14 border-b border-gray-100',
        collapsed ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        {!collapsed && (
          <span className="text-sm font-light text-gray-900 tracking-tight">
            Culture<span className="font-semibold">Survey</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-50 text-gray-400 hover:text-gray-600 hidden md:flex transition-colors"
          aria-label={collapsed ? t('toggleExpand') : t('toggleCollapse')}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-3', collapsed ? 'px-1.5' : 'px-3')}>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const href = `/${locale}/${item.href}`;
            const isActive = item.key === 'surveys'
              ? pathname.includes('/admin/surveys')
              : pathname === `/${locale}/admin` || pathname === href;
            return (
              <Link
                key={item.key}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md text-[13px] transition-all duration-150 relative',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                  isActive
                    ? 'text-gray-900 font-medium bg-gray-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/60'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gray-50 rounded-md"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <item.icon className={cn('flex-shrink-0', collapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4')} />
                {!collapsed && <span>{t(item.key)}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        'border-t border-gray-100 py-3 flex',
        collapsed ? 'flex-col gap-0.5 px-1.5' : 'gap-0.5 px-3'
      )}>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 rounded-md text-[13px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-1',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2'
          )}
        >
          <LogOut className={cn('flex-shrink-0', collapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4')} />
          {!collapsed && <span>{t('signOut')}</span>}
        </button>
        <Link
          href={`/${locale}/admin/settings`}
          className={cn(
            'flex items-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors',
            collapsed ? 'justify-center p-2.5' : 'p-2'
          )}
          aria-label={t('settings')}
        >
          <Settings className={cn('flex-shrink-0', collapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4')} />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-3 bg-white rounded-md shadow-sm border border-border min-w-[44px] min-h-[44px] flex items-center justify-center"
        onClick={() => setMobileOpen(true)}
        aria-label={t('toggleMenu')}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/20"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -200 }}
              animate={{ x: 0 }}
              exit={{ x: -200 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative shadow-xl"
            >
              {sidebarContent}
            </motion.div>
            <button
              className="absolute top-3 right-3 p-2 rounded-md bg-white/90 shadow-sm z-50"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen sticky top-0">{sidebarContent}</div>
    </>
  );
}
