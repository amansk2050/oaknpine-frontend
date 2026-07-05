'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [orgLoading, setOrgLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      setOrgLoading(false);
      return;
    }
    if (session.user.roleType === 'super_admin') {
      setIsSubscribed(true);
      setOrgLoading(false);
      return;
    }

    authClient.organization.getCurrent()
      .then(({ data }) => {
        if (data) {
          setIsSubscribed(data.isSubscribed !== false);
        } else {
          // No organization yet, let them proceed to create one
          setIsSubscribed(true);
        }
        setOrgLoading(false);
      })
      .catch(() => {
        setIsSubscribed(true);
        setOrgLoading(false);
      });
  }, [session, isPending]);

  useEffect(() => {
    if (!orgLoading && isSubscribed === false) {
      router.replace('/b2b/partner/dashboard');
    }
  }, [orgLoading, isSubscribed, router]);

  if (isPending || orgLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-slate-400 font-semibold tracking-wide">Loading PineZone...</p>
        </div>
      </div>
    );
  }

  if (!session || isSubscribed === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Header
        collapsed={collapsed}
        onMobileMenuOpen={() => setMobileOpen(true)}
      />
      {/* Main content: no left margin on mobile (sidebar is a drawer overlay), 
          correct left margin on desktop matching sidebar width */}
      <main
        className={`pt-20 pb-8 px-4 md:px-6 transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
