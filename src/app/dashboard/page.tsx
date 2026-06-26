'use client';

import React from 'react';
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
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
  useExpenseStatistics,
} from '@/services';
import QuickActions from '@/components/dashboard/QuickActions';
import BookingCalendar from '@/components/dashboard/BookingCalendar';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
 
export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || 'Admin User';
  const [org, setOrg] = React.useState<any>(null);

  React.useEffect(() => {
    if (session?.user?.roleType === 'super_admin') {
      router.push('/dashboard/super-admin');
      return;
    }

    authClient.organization.getCurrent().then(({ data }) => {
      if (data) {
        setOrg(data);
      }
    });
  }, [session, router]);
  
  // Fetch data from APIs
  const { data: homestays } = useHomestays();
  const { data: leadStats } = useLeadStatistics();
  const { data: bookingStats } = useBookingStatistics();
  const { data: todayCheckIns } = useTodayCheckIns();
  const { data: todayCheckOuts } = useTodayCheckOuts();
  const { data: expenseStats } = useExpenseStatistics();

  // Calculate derived stats
  const activeHomestays = homestays?.filter((h) => h.status === 'active').length || 0;
  const totalRooms = homestays?.reduce((sum, h) => sum + h.totalRooms, 0) || 0;

  // Parse revenue and expense values
  const totalPaid = parseFloat(String(bookingStats?.totalPaid || 0));
  const pendingAmount = parseFloat(String(bookingStats?.pendingAmount || 0));
  
  const displayRevenue = parseFloat(String(expenseStats?.totalRevenue || bookingStats?.totalRevenue || 0));
  const displayExpenses = parseFloat(String(expenseStats?.totalExpenses || 0));
  const displayNetProfit = parseFloat(String(expenseStats?.netProfit || 0));
  
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

  const paidPercentage = displayRevenue > 0 ? (totalPaid / displayRevenue) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Profile Completeness Alert Glassmorphism Banner */}
      {org && (!org.phone || !org.address || !org.logo) && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-white to-amber-50/30 backdrop-blur-md border border-amber-200/60 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn animate-duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 shrink-0">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Complete Your Business Profile</h3>
              <p className="text-slate-600 text-sm mt-0.5">
                Some details (phone, address, or logo) are missing. Complete your business profile to get the most out of PineZone.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="relative z-10 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            Complete Profile
          </button>
        </div>
      )}

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
              Welcome back, {userName.split(' ')[0]} 👋
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
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
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
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
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
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +8.2%
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900">{formatAmount(displayRevenue)}</p>
          </div>
        </div>

        {/* New Leads */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <Users className="w-6 h-6 text-orange-600" />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full" />
                <p className="text-sm font-medium text-slate-700">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">{formatAmount(displayRevenue)}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-700">Collected</p>
              </div>
              <p className="text-2xl font-bold text-blue-800">{formatAmount(totalPaid)}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <p className="text-sm font-medium text-rose-700">Total Expenses</p>
              </div>
              <p className="text-2xl font-bold text-rose-800">{formatAmount(displayExpenses)}</p>
            </div>
            <div className={`p-5 rounded-xl border ${displayNetProfit >= 0 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200' : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-4 h-4 ${displayNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                <p className={`text-sm font-medium ${displayNetProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net Profit</p>
              </div>
              <p className={`text-2xl font-bold ${displayNetProfit >= 0 ? 'text-emerald-850' : 'text-red-850'}`}>{formatAmount(displayNetProfit)}</p>
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

      {/* Visual Scheduler (Real-Time Booking Calendar) */}
      <BookingCalendar />

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
