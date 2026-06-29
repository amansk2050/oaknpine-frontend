'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  Receipt,
  User,
  Building2,
  Sparkles,
  Zap,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import { useBookings, BookingStatus, PaymentMethod, PaymentType } from '@/services/room-booking';
import { usePackageBookings, PackageBookingStatus } from '@/services/package-booking';

// Helper function to safely format currency - handles string numbers properly
const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === null || value === undefined || value === '') return '₹0';
  
  // Handle string values that might have leading zeros or decimal issues
  let num: number;
  if (typeof value === 'string') {
    // Remove any leading zeros and parse
    num = parseFloat(value.replace(/^0+(?=\d)/, ''));
  } else {
    num = value;
  }
  
  if (isNaN(num)) return '₹0';
  
  // Format with Indian locale, no decimal places for whole numbers
  return `₹${num.toLocaleString('en-IN', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
};

// Helper function for compact currency display
const formatCompactCurrency = (value: number | string | undefined | null): string => {
  if (value === null || value === undefined || value === '') return '₹0';
  
  let num: number;
  if (typeof value === 'string') {
    num = parseFloat(value.replace(/^0+(?=\d)/, ''));
  } else {
    num = value;
  }
  
  if (isNaN(num)) return '₹0';
  
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)}Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  return formatCurrency(num);
};

export default function PaymentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'direct' | 'package' | 'pending'>('all');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');

  const { data: bookings, isLoading } = useBookings();
  const { data: packageBookings, isLoading: isPkgLoading } = usePackageBookings();

  const isPageLoading = isLoading || isPkgLoading;

  // Calculate statistics in memory to combine direct bookings and package bookings
  const directRevenue = bookings?.reduce((sum, b) => b.status !== BookingStatus.CANCELLED ? sum + (Number(b.totalAmount) || 0) : sum, 0) || 0;
  const directPaid = bookings?.reduce((sum, b) => b.status !== BookingStatus.CANCELLED ? sum + (Number(b.paidAmount) || 0) : sum, 0) || 0;
  const directPending = bookings?.reduce((sum, b) => b.status !== BookingStatus.CANCELLED ? sum + (Number(b.balanceAmount) || 0) : sum, 0) || 0;

  const pkgRevenue = packageBookings?.reduce((sum, pb) => pb.status !== PackageBookingStatus.CANCELLED ? sum + (Number(pb.totalAmount) || 0) : sum, 0) || 0;
  const pkgPaid = packageBookings?.reduce((sum, pb) => pb.status !== PackageBookingStatus.CANCELLED ? sum + (Number(pb.paidAmount) || 0) : sum, 0) || 0;
  const pkgPending = packageBookings?.reduce((sum, pb) => pb.status !== PackageBookingStatus.CANCELLED ? sum + (Number(pb.balanceAmount) || 0) : sum, 0) || 0;

  const totalRevenue = directRevenue + pkgRevenue;
  const totalPaid = directPaid + pkgPaid;
  const pendingAmount = directPending + pkgPending;

  // Get all payments from direct room bookings
  const directPayments = bookings?.flatMap(booking => 
    booking.payments.map(payment => ({
      ...payment,
      isPackage: false,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        homestay: booking.homestay,
        totalAmount: booking.totalAmount,
        balanceAmount: booking.balanceAmount,
        isPaymentComplete: booking.isPaymentComplete,
        leadId: booking.leadId,
        status: booking.status,
      }
    }))
  ) || [];

  // Get all payments from package bookings
  const pkgPayments = packageBookings?.flatMap(pb => 
    (pb.payments || []).map(payment => ({
      ...payment,
      isPackage: true,
      booking: {
        id: pb.id,
        bookingReference: pb.bookingReference,
        guestName: pb.guestName,
        guestPhone: pb.guestPhone,
        homestay: null,
        totalAmount: pb.totalAmount,
        balanceAmount: pb.balanceAmount,
        isPaymentComplete: pb.isPaymentComplete,
        leadId: pb.leadId,
        status: pb.status as any,
      }
    }))
  ) || [];

  const allPayments = [...directPayments, ...pkgPayments];

  // Get bookings with pending payments
  const roomBookingsPending = bookings?.filter(
    b => !b.isPaymentComplete && b.status !== BookingStatus.CANCELLED
  ).map(b => ({ ...b, isPackage: false })) || [];

  const packageBookingsPending = packageBookings?.filter(
    pb => !pb.isPaymentComplete && pb.status !== PackageBookingStatus.CANCELLED
  ).map(pb => ({ ...pb, isPackage: true })) || [];

  const bookingsWithPendingPayments = [...roomBookingsPending, ...packageBookingsPending]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

  // Filter payments
  const filteredPayments = allPayments.filter(payment => {
    // Tab filter
    if (paymentStatusFilter === 'direct' && payment.isPackage) return false;
    if (paymentStatusFilter === 'package' && !payment.isPackage) return false;

    const matchesSearch = 
      (payment.paymentReference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.booking?.bookingReference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.booking?.guestName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = !methodFilter || payment.paymentMethod === methodFilter;
    
    return matchesSearch && matchesMethod;
  }).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  // Calculate payment method breakdown
  const paymentMethodBreakdown = allPayments.reduce((acc, payment) => {
    const method = payment.paymentMethod;
    const amount = parseFloat(String(payment.amount).replace(/^0+(?=\d)/, '')) || 0;
    
    if (!acc[method]) {
      acc[method] = { count: 0, total: 0 };
    }
    acc[method].count += 1;
    acc[method].total += amount;
    return acc;
  }, {} as Record<PaymentMethod, { count: number; total: number }>);

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const icons: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: '💵',
      [PaymentMethod.UPI]: '📱',
      [PaymentMethod.CREDIT_CARD]: '💳',
      [PaymentMethod.DEBIT_CARD]: '💳',
      [PaymentMethod.BANK_TRANSFER]: '🏦',
      [PaymentMethod.ONLINE]: '🌐',
      [PaymentMethod.CHEQUE]: '📝',
      [PaymentMethod.OTHER]: '💰',
    };
    return icons[method] || '💰';
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'Cash',
      [PaymentMethod.UPI]: 'UPI',
      [PaymentMethod.CREDIT_CARD]: 'Credit Card',
      [PaymentMethod.DEBIT_CARD]: 'Debit Card',
      [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
      [PaymentMethod.ONLINE]: 'Online',
      [PaymentMethod.CHEQUE]: 'Cheque',
      [PaymentMethod.OTHER]: 'Other',
    };
    return labels[method] || method;
  };

  const getPaymentTypeColor = (type: PaymentType) => {
    const colors: Record<PaymentType, string> = {
      [PaymentType.ADVANCE]: 'bg-blue-100 text-blue-700 border-blue-200',
      [PaymentType.PARTIAL]: 'bg-purple-100 text-purple-700 border-purple-200',
      [PaymentType.FULL]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [PaymentType.REFUND]: 'bg-orange-100 text-orange-700 border-orange-200',
      [PaymentType.CANCELLATION_CHARGE]: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

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
              <span className="text-emerald-400 text-sm font-medium">Payment Center</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Payment Management 💰
            </h1>
            <p className="text-slate-300 text-lg">
              Track all payments, collections, and pending dues
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-emerald-300 text-sm">Collection Rate</p>
              <p className="text-3xl font-bold text-white">{collectionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900">{formatCompactCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Collected */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                {collectionRate.toFixed(0)}%
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Collected</p>
            <p className="text-3xl font-bold text-slate-900">{formatCompactCurrency(totalPaid)}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {bookingsWithPendingPayments.length} bookings
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Pending</p>
            <p className="text-3xl font-bold text-slate-900">{formatCompactCurrency(pendingAmount)}</p>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Transactions</p>
            <p className="text-3xl font-bold text-slate-900">{allPayments.length}</p>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {Object.keys(paymentMethodBreakdown).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Payment Methods Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(paymentMethodBreakdown).map(([method, data]) => (
              <div key={method} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 text-center hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{getPaymentMethodIcon(method as PaymentMethod)}</div>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(data.total)}</p>
                <p className="text-xs text-slate-500">{getPaymentMethodLabel(method as PaymentMethod)}</p>
                <p className="text-xs text-slate-400 mt-1">{data.count} txn{data.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by payment reference, booking, or guest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setPaymentStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  paymentStatusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Payments
              </button>
              <button
                onClick={() => setPaymentStatusFilter('direct')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  paymentStatusFilter === 'direct'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Direct Bookings
              </button>
              <button
                onClick={() => setPaymentStatusFilter('package')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  paymentStatusFilter === 'package'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Package Bookings
              </button>
              <button
                onClick={() => setPaymentStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  paymentStatusFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Dues
              </button>
            </div>

            {/* Method Filter */}
            {paymentStatusFilter !== 'pending' && (
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | '')}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="">All Methods</option>
                <option value={PaymentMethod.CASH}>Cash</option>
                <option value={PaymentMethod.UPI}>UPI</option>
                <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
                <option value={PaymentMethod.DEBIT_CARD}>Debit Card</option>
                <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                <option value={PaymentMethod.ONLINE}>Online</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isPageLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : paymentStatusFilter === 'pending' ? (
        /* Pending Payments View */
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-slate-900">Bookings with Pending Payments</h2>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {bookingsWithPendingPayments.length}
            </span>
          </div>
          
          {bookingsWithPendingPayments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bookingsWithPendingPayments.map((booking) => {
                const bookingTotal = parseFloat(String(booking.totalAmount).replace(/^0+(?=\d)/, '')) || 0;
                const bookingPaid = parseFloat(String(booking.paidAmount).replace(/^0+(?=\d)/, '')) || 0;
                const bookingBalance = parseFloat(String(booking.balanceAmount).replace(/^0+(?=\d)/, '')) || 0;
                const paidPercent = bookingTotal > 0 ? (bookingPaid / bookingTotal) * 100 : 0;
                
                return (
                  <div
                    key={booking.id}
                    onClick={() => router.push(booking.isPackage ? `/dashboard/bookings/package/${booking.id}` : `/dashboard/bookings/${booking.id}`)}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-slate-500">Booking Reference</p>
                        <p className="text-lg font-bold text-slate-900">{booking.bookingReference}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Balance Due</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrency(bookingBalance)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">{booking.guestName}</span>
                      </div>
                      {booking.isPackage ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-750 text-[10px] font-bold rounded-full">Package Booking</span>
                        </div>
                      ) : (booking as any).homestay ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{(booking as any).homestay.name}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(bookingTotal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Paid</p>
                        <p className="text-sm font-semibold text-emerald-600">{formatCurrency(bookingPaid)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">
                          {paidPercent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up! 🎉</h3>
              <p className="text-slate-600">No pending payments at the moment</p>
            </div>
          )}
        </div>
      ) : (
        /* All Payments View */
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900">
              {paymentStatusFilter === 'direct'
                ? 'Direct Booking Payments'
                : paymentStatusFilter === 'package'
                ? 'Package Booking Payments'
                : 'Payment History'}
            </h2>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              {filteredPayments.length}
            </span>
          </div>
          
          {filteredPayments.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Payment</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Booking</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Guest</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Method</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Type</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((payment) => {
                      const paymentAmount = parseFloat(String(payment.amount).replace(/^0+(?=\d)/, '')) || 0;
                      return (
                        <tr 
                          key={payment.id} 
                          onClick={() => router.push(payment.isPackage ? `/dashboard/bookings/package/${payment.booking.id}` : `/dashboard/bookings/${payment.booking.id}`)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center text-lg">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{payment.paymentReference}</p>
                                <p className="text-xs text-slate-500">{payment.status}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{payment.booking.bookingReference}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-700">{payment.booking.guestName}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-700">
                              {getPaymentMethodLabel(payment.paymentMethod)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentTypeColor(payment.paymentType)}`}>
                              {payment.paymentType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-700">
                              {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(paymentAmount)}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Payments Found</h3>
              <p className="text-slate-600">No payments match your search criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
