'use client';

import React from 'react';
import { Calendar, User, CreditCard, Home } from 'lucide-react';
import { useBookings } from '@/services';

export default function RecentActivity() {
  const { data: bookings, isLoading } = useBookings();

  // Get recent bookings (last 5)
  const recentBookings = bookings?.slice(0, 5) || [];

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { icon: Calendar, color: 'bg-blue-500' };
      case 'checked_in':
        return { icon: User, color: 'bg-purple-500' };
      case 'pending':
        return { icon: CreditCard, color: 'bg-orange-500' };
      default:
        return { icon: Home, color: 'bg-emerald-500' };
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60);
    
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-10 h-10 bg-slate-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentBookings.length > 0 ? (
          recentBookings.map((booking) => {
            const activity = getActivityIcon(booking.status);
            const Icon = activity.icon;
            
            return (
              <div key={booking.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${activity.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {booking.status === 'confirmed' && 'Booking Confirmed'}
                    {booking.status === 'checked_in' && 'Guest Checked In'}
                    {booking.status === 'pending' && 'New Booking'}
                  </p>
                  <p className="text-sm text-slate-600 truncate">
                    {booking.guestName} • {booking.homestay?.name}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {formatTimeAgo(booking.createdAt)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
        )}
      </div>
      <button className="w-full mt-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
        View All Activity
      </button>
    </div>
  );
}
