'use client';

import React from 'react';
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  useHomestays,
  useLeadStatistics,
  useBookingStatistics,
  useTodayCheckIns,
  useTodayCheckOuts,
} from '@/services';
import QuickActions from '@/components/dashboard/QuickActions';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  
  // Fetch data from APIs
  const { data: homestays } = useHomestays();
  const { data: leadStats } = useLeadStatistics();
  const { data: bookingStats } = useBookingStatistics();
  const { data: todayCheckIns } = useTodayCheckIns();
  const { data: todayCheckOuts } = useTodayCheckOuts();

  // Calculate derived stats
  const activeHomestays = homestays?.filter((h) => h.status === 'active').length || 0;
  const totalRooms = homestays?.reduce((sum, h) => sum + h.totalRooms, 0) || 0;

  // Parse revenue values (API returns strings)
  const totalRevenue = parseFloat(String(bookingStats?.totalRevenue || 0));
  const totalPaid = parseFloat(String(bookingStats?.totalPaid || 0));
  const pendingAmount = parseFloat(String(bookingStats?.pendingAmount || 0));
  
  // Format revenue with proper Indian notation
  const formatAmount = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const paidPercentage = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-2xl p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-emerald-400 text-sm font-medium">Dashboard Overview</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, Admin 👋
            </h1>
            <p className="text-slate-300 text-lg">
              Here&apos;s what&apos;s happening with your homestays today.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-slate-400 text-sm">Today&apos;s Date</p>
            <p className="text-2xl font-bold text-white">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-slate-400 text-sm">
              {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Bookings */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +12%
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-slate-900">{bookingStats?.totalBookings || 0}</p>
          </div>
        </div>

        {/* Active Homestays */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                {totalRooms} rooms
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Active Homestays</p>
            <p className="text-3xl font-bold text-slate-900">{activeHomestays}</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +8.2%
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900">{formatAmount(totalRevenue)}</p>
          </div>
        </div>

        {/* New Leads */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {leadStats?.conversionRate || '0%'}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">New Leads</p>
            <p className="text-3xl font-bold text-slate-900">{leadStats?.newLeads || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Revenue Overview</h2>
              <p className="text-slate-500 text-sm">Track your earnings and payments</p>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-slate-700">Live Data</span>
            </div>
          </div>

          {/* Revenue Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-sm font-medium text-emerald-700">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-emerald-800">{formatAmount(totalRevenue)}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-700">Collected</p>
              </div>
              <p className="text-2xl font-bold text-blue-800">{formatAmount(totalPaid)}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-medium text-orange-700">Pending</p>
              </div>
              <p className="text-2xl font-bold text-orange-800">{formatAmount(pendingAmount)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Payment Collection Progress</span>
              <span className="text-lg font-bold text-emerald-600">{paidPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500 rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${paidPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Today&apos;s Activity</h3>
              <p className="text-sm text-slate-500">Real-time schedule</p>
            </div>
          </div>

          <div className="space-y-4">
            <div 
              onClick={() => router.push('/dashboard/bookings?filter=check-in-today')}
              className="group p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">Check-ins</p>
                    <p className="text-xs text-emerald-600">Arrivals today</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-emerald-600">{todayCheckIns?.length || 0}</span>
              </div>
            </div>

            <div 
              onClick={() => router.push('/dashboard/bookings?filter=check-out-today')}
              className="group p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Check-outs</p>
                    <p className="text-xs text-blue-600">Departures today</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-blue-600">{todayCheckOuts?.length || 0}</span>
              </div>
            </div>

            <div 
              onClick={() => router.push('/dashboard/leads?filter=follow-up')}
              className="group p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900">Follow-ups</p>
                    <p className="text-xs text-orange-600">Pending calls</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-orange-600">{leadStats?.qualifiedLeads || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Pipeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Lead Pipeline</h3>
                <p className="text-sm text-slate-500">Conversion funnel overview</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/dashboard/leads')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{leadStats?.totalLeads || 0}</p>
              <p className="text-xs text-blue-600 font-medium">Total Leads</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-purple-700">{leadStats?.qualifiedLeads || 0}</p>
              <p className="text-xs text-purple-600 font-medium">Qualified</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-emerald-700">{leadStats?.convertedLeads || 0}</p>
              <p className="text-xs text-emerald-600 font-medium">Converted</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-red-700">{leadStats?.lostLeads || 0}</p>
              <p className="text-xs text-red-600 font-medium">Lost</p>
            </div>
          </div>

          {/* Conversion Rate Bar */}
          <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Overall Conversion Rate</span>
              <span className="text-lg font-bold text-emerald-600">{leadStats?.conversionRate || '0%'}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-emerald-500 to-emerald-400 rounded-full"
                style={{ width: leadStats?.conversionRate || '0%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
