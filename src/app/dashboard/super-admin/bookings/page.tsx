'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { 
  Building2, 
  Search, 
  ShieldAlert, 
  Loader2, 
  Calendar,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  Tag,
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingStats {
  id: string;
  reference: string;
  guestName: string;
  type: 'Room Booking' | 'Package Booking';
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  totalPaid: number;
  pendingAmount: number;
  createdAt: string;
  businessName: string | null;
  businessSlug: string | null;
}

export default function SuperAdminBookingsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  
  const [bookings, setBookings] = useState<BookingStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'room' | 'package'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (sessionPending) return;

    if (!session?.user || session.user.roleType !== 'super_admin') {
      setError('Unauthorized access. Super Admin role required.');
      setLoading(false);
      return;
    }

    authClient.superAdmin.getBookings()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || 'Failed to fetch bookings');
        } else if (data) {
          setBookings(data);
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Network error. Failed to load bookings.');
        setLoading(false);
      });
  }, [session, sessionPending]);

  if (sessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Global Bookings...</p>
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

  // Format currency
  const formatPrice = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchQuery = searchQuery.toLowerCase();
    const matchesSearch = (
      (b.guestName || '').toLowerCase().includes(matchQuery) ||
      (b.reference || '').toLowerCase().includes(matchQuery) ||
      (b.businessName || '').toLowerCase().includes(matchQuery)
    );

    if (!matchesSearch) return false;

    if (typeFilter === 'room' && b.type !== 'Room Booking') return false;
    if (typeFilter === 'package' && b.type !== 'Package Booking') return false;

    if (statusFilter !== 'all') {
      if (b.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Calculate statistics
  const totalVolume = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaidVolume = filteredBookings.reduce((sum, b) => sum + (b.totalPaid || 0), 0);
  const roomBookingsCount = filteredBookings.filter(b => b.type === 'Room Booking').length;
  const packageBookingsCount = filteredBookings.filter(b => b.type === 'Package Booking').length;

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Calendar className="w-8 h-8 text-emerald-600" />
          Global Guest Bookings
        </h1>
        <p className="text-slate-500 mt-1.5">View and monitor room bookings and package tour bookings across the entire PineZone system.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* KPI: Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase">Total Bookings</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{filteredBookings.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Room Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase">Room Bookings</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{roomBookingsCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* KPI: Package Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase">Package Bookings</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{packageBookingsCount}</h3>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Combined Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase">Total Value</p>
            <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{formatPrice(totalVolume)}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Controls Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Booking Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search guest, reference or business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Filter Booking Type */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 cursor-pointer"
              >
                <option value="all">All Booking Types</option>
                <option value="room">Room Bookings Only</option>
                <option value="package">Package Bookings Only</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table View */}
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-base font-semibold">No bookings match the criteria</p>
            <p className="text-sm mt-1">Try resetting the filters or search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Reference / Type</th>
                  <th className="py-4 px-6">Guest / Contact</th>
                  <th className="py-4 px-6">Business Tenant</th>
                  <th className="py-4 px-6">Travel Dates</th>
                  <th className="py-4 px-6 text-right">Payments</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* Reference & Type */}
                    <td className="py-4.5 px-6">
                      <div className="font-bold text-slate-900">{b.reference}</div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                        b.type === 'Room Booking'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {b.type}
                      </span>
                    </td>

                    {/* Guest Name */}
                    <td className="py-4.5 px-6">
                      <div className="font-semibold text-slate-800">{b.guestName}</div>
                      <div className="text-xs text-slate-405 mt-0.5">Placed: {new Date(b.createdAt).toLocaleDateString('en-US')}</div>
                    </td>

                    {/* Tenant Business */}
                    <td className="py-4.5 px-6">
                      {b.businessName ? (
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>{b.businessName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No business linked</span>
                      )}
                    </td>

                    {/* Check In / Out Dates */}
                    <td className="py-4.5 px-6">
                      <div className="text-slate-800 font-medium">
                        {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(b.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-450 mt-0.5">
                        {Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 65 * 65 * 24))} nights
                      </div>
                    </td>

                    {/* Total Amount / Collected */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="font-bold text-slate-900">{formatPrice(b.totalAmount)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Paid: <span className="text-emerald-600 font-semibold">{formatPrice(b.totalPaid)}</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4.5 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        ['confirmed', 'checked_out', 'paid'].includes(b.status.toLowerCase())
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : b.status.toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
