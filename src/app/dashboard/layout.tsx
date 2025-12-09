'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Header collapsed={collapsed} />
      <main
        className={`
          pt-20 pb-8 px-6 transition-all duration-300
          ${collapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
