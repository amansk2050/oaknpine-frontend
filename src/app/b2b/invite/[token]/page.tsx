'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, Clock, CheckCircle, XCircle, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { usePublicInvitation } from '@/services/b2b';

export default function InvitationLandingPage() {
  const { token } = useParams<{ token: string }>();

  const { data: invitation, isLoading, error } = usePublicInvitation(token as string);

  const signupUrl = `/signup?inviteToken=${token}&email=${encodeURIComponent(invitation?.invitedEmail || '')}`;
  const loginUrl = `/login?inviteToken=${token}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
          <p className="text-slate-300">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-slate-400 mb-6">
            This invitation link is invalid, expired, or has already been used.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invitation Already Accepted</h1>
          <p className="text-slate-400 mb-6">
            This invitation has already been accepted. Please log in to access your partner dashboard.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(invitation.expiresAt);
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
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

        {/* Main Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">You&apos;re Invited!</h1>
            <p className="text-emerald-100 mt-1 text-sm">B2B Partner Invitation</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Invitation Details */}
            <div className="bg-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Invited by</p>
                  <p className="text-white font-semibold">{invitation.businessName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Invitation sent to</p>
                  <p className="text-white font-medium">{invitation.invitedEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Expires in</p>
                  <p className="text-white font-medium">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* What does this mean? */}
            <div>
              <h2 className="text-white font-semibold mb-2">What is this?</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                <strong className="text-white">{invitation.businessName}</strong> has invited you to become their 
                B2B partner on PineZone. As a partner, you can send booking requests directly to their 
                properties and track them through your own partner dashboard.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <p className="text-slate-400 text-sm font-medium text-center">Choose how to proceed:</p>

              <Link
                href={signupUrl}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Create a new account</p>
                    <p className="text-emerald-100 text-xs">New to PineZone? Start here</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={loginUrl}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all hover:scale-[1.01] group border border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-slate-300" />
                  <div className="text-left">
                    <p className="font-semibold">Sign in to existing account</p>
                    <p className="text-slate-400 text-xs">Already have a PineZone account?</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <p className="text-center text-xs text-slate-500">
              By accepting, you agree to be a B2B partner for {invitation.businessName} on PineZone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
