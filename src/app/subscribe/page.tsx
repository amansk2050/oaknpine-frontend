'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  Sparkles,
  Check,
  Building2,
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  ArrowRight,
  Handshake,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function SubscribePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const features = [
    {
      icon: Building2,
      title: 'Homestay & Property Listings',
      desc: 'Publish and manage rooms, rates, amenities, and multiple properties seamlessly.',
    },
    {
      icon: Calendar,
      title: 'Advanced Booking Management',
      desc: 'Accept B2B booking requests, handle walk-ins, block dates, and view calendar layouts.',
    },
    {
      icon: CreditCard,
      title: 'Payment & Expense Tracking',
      desc: 'Log transactions, handle advance/partial payments, check balances, and track overhead costs.',
    },
    {
      icon: Users,
      title: 'Leads & Travel Agent CRM',
      desc: 'Track guest leads, assign tasks to members, and manage your agent network.',
    },
    {
      icon: TrendingUp,
      title: 'Business Analytics & Reports',
      desc: 'Real-time revenue, occupancies, average daily rates (ADR), and growth graphs.',
    },
  ];

  const handleSubscribeClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowComingSoon(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* Background blobs for premium depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10 space-y-12">
        {/* Header Block */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            PineZone Premium
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Activate Your Business Portal
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Take complete control of your properties, bookings, agents, and financial transactions. Upgrading puts your travel business in high gear.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          
          {/* Partner Portal (Free) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700/50 transition-all text-left">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50/10 rounded-xl text-blue-405">
                  <Handshake className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold">B2B Partner Portal</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6">Standard agent access for sending booking requests to hosts.</p>
              
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Receive business invites</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Submit booking requests</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>View booking request status tags</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <span className="text-xl font-extrabold text-white">Free Portal</span>
              <p className="text-[10px] text-slate-500 mt-1">Included for travel partners & agents</p>
              <Link
                href="/b2b/partner/dashboard"
                className="mt-4 flex items-center justify-center gap-1.5 w-full py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                Go to Partner Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Business Portal (SaaS Subscription) */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-emerald-950/20 hover:border-emerald-500 transition-all text-left">
            <div className="absolute -top-3.5 left-6 px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
              Most Popular
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Business Portal</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6">Fully-featured CRM, homestay inventory, and payment engine for hosts.</p>
              
              <ul className="space-y-3.5 text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Manage properties & rooms</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Detailed direct & B2B booking logs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Advance payment & expense logs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Invite & manage B2B partners</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Financial reports & occupancy stats</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">₹4,999</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Upgrade organization workspace</p>
              
              <button
                onClick={handleSubscribeClick}
                disabled={loading}
                className="mt-4 flex items-center justify-center gap-1.5 w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Activate Business Portal'}
              </button>
            </div>
          </div>
        </div>

        {/* Coming soon dialog */}
        {showComingSoon && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h4 className="text-sm font-bold text-white mb-2">🚀 Subscription System Coming Soon!</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              We are currently integrating Stripe payment gateways. If you want to activate early access for your workspace now, please contact our administrator at{' '}
              <strong className="text-emerald-400 font-semibold">skaman.2050@gmail.com</strong> or{' '}
              <strong className="text-blue-400 font-semibold">amancodes.tech@gmail.com</strong>.
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="text-xs text-slate-500 hover:text-slate-300 font-medium underline"
            >
              Close message
            </button>
          </div>
        )}

        {/* Bottom links */}
        <div className="pt-6">
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Logged in as {session?.user?.email}. Sign out or switch account.
          </Link>
        </div>

      </div>
    </div>
  );
}
