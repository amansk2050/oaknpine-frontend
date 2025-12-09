'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Calendar,
  Building2,
  Search,
  Phone,
  BarChart3,
  Rocket,
  ChevronRight,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  shadowColor: string;
  href: string;
}

export default function QuickActions() {
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'add-lead',
      label: 'Add Lead',
      description: 'Create new entry',
      icon: UserPlus,
      gradient: 'from-emerald-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/30',
      href: '/dashboard/leads?action=add',
    },
    {
      id: 'view-bookings',
      label: 'Bookings',
      description: 'View all',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/30',
      href: '/dashboard/bookings',
    },
    {
      id: 'add-homestay',
      label: 'Homestay',
      description: 'Add property',
      icon: Building2,
      gradient: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-500/30',
      href: '/dashboard/homestays?action=add',
    },
    {
      id: 'search-leads',
      label: 'Search',
      description: 'Find leads',
      icon: Search,
      gradient: 'from-orange-500 to-orange-600',
      shadowColor: 'shadow-orange-500/30',
      href: '/dashboard/leads',
    },
    {
      id: 'follow-ups',
      label: 'Follow-ups',
      description: 'Pending calls',
      icon: Phone,
      gradient: 'from-pink-500 to-pink-600',
      shadowColor: 'shadow-pink-500/30',
      href: '/dashboard/leads?filter=follow-up',
    },
    {
      id: 'reports',
      label: 'Reports',
      description: 'Analytics',
      icon: BarChart3,
      gradient: 'from-cyan-500 to-cyan-600',
      shadowColor: 'shadow-cyan-500/30',
      href: '/dashboard/reports',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <p className="text-sm text-slate-500">Shortcuts to common tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              className="group relative p-4 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center mb-3 shadow-lg ${action.shadowColor} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-800">{action.label}</h3>
              <p className="text-xs text-slate-500">{action.description}</p>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
