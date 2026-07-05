'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import {
  Handshake,
  LayoutDashboard,
  Calendar,
  LogOut,
  Home,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const partnerNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/b2b/partner/dashboard' },
  { icon: Calendar, label: 'Booking Requests', href: '/b2b/partner/bookings' },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const [isSubscribed, setIsSubscribed] = React.useState<boolean | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (isPending || !session) return;
    if (session.user.roleType === 'super_admin') {
      setIsSubscribed(true);
      return;
    }

    authClient.organization.getCurrent()
      .then(({ data }) => {
        if (data) {
          setIsSubscribed(data.isSubscribed !== false);
        } else {
          setIsSubscribed(true);
        }
      })
      .catch(() => {
        setIsSubscribed(true);
      });
  }, [session, isPending]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.replace('/login');
      toast.success('Signed out successfully');
    } catch {
      router.replace('/login');
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4">
        {/* Brand */}
        <Link href="/b2b/partner/dashboard" className="flex items-center gap-2 mr-4">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Handshake className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-sm font-bold text-slate-900">Partner Portal</span>
            <span className="text-xs text-blue-500">PineZone B2B</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200" />

        {/* Nav Links */}
        <nav className="flex items-center gap-1 flex-1">
          {partnerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Switch to Business Dashboard if they have an org */}
          <Link
            href={isSubscribed === false ? '/subscribe' : '/dashboard'}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg transition-all"
          >
            <Home className="w-4 h-4" />
            Business Dashboard
          </Link>

          {/* User info */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-slate-900 leading-none">{session.user.name}</p>
              <p className="text-xs text-slate-500">{session.user.email}</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
