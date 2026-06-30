'use client';

import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  collapsed: boolean;
  onMobileMenuOpen: () => void;
}

export default function Header({ collapsed, onMobileMenuOpen }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 z-30 transition-all duration-300 left-0 ${
        collapsed ? 'lg:left-20' : 'lg:left-64'
      }`}
    >
      <div className="h-full px-4 md:px-6 flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand name on mobile */}
        <span className="lg:hidden font-bold text-slate-800 text-base">PineZone</span>

        {/* Search Bar - hidden on mobile, shown sm+ */}
        <div className="flex-1 max-w-2xl hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search homestays, bookings, guests..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile Search icon */}
          <button className="sm:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-slate-600" />
          </button>
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
