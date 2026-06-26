'use client';

import React, { useState } from 'react';
import { usePublicPortal, useSubmitPublicRequest } from '@/services/b2b';
import {
  Briefcase,
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  Home,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function B2bPublicPortalPage({ params }: { params: { slug: string } }) {
  const { data, isLoading, error } = usePublicPortal(params.slug);
  const submitRequestMutation = useSubmitPublicRequest();

  // Form State
  const [homestayId, setHomestayId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [roomPreferences, setRoomPreferences] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homestayId || !guestName || !guestPhone || !checkInDate || !checkOutDate || !numberOfGuests) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      await submitRequestMutation.mutateAsync({
        slug: params.slug,
        data: {
          homestayId,
          guestName,
          guestEmail: guestEmail || undefined,
          guestPhone,
          checkInDate,
          checkOutDate,
          numberOfGuests,
          roomPreferences: roomPreferences || undefined,
          message: message || undefined,
        },
      });

      setIsSubmitted(true);
      toast.success('Booking request submitted successfully! 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit booking request');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <p className="text-slate-400 font-medium">Loading partner portal...</p>
      </div>
    );
  }

  if (error || !data || !data.partner) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Portal Unavailable</h2>
          <p className="text-slate-400 mb-6">
            This B2B Partner Portal link is either invalid, suspended, or does not exist. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  const { partner, homestays = [] } = data;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-bounce" />
          <h2 className="text-3xl font-extrabold text-white mb-3">Request Submitted!</h2>
          <p className="text-slate-300 text-lg mb-6">
            Thank you, <span className="text-emerald-400 font-semibold">{partner.contactPerson}</span>.
            We have received the booking request for <span className="font-semibold text-white">{guestName}</span>.
          </p>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 text-left text-sm text-slate-300 space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Guest:</span>
              <span className="font-semibold text-white">{guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Check-in:</span>
              <span className="font-semibold text-white">{new Date(checkInDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Check-out:</span>
              <span className="font-semibold text-white">{new Date(checkOutDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Guests:</span>
              <span className="font-semibold text-white">{numberOfGuests}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setHomestayId('');
              setGuestName('');
              setGuestEmail('');
              setGuestPhone('');
              setCheckInDate('');
              setCheckOutDate('');
              setNumberOfGuests(1);
              setRoomPreferences('');
              setMessage('');
            }}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <div className="inline-flex p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 mb-4">
          <Briefcase className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {partner.businessName} Portal
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Partner Portal — Managed by PineZone Travel CRM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-3xl sm:px-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-200 font-semibold text-lg">New Booking Request Form</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Homestay Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                Select Homestay Property *
              </label>
              <select
                required
                value={homestayId}
                onChange={(e) => setHomestayId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">-- Choose Homestay --</option>
                {homestays.map((hs: any) => (
                  <option key={hs.id} value={hs.id}>
                    {hs.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Guest details */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guest Information</h3>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Primary Guest Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Guest Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Guest Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Stay details */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stay & Occupancy</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Total Number of Guests *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Room Preferences & Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                Room/Stay Preferences (Optional)
              </label>
              <textarea
                placeholder="e.g. Balcony preferred, mountain view room, extra mattress required..."
                value={roomPreferences}
                onChange={(e) => setRoomPreferences(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Message / Notes (Optional)
              </label>
              <textarea
                placeholder="e.g. VIP client, check-in expected around 2 PM..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitRequestMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitRequestMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              )}
              Submit Booking Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
