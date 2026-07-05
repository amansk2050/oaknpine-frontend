'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, CheckCircle, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useAcceptInvitation, usePublicInvitation } from '@/services/b2b';
import { toast } from 'sonner';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [partnerBusinessName, setPartnerBusinessName] = useState('');
  const [accepted, setAccepted] = useState(false);

  const { data: invitation, isLoading: inviteLoading, error: inviteError } = usePublicInvitation(token);
  const acceptMutation = useAcceptInvitation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace(`/login?inviteToken=${token}`);
    }
  }, [session, sessionPending, router, token]);

  if (sessionPending || inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
          <p className="text-slate-300">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (inviteError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invitation Not Found</h1>
          <p className="text-slate-400 mb-6">
            This invitation link is invalid or has expired. Please contact the business that invited you.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Aboard! 🎉</h1>
          <p className="text-slate-400 mb-2">
            You are now a B2B partner for
          </p>
          <p className="text-emerald-400 font-bold text-lg mb-6">{invitation.businessName}</p>
          <p className="text-slate-400 text-sm mb-8">
            You can now send booking requests directly to their properties from your partner dashboard.
          </p>
          <button
            onClick={() => router.push('/b2b/partner/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
          >
            Go to Partner Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleAccept = async () => {
    if (!token) return;
    try {
      await acceptMutation.mutateAsync({
        token,
        data: { partnerBusinessName: partnerBusinessName.trim() || undefined },
      });
      setAccepted(true);
      toast.success(`You are now a B2B partner for ${invitation.businessName}! 🎉`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invitation');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 text-white">
              <path d="M16 3L6 14h5l-5 8h7v7h6v-7h7l-5-8h5L16 3z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-emerald-400">Pine</span>
            <span className="text-white">Zone</span>
          </span>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <p className="text-emerald-100 text-sm mb-1">Accept Partnership with</p>
            <h1 className="text-2xl font-bold text-white">{invitation.businessName}</h1>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-slate-300 text-sm leading-relaxed">
              You're logged in as <strong className="text-white">{session?.user?.email}</strong>. 
              Accept this invitation to become a B2B partner and start sending booking requests to{' '}
              <strong className="text-emerald-400">{invitation.businessName}</strong>.
            </p>

            {/* Optional: Partner business name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Your Business Name <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sunshine Travels Pvt Ltd"
                value={partnerBusinessName}
                onChange={(e) => setPartnerBusinessName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                This helps {invitation.businessName} identify your company.
              </p>
            </div>

            {/* Accept Button */}
            <button
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all hover:scale-[1.01]"
            >
              {acceptMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Accept Partnership</>
              )}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl font-medium transition-colors text-sm"
            >
              Decline & Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
