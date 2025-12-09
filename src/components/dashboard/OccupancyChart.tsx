/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { BookingStatistics } from '@/services/room-booking';

interface OccupancyChartProps {
  bookingStats?: BookingStatistics;
}

export default function OccupancyChart({ bookingStats }: OccupancyChartProps) {
  // Parse values from API (they come as strings)
  const totalRevenue = parseFloat(String(bookingStats?.totalRevenue || 0));
  const totalPaid = parseFloat(String(bookingStats?.totalPaid || 0));
  const pendingAmount = parseFloat(String(bookingStats?.pendingAmount || 0));

  // Calculate percentages
  const paidPercentage = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

  // Format amount with Indian notation
  const formatAmount = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Booking Overview</h2>
          <p className="text-sm text-slate-600">Revenue and payment status</p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-600 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-700">{formatAmount(totalRevenue)}</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-600 mb-1">Amount Paid</p>
          <p className="text-xl font-bold text-blue-700">{formatAmount(totalPaid)}</p>
        </div>
        <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
          <p className="text-xs text-orange-600 mb-1">Pending Amount</p>
          <p className="text-xl font-bold text-orange-700">{formatAmount(pendingAmount)}</p>
        </div>
      </div>

      {/* Payment Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Payment Collection</span>
          <span className="font-medium text-slate-900">{paidPercentage.toFixed(1)}% collected</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${paidPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
