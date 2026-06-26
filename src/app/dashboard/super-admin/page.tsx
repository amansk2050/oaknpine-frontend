'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { 
  Building2, 
  Calendar, 
  Home, 
  ShieldAlert, 
  Loader2, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Briefcase,
  Zap,
  Activity,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BusinessStats {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  homestaysCount: number;
  bookingsCount: number;
}

interface BookingStats {
  id: string;
  reference: string;
  guestName: string;
  type: string;
  totalAmount: number;
  createdAt: string;
  businessName: string | null;
}

interface SuperAdminStats {
  totalBusinesses: number;
  totalHomestays: number;
  totalBookings: number;
  businesses: BusinessStats[];
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [bookings, setBookings] = useState<BookingStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionPending) return;

    if (!session?.user || session.user.roleType !== 'super_admin') {
      setError('Unauthorized access. Super Admin role required.');
      setLoading(false);
      return;
    }

    Promise.all([
      authClient.superAdmin.getStatistics(),
      authClient.superAdmin.getBookings()
    ]).then(([statsRes, bookingsRes]) => {
      if (statsRes.error) {
        setError(statsRes.error.message || 'Failed to fetch statistics');
      } else if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      setLoading(false);
    }).catch(() => {
      setError('Network error. Failed to load analytics.');
      setLoading(false);
    });
  }, [session, sessionPending]);

  if (sessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Analytics Dashboard...</p>
      </div>
    );
  }

  if (error && (!session?.user || session.user.roleType !== 'super_admin')) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-red-200 p-8 shadow-md text-center space-y-5">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">Super Admin privileges are required to view this page.</p>
        <button onClick={() => router.push('/dashboard')} className="px-6 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Error Loading Data</h3>
        <p className="text-sm text-slate-500">{error || 'An unexpected error occurred.'}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-xl shadow">
          Try Again
        </button>
      </div>
    );
  }

  // Calculate weekly analytics: group signups and bookings for the last 6 weeks
  const getWeeklyBreakdown = () => {
    const breakdown = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      // Calculate start and end of week (Sunday to Saturday or last N*7 days)
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const label = i === 0 ? 'This Week' : `${i}w ago`;
      
      // Filter signups
      const signupsCount = stats.businesses.filter(b => {
        const d = new Date(b.createdAt);
        return d >= weekStart && d < weekEnd;
      }).length;

      // Filter bookings placed in this week
      const weeklyBookings = bookings.filter(b => {
        const d = new Date(b.createdAt);
        return d >= weekStart && d < weekEnd;
      });

      const bookingsCount = weeklyBookings.length;
      const bookingsValue = weeklyBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      breakdown.push({
        label,
        signups: signupsCount,
        bookings: bookingsCount,
        value: bookingsValue
      });
    }
    return breakdown;
  };

  const weeklyData = getWeeklyBreakdown();
  
  // Calculate top performing businesses
  const topBusinesses = [...stats.businesses]
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  // Calculate gross sales volume
  const totalGrossVolume = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* Hero Analytics Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-400/20">
                SaaS System Controller
              </span>
              <span className="text-slate-400 text-sm">•</span>
              <span className="text-emerald-400 text-sm font-medium">Global Weekly Trends</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">System Performance & Growth</h1>
            <p className="text-slate-300 mt-2 text-base">
              Monitor customer registration rates, bookings volumes, and overall system transactions.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-5 py-4 shrink-0 text-right">
            <span className="text-slate-400 text-xs block mb-0.5">SaaS Gross Value</span>
            <span className="text-2xl font-black text-emerald-400">₹{Math.round(totalGrossVolume).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total signed up SaaS business profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total SaaS Signups</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalBusinesses}</h3>
            <span className="text-xs text-indigo-600 font-semibold mt-2 block hover:underline cursor-pointer" onClick={() => router.push('/dashboard/super-admin/businesses')}>
              Manage Businesses →
            </span>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Active Homestays */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Homestays Managed</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalHomestays}</h3>
            <span className="text-xs text-emerald-600 font-semibold mt-2 block hover:underline cursor-pointer" onClick={() => router.push('/dashboard/super-admin/homestays')}>
              View Properties →
            </span>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Home className="w-6 h-6" />
          </div>
        </div>

        {/* Total System Bookings placed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Guest Bookings</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalBookings}</h3>
            <span className="text-xs text-violet-600 font-semibold mt-2 block hover:underline cursor-pointer" onClick={() => router.push('/dashboard/super-admin/bookings')}>
              Monitor Bookings →
            </span>
          </div>
          <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly breakdown metrics bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Weekly System Analytics</h2>
            <p className="text-sm text-slate-500">Track registrations, booking placement volume, and value growth over the last 6 weeks.</p>
          </div>

          <div className="space-y-5">
            {weeklyData.map((week, idx) => {
              // Calculate width percentages for visual progress bars
              const maxSignups = Math.max(...weeklyData.map(w => w.signups), 1);
              const maxBookings = Math.max(...weeklyData.map(w => w.bookings), 1);
              
              const signupPct = (week.signups / maxSignups) * 100;
              const bookingPct = (week.bookings / maxBookings) * 100;

              return (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="w-24 shrink-0">
                    <span className="font-bold text-slate-950 text-sm">{week.label}</span>
                  </div>

                  {/* Growth Progress Bars */}
                  <div className="flex-1 space-y-2 w-full">
                    {/* Signups Progress */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>New SaaS Registrations</span>
                      <span className="text-slate-900">{week.signups}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${signupPct}%` }} />
                    </div>

                    {/* Bookings Progress */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-1">
                      <span>Bookings Placed</span>
                      <span className="text-slate-900">{week.bookings}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${bookingPct}%` }} />
                    </div>
                  </div>

                  {/* Gross volume value */}
                  <div className="text-right shrink-0 min-w-[120px] md:pl-4">
                    <span className="text-slate-400 text-xs block">Volume Value</span>
                    <span className="text-sm font-bold text-emerald-800">₹{Math.round(week.value).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Top Businesses & Activity Log */}
        <div className="space-y-6">
          {/* Top tenants */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Top SaaS Performers
            </h3>
            
            <div className="space-y-3.5">
              {topBusinesses.map((b, i) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-slate-100 rounded-full text-xs font-bold flex items-center justify-center text-slate-600 shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-slate-900 truncate max-w-[130px]">{b.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">{b.bookingsCount} Bookings</span>
                    <span className="text-[10px] text-slate-500 block">{b.homestaysCount} Homestays</span>
                  </div>
                </div>
              ))}
              {topBusinesses.length === 0 && (
                <p className="text-slate-400 text-xs italic">No performance logs found.</p>
              )}
            </div>
          </div>

          {/* Quick links banner */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none" />
            <div>
              <h4 className="font-bold text-sm">Need System Diagnostics?</h4>
              <p className="text-indigo-200 text-xs mt-1 leading-relaxed">View database entries, check tenant slugs, and monitor billing transactions directly.</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/super-admin/businesses')}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Verify Customer Slugs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
