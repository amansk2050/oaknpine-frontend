'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  CreditCard,
  Package,
  Briefcase,
  X,
} from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Leads', href: '/dashboard/leads' },
  { icon: Building2, label: 'Homestays', href: '/dashboard/homestays' },
  { icon: Calendar, label: 'Bookings', href: '/dashboard/bookings' },
  { icon: CreditCard, label: 'Payments', href: '/dashboard/payments' },
  {
    icon: Package,
    label: 'Packages',
    href: '/dashboard/packages',
  },
  {
    icon: Briefcase,
    label: 'B2B Partners',
    href: '/dashboard/b2b',
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const userName = session?.user?.name || 'Admin User';
  const userEmail = session?.user?.email || 'admin@pinezone.app';

  const itemsToShow: MenuItem[] = session?.user?.roleType === 'super_admin'
    ? [
        { icon: LayoutDashboard, label: 'Analytics', href: '/dashboard/super-admin' },
        { icon: Briefcase, label: 'Businesses', href: '/dashboard/super-admin/businesses' },
        { icon: Home, label: 'Homestays', href: '/dashboard/super-admin/homestays' },
        { icon: Calendar, label: 'Bookings', href: '/dashboard/super-admin/bookings' },
      ]
    : menuItems;

  const navContent = (
    <>
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {itemsToShow.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={`
                    group flex items-center px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5 flex-shrink-0
                      ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}
                    `}
                  />
                  {(!collapsed || mobileOpen) && (
                    <>
                      <span className="ml-3 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-700/50">
        <Link href="/dashboard/profile" onClick={onMobileClose}>
          <div
            className={`
              flex items-center space-x-3 p-2 rounded-lg
              bg-slate-800 border border-slate-700
              hover:bg-slate-700 cursor-pointer transition-all duration-200
              ${collapsed && !mobileOpen ? 'justify-center' : ''}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-slate-400 truncate">{userEmail}</p>
              </div>
            )}
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          border-r border-slate-700/50
          transition-transform duration-300 ease-in-out z-40
          w-64
          lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={onMobileClose}>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-none">PineZone</span>
              <span className="text-emerald-400 text-xs">Tourism CRM</span>
            </div>
          </Link>
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {navContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex lg:flex-col
          fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          border-r border-slate-700/50 backdrop-blur-xl
          transition-all duration-300 ease-in-out z-40
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-none">PineZone</span>
                <span className="text-emerald-400 text-xs">Tourism CRM</span>
              </div>
            </Link>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
}
