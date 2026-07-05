'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle,
  Plus,
  Loader2,
  Send,
  TrendingUp,
  Handshake,
  ChevronRight,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { usePartnerDashboard } from '@/services/b2b';
import { BookingTag } from '@/services/b2b/types';

const tagConfig: Record<BookingTag, { label: string; color: string; bg: string; dot: string }> = {
  [BookingTag.SOFT_BLOCK]: {
    label: 'Soft Block',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
    dot: 'bg-yellow-400',
  },
  [BookingTag.BLOCKED_UNPAID]: {
    label: 'Blocked (Unpaid)',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
  },
  [BookingTag.BLOCKED_PAID]: {
    label: 'Blocked (Paid)',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export default function PartnerDashboardPage() {
  const { data: dashboard, isLoading, error } = usePartnerDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-slate-500">Loading partner dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Handshake className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Partner Account Found</h2>
          <p className="text-slate-500 mb-6">
            You don&apos;t have a B2B partner account yet. Accept an invitation from a business to get started.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
          >
            Go to Business Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalAcceptedRate =
    dashboard.totalRequestsAllTime > 0
      ? Math.round((dashboard.totalAccepted / dashboard.totalRequestsAllTime) * 100)
      : 0;

  return (
    <div className="min-h-screen pb-24 space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Handshake className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">B2B Partner Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Partner Dashboard</h1>
            <p className="text-slate-300">
              You are partnered with <strong className="text-blue-300">{dashboard.businessCount}</strong>{' '}
              {dashboard.businessCount === 1 ? 'business' : 'businesses'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/b2b/partner/bookings"
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              New Booking Request
            </Link>
            <Link
              href="/b2b/partner/bookings"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors font-medium flex items-center gap-2"
            >
              View All Requests
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{dashboard.businessCount}</p>
          <p className="text-sm text-slate-500 mt-0.5">Businesses</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl">
              <Send className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{dashboard.totalRequestsAllTime}</p>
          <p className="text-sm text-slate-500 mt-0.5">Total Requests</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{dashboard.totalAccepted}</p>
          <p className="text-sm text-slate-500 mt-0.5">Accepted</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalAcceptedRate}%</p>
          <p className="text-sm text-slate-500 mt-0.5">Acceptance Rate</p>
        </div>
      </div>

      {/* Businesses List */}
      {dashboard.memberships.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Handshake className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Businesses Yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Accept an invitation from a business to start sending booking requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dashboard.memberships.map(({ membership, totalRequests, pendingRequests, acceptedRequests, recentRequests }) => (
            <div key={membership.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
              {/* Business Header */}
              <div className="p-5 md:p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{membership.businessName}</h3>
                      {membership.partnerBusinessName && (
                        <p className="text-sm text-slate-500">Your business: {membership.partnerBusinessName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                      {membership.status}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xl font-bold text-slate-900">{totalRequests}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <p className="text-xl font-bold text-orange-600">{pendingRequests}</p>
                    <p className="text-xs text-slate-500">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-xl">
                    <p className="text-xl font-bold text-emerald-600">{acceptedRequests}</p>
                    <p className="text-xs text-slate-500">Accepted</p>
                  </div>
                </div>
              </div>

              {/* Recent Requests */}
              {recentRequests.length > 0 && (
                <div className="p-4 md:p-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Requests</h4>
                  <div className="space-y-2">
                    {recentRequests.map((req) => (
                      <div key={req.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{req.guestName}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(req.checkInDate).toLocaleDateString()} → {new Date(req.checkOutDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {req.bookingTag && tagConfig[req.bookingTag] && (
                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${tagConfig[req.bookingTag].bg} ${tagConfig[req.bookingTag].color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${tagConfig[req.bookingTag].dot}`} />
                              {tagConfig[req.bookingTag].label}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <Link
                  href={`/b2b/partner/bookings?membershipId=${membership.id}`}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all requests for {membership.businessName}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
