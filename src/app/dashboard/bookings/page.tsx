'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Calendar,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  LogIn,
  LogOut,
  Package,
  Home,
  TrendingUp,
  CreditCard,
  Filter,
  PieChart,
} from 'lucide-react';
import {
  useBookings,
  useBookingStatistics,
  Booking,
  BookingStatus,
} from '@/services/room-booking';
import {
  usePackageBookings,
  usePackageBookingStatistics,
  PackageBooking,
  PackageBookingStatus,
} from '@/services/package-booking';
import { BookingTypeDialog } from '@/components/bookings';

// Helper function to safely format currency
const formatCurrency = (value: number | string | undefined | null): string => {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

type BookingTab = 'all' | 'room' | 'package';

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<BookingTab>('all');
  const [isBookingTypeDialogOpen, setIsBookingTypeDialogOpen] = useState(false);

  // Room Bookings
  const { data: roomBookings, isLoading: roomLoading } = useBookings();
  const { data: roomStats } = useBookingStatistics();

  // Package Bookings
  const { data: packageBookings, isLoading: packageLoading } = usePackageBookings();
  const { data: packageStats } = usePackageBookingStatistics();

  const isLoading = roomLoading || packageLoading;

  // Calculate proper revenue - separate direct room bookings from package-linked ones
  const revenueStats = useMemo(() => {
    // Get all package booking room IDs (room bookings created from packages)
    const packageLinkedBookingIds = new Set<string>();
    packageBookings?.forEach(pb => {
      pb.packageBookingRooms?.forEach(pbr => {
        if (pbr.bookingId) {
          packageLinkedBookingIds.add(pbr.bookingId);
        }
      });
    });

    // Calculate direct room booking revenue (exclude package-linked)
    let directRoomRevenue = 0;
    let directRoomPaid = 0;
    let directRoomBookingsCount = 0;

    roomBookings?.forEach(rb => {
      if (!packageLinkedBookingIds.has(rb.id)) {
        // This is a direct room booking, not from a package
        directRoomRevenue += parseFloat(String(rb.totalAmount)) || 0;
        directRoomPaid += parseFloat(String(rb.paidAmount)) || 0;
        directRoomBookingsCount++;
      }
    });

    // Package booking revenue (includes homestay already)
    const packageRevenue = packageStats?.totalRevenue || 0;
    const packagePaid = packageStats?.totalPaid || 0;
    const packageBookingsCount = packageStats?.totalBookings || 0;

    // Total unique revenue
    const totalRevenue = directRoomRevenue + packageRevenue;
    const totalPaid = directRoomPaid + packagePaid;
    const pendingAmount = totalRevenue - totalPaid;

    return {
      directRoomRevenue,
      directRoomPaid,
      directRoomBookingsCount,
      packageRevenue,
      packagePaid,
      packageBookingsCount,
      totalRevenue,
      totalPaid,
      pendingAmount,
      packageLinkedBookingIds,
    };
  }, [roomBookings, packageBookings, packageStats]);

  // Combined statistics (avoiding double count)
  const combinedStats = useMemo(() => ({
    totalBookings: revenueStats.directRoomBookingsCount + revenueStats.packageBookingsCount,
    directRoomBookings: revenueStats.directRoomBookingsCount,
    packageBookings: revenueStats.packageBookingsCount,
    confirmedBookings: (roomStats?.confirmedBookings || 0) + (packageStats?.confirmedBookings || 0),
    totalRevenue: revenueStats.totalRevenue,
    totalPaid: revenueStats.totalPaid,
    pendingAmount: revenueStats.pendingAmount,
    directRoomRevenue: revenueStats.directRoomRevenue,
    packageRevenue: revenueStats.packageRevenue,
  }), [roomStats, packageStats, revenueStats]);

  const getRoomStatusConfig = (status: BookingStatus) => {
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

  const getPackageStatusConfig = (status: PackageBookingStatus) => {
    const configs = {
      [PackageBookingStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
      [PackageBookingStatus.CONFIRMED]: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Confirmed' },
      [PackageBookingStatus.CHECKED_IN]: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: LogIn, label: 'Checked In' },
      [PackageBookingStatus.CHECKED_OUT]: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: LogOut, label: 'Checked Out' },
      [PackageBookingStatus.COMPLETED]: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle2, label: 'Completed' },
      [PackageBookingStatus.CANCELLED]: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
      [PackageBookingStatus.NO_SHOW]: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: XCircle, label: 'No Show' },
    };
    return configs[status] || configs[PackageBookingStatus.PENDING];
  };

  // Filter room bookings - only show DIRECT bookings (not from packages)
  const getFilteredRoomBookings = () => {
    let filtered = roomBookings || [];

    // Exclude room bookings that are linked to packages
    filtered = filtered.filter(b => !revenueStats.packageLinkedBookingIds.has(b.id));

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

    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestPhone.includes(searchQuery)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    return filtered;
  };

  // Filter package bookings
  const getFilteredPackageBookings = () => {
    let filtered = packageBookings || [];

    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestPhone.includes(searchQuery)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    return filtered;
  };

  const filteredRoomBookings = getFilteredRoomBookings();
  const filteredPackageBookings = getFilteredPackageBookings();

  // Combined bookings for "All" tab
  const allBookings = [
    ...filteredRoomBookings.map(b => ({ ...b, type: 'room' as const })),
    ...filteredPackageBookings.map(b => ({ ...b, type: 'package' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const displayBookings = activeTab === 'all' ? allBookings :
    activeTab === 'room' ? filteredRoomBookings.map(b => ({ ...b, type: 'room' as const })) :
    filteredPackageBookings.map(b => ({ ...b, type: 'package' as const }));

  // Calculate revenue percentage for pie chart
  const roomRevenuePercent = combinedStats.totalRevenue > 0 
    ? (combinedStats.directRoomRevenue / combinedStats.totalRevenue) * 100 
    : 0;
  const packageRevenuePercent = combinedStats.totalRevenue > 0 
    ? (combinedStats.packageRevenue / combinedStats.totalRevenue) * 100 
    : 0;

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
              All Bookings 📅
            </h1>
            <p className="text-slate-300 text-lg">
              Manage room bookings & package reservations
            </p>
          </div>
          <button
            onClick={() => setIsBookingTypeDialogOpen(true)}
            className="hidden md:flex px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all font-medium items-center gap-2 border border-white/20"
          >
            <Plus className="w-5 h-5" />
            New Booking
          </button>
        </div>
      </div>

      {/* Revenue Summary Card - New section showing breakdown */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Revenue Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Direct Room Revenue */}
          <div className="p-4 bg-white rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Direct Room Bookings</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(combinedStats.directRoomRevenue)}</p>
            <p className="text-xs text-slate-500 mt-1">
              {combinedStats.directRoomBookings} booking(s) • {roomRevenuePercent.toFixed(0)}% of total
            </p>
            <div className="mt-2 h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${roomRevenuePercent}%` }} />
            </div>
          </div>

          {/* Package Revenue */}
          <div className="p-4 bg-white rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Package Bookings</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(combinedStats.packageRevenue)}</p>
            <p className="text-xs text-slate-500 mt-1">
              {combinedStats.packageBookings} booking(s) • {packageRevenuePercent.toFixed(0)}% of total
            </p>
            <div className="mt-2 h-2 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${packageRevenuePercent}%` }} />
            </div>
            <p className="text-xs text-purple-600 mt-1">* Includes homestay</p>
          </div>

          {/* Total Revenue */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(combinedStats.totalRevenue)}</p>
            <p className="text-xs text-slate-500 mt-1">
              {combinedStats.totalBookings} total booking(s)
            </p>
          </div>

          {/* Collection Status */}
          <div className="p-4 bg-white rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Collection Status</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-green-600">{formatCurrency(combinedStats.totalPaid)}</p>
              <span className="text-sm text-slate-500">collected</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-lg font-semibold text-orange-600">{formatCurrency(combinedStats.pendingAmount)}</p>
              <span className="text-xs text-slate-500">pending</span>
            </div>
            <div className="mt-2 h-2 bg-orange-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${combinedStats.totalRevenue > 0 ? (combinedStats.totalPaid / combinedStats.totalRevenue) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            💡 <strong>Note:</strong> Room bookings created from packages are counted under &quot;Package Bookings&quot; revenue only. 
            &quot;Direct Room Bookings&quot; shows only standalone room reservations not linked to any package.
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-slate-500 text-xs font-medium mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-900">{combinedStats.totalBookings}</p>
          <p className="text-xs text-slate-500 mt-1">
            {combinedStats.directRoomBookings} room + {combinedStats.packageBookings} package
          </p>
        </div>

        {/* Direct Room Bookings */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Direct</span>
          </div>
          <p className="text-slate-500 text-xs font-medium mb-1">Room Bookings</p>
          <p className="text-2xl font-bold text-slate-900">{combinedStats.directRoomBookings}</p>
          <p className="text-xs text-emerald-600 mt-1">{formatCurrency(combinedStats.directRoomRevenue)}</p>
        </div>

        {/* Package Bookings */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Package</span>
          </div>
          <p className="text-slate-500 text-xs font-medium mb-1">Package Bookings</p>
          <p className="text-2xl font-bold text-slate-900">{combinedStats.packageBookings}</p>
          <p className="text-xs text-purple-600 mt-1">{formatCurrency(combinedStats.packageRevenue)}</p>
        </div>

        {/* Confirmed */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-300 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/30">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          </div>
          <p className="text-slate-500 text-xs font-medium mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-slate-900">{combinedStats.confirmedBookings}</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Bookings
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'all' ? 'bg-white/20' : 'bg-slate-200'
            }`}>
              {allBookings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'room'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            Direct Room
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'room' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {filteredRoomBookings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'package'
                ? 'bg-purple-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Package
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'package' ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
            }`}>
              {filteredPackageBookings.length}
            </span>
          </button>
        </div>

        {/* Search & Filters */}
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
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => setIsBookingTypeDialogOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : displayBookings && displayBookings.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Booking</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Guest</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Dates</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Details</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayBookings.map((booking) => {
                  const isRoom = booking.type === 'room';
                  const statusConfig = isRoom 
                    ? getRoomStatusConfig((booking as Booking & { type: 'room' }).status)
                    : getPackageStatusConfig((booking as PackageBooking & { type: 'package' }).status);
                  const StatusIcon = statusConfig.icon;
                  
                  const checkIn = isRoom 
                    ? (booking as Booking).checkInDate 
                    : (booking as PackageBooking).startDate;
                  const checkOut = isRoom 
                    ? (booking as Booking).checkOutDate 
                    : (booking as PackageBooking).endDate;

                  return (
                    <tr 
                      key={booking.id} 
                      onClick={() => router.push(
                        isRoom 
                          ? `/dashboard/bookings/${booking.id}`
                          : `/dashboard/bookings/package/${booking.id}`
                      )}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        {isRoom ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                            <Home className="w-3.5 h-3.5" />
                            Room
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                            <Package className="w-3.5 h-3.5" />
                            Package
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{booking.bookingReference}</p>
                          <p className="text-xs text-slate-500">
                            {isRoom 
                              ? `${(booking as Booking).totalRooms} room(s) • ${(booking as Booking).numberOfNights} night(s)`
                              : `${(booking as PackageBooking).package?.name || 'Package'}`
                            }
                          </p>
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
                            {new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs text-slate-500">
                            to {new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">
                          {isRoom ? (
                            <span>{(booking as Booking).homestay?.name || '-'}</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span>{(booking as PackageBooking).numberOfAdults} Adults</span>
                              {(booking as PackageBooking).includesHomestay && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                  +Homestay
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{formatCurrency(booking.totalAmount)}</p>
                          {!booking.isPaymentComplete && (
                            <p className="text-xs text-orange-600">Due: {formatCurrency(booking.balanceAmount)}</p>
                          )}
                          {booking.isPaymentComplete && (
                            <p className="text-xs text-emerald-600">✓ Paid</p>
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
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'package' ? (
              <Package className="w-10 h-10 text-purple-600" />
            ) : activeTab === 'room' ? (
              <Home className="w-10 h-10 text-emerald-600" />
            ) : (
              <Calendar className="w-10 h-10 text-emerald-600" />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No {activeTab === 'all' ? '' : activeTab === 'room' ? 'direct room ' : 'package '}bookings found
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || statusFilter 
              ? 'Try adjusting your search or filters'
              : 'Create your first booking to get started'
            }
          </p>
          <button
            onClick={() => setIsBookingTypeDialogOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-medium"
          >
            Create Booking
          </button>
        </div>
      )}

      {/* Booking Type Dialog */}
      <BookingTypeDialog
        isOpen={isBookingTypeDialogOpen}
        onClose={() => setIsBookingTypeDialogOpen(false)}
      />
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
