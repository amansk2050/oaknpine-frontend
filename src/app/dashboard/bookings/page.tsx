'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Calendar,
  Users,
  Building2,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  LogIn,
  LogOut,
} from 'lucide-react';
import {
  useBookings,
  useBookingStatistics,
  Booking,
  BookingStatus,
} from '@/services/room-booking';

// Helper function to safely format currency
const formatCurrency = (value: number | string | undefined | null): string => {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');

  const { data: bookings, isLoading } = useBookings();
  const { data: statistics } = useBookingStatistics();

  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      [BookingStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
      [BookingStatus.CONFIRMED]: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
      [BookingStatus.CHECKED_IN]: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: LogIn, label: 'Checked In' },
      [BookingStatus.CHECKED_OUT]: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: LogOut, label: 'Checked Out' },
      [BookingStatus.CANCELLED]: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
      [BookingStatus.NO_SHOW]: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: XCircle, label: 'No Show' },
    };
    return configs[status] || configs[BookingStatus.PENDING];
  };

  // Filter bookings based on URL param
  const getFilteredBookings = () => {
    let filtered = bookings || [];

    // Apply URL filter
    if (filterParam === 'check-in-today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(b => 
        new Date(b.checkInDate).toDateString() === today && 
        b.status === BookingStatus.CONFIRMED
      );
    } else if (filterParam === 'check-out-today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(b => 
        new Date(b.checkOutDate).toDateString() === today && 
        b.status === BookingStatus.CHECKED_IN
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestPhone.includes(searchQuery)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  const totalRevenue = parseFloat(String(statistics?.totalRevenue || 0)) || 0;
  const totalPaid = parseFloat(String(statistics?.totalPaid || 0)) || 0;

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-blue-900 rounded-2xl p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-emerald-400 text-sm font-medium">Booking Management</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Bookings 📅
            </h1>
            <p className="text-slate-300 text-lg">
              Manage all reservations and guest stays
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/bookings/create')}
            className="hidden md:flex px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all font-medium items-center gap-2 border border-white/20"
          >
            <Plus className="w-5 h-5" />
            New Booking
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.totalBookings || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.confirmedBookings || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Checked In</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.checkedInBookings || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Revenue</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Collected</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by guest name, reference, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Status</option>
              <option value={BookingStatus.PENDING}>Pending</option>
              <option value={BookingStatus.CONFIRMED}>Confirmed</option>
              <option value={BookingStatus.CHECKED_IN}>Checked In</option>
              <option value={BookingStatus.CHECKED_OUT}>Checked Out</option>
              <option value={BookingStatus.CANCELLED}>Cancelled</option>
            </select>
            <button
              onClick={() => router.push('/dashboard/bookings/create')}
              className="md:hidden px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredBookings && filteredBookings.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Booking</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Guest</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Dates</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Homestay</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking: Booking) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr 
                      key={booking.id} 
                      onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{booking.bookingReference}</p>
                          <p className="text-xs text-slate-500">{booking.totalRooms} room(s) • {booking.numberOfNights} night(s)</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{booking.guestName}</p>
                          <p className="text-xs text-slate-500">{booking.guestPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-900">
                            {new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs text-slate-500">
                            to {new Date(booking.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{booking.homestay?.name || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{formatCurrency(booking.totalAmount)}</p>
                          {!booking.isPaymentComplete && (
                            <p className="text-xs text-orange-600">Due: {formatCurrency(booking.balanceAmount)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
          <p className="text-slate-600 mb-6">Create your first booking from a qualified lead</p>
          <button
            onClick={() => router.push('/dashboard/bookings/create')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-medium"
          >
            Create Booking
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}
