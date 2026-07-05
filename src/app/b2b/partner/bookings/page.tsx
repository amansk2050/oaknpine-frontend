'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  X,
  Calendar,
  Users,
  Building2,
  ChevronLeft,
  Send,
  Search,
  Filter,
  Handshake,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  usePartnerRequests,
  usePartnerMemberships,
  useSubmitPartnerRequest,
  B2bBookingRequest,
  B2bPartnerMembership,
  BookingTag,
} from '@/services/b2b';

const tagConfig: Record<BookingTag, { label: string; color: string; bg: string; dot: string; border: string }> = {
  [BookingTag.SOFT_BLOCK]: {
    label: 'Soft Block',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
  },
  [BookingTag.BLOCKED_UNPAID]: {
    label: 'Blocked (Unpaid)',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  [BookingTag.BLOCKED_PAID]: {
    label: 'Blocked (Paid)',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export default function PartnerBookingsPage() {
  const searchParams = useSearchParams();
  const defaultMembershipId = searchParams.get('membershipId') || '';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMembershipId, setFilterMembershipId] = useState(defaultMembershipId);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // New request form state
  const [selectedMembershipId, setSelectedMembershipId] = useState(defaultMembershipId);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [roomPreferences, setRoomPreferences] = useState('');
  const [message, setMessage] = useState('');
  const [homestayId, setHomestayId] = useState('');
  const [bookingTag, setBookingTag] = useState<BookingTag | ''>('');
  const [availableHomestays, setAvailableHomestays] = useState<any[]>([]);

  const { data: memberships = [], isLoading: membershipsLoading } = usePartnerMemberships();
  const { data: requests = [], isLoading: requestsLoading } = usePartnerRequests(
    filterMembershipId || undefined
  );
  const submitMutation = useSubmitPartnerRequest();

  // Load homestays when membership changes in form
  const handleMembershipChange = async (membershipId: string) => {
    setSelectedMembershipId(membershipId);
    setHomestayId('');
    setAvailableHomestays([]);
    if (!membershipId) return;

    try {
      const { b2bApi } = await import('@/services/b2b/queryFunction');
      const homestays = await b2bApi.getMembershipHomestays(membershipId);
      setAvailableHomestays(homestays);
    } catch {
      setAvailableHomestays([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembershipId || !guestName || !guestPhone || !checkInDate || !checkOutDate || !homestayId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        partnerMembershipId: selectedMembershipId,
        homestayId,
        guestName,
        guestEmail: guestEmail || undefined,
        guestPhone,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        roomPreferences: roomPreferences || undefined,
        message: message || undefined,
        bookingTag: bookingTag || undefined,
      });
      toast.success('Booking request submitted! 🎉');
      setIsModalOpen(false);
      // Reset form
      setGuestName(''); setGuestEmail(''); setGuestPhone('');
      setCheckInDate(''); setCheckOutDate('');
      setNumberOfGuests(2); setRoomPreferences(''); setMessage('');
      setHomestayId(''); setBookingTag('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.guestPhone || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getMembershipName = (id?: string) => {
    const m = memberships.find((m) => m.id === id);
    return m?.businessName || 'Unknown Business';
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 mb-6 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/b2b/partner/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white">Booking Requests</h1>
            <p className="text-slate-300 text-sm mt-1">Send and track booking requests to your partner businesses</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={memberships.length === 0}
            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by guest name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {/* Business Filter */}
          <select
            value={filterMembershipId}
            onChange={(e) => setFilterMembershipId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 bg-white"
          >
            <option value="">All Businesses</option>
            {memberships.map((m) => (
              <option key={m.id} value={m.id}>{m.businessName}</option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requestsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Handshake className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Requests Found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {memberships.length === 0
              ? 'Accept a business invitation first to start sending booking requests.'
              : 'No booking requests match your filters. Try creating a new one!'}
          </p>
          {memberships.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Booking Request
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Business */}
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-blue-600 truncate">
                      {getMembershipName(request.partnerMembershipId)}
                    </span>
                  </div>

                  {/* Guest */}
                  <p className="font-semibold text-slate-900">{request.guestName}</p>
                  <p className="text-sm text-slate-500">{request.guestPhone}</p>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(request.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      {' → '}
                      {new Date(request.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <Users className="w-3.5 h-3.5 ml-2" />
                    <span>{request.numberOfGuests} guests</span>
                  </div>

                  {request.message && (
                    <p className="text-xs text-slate-400 italic truncate">"{request.message}"</p>
                  )}
                </div>

                {/* Status + Tag */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>

                  {request.bookingTag && tagConfig[request.bookingTag] && (
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tagConfig[request.bookingTag].bg} ${tagConfig[request.bookingTag].border} ${tagConfig[request.bookingTag].color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tagConfig[request.bookingTag].dot}`} />
                      {tagConfig[request.bookingTag].label}
                    </span>
                  )}

                  <p className="text-xs text-slate-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Booking Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-500" />
                  New Booking Request
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Send a booking request to a partner business</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Select Business */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Select Business *
                  </label>
                  <select
                    required
                    value={selectedMembershipId}
                    onChange={(e) => handleMembershipChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                  >
                    <option value="">Choose a business...</option>
                    {memberships.map((m) => (
                      <option key={m.id} value={m.id}>{m.businessName}</option>
                    ))}
                  </select>
                </div>

                {/* Select Homestay */}
                {selectedMembershipId && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Select Property *
                      </label>
                      <select
                        required
                        value={homestayId}
                        onChange={(e) => setHomestayId(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                      >
                        <option value="">Choose a property...</option>
                        {availableHomestays.map((h) => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Booking Tag / Hold Type
                      </label>
                      <select
                        value={bookingTag}
                        onChange={(e) => setBookingTag(e.target.value as BookingTag)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                      >
                        <option value="">No Tag (Default)</option>
                        <option value={BookingTag.SOFT_BLOCK}>🟡 Soft Block</option>
                        <option value={BookingTag.BLOCKED_UNPAID}>🔵 Blocked (Unpaid)</option>
                        <option value={BookingTag.BLOCKED_PAID}>🟢 Blocked (Paid)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Guest Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Guest Name *</label>
                  <input
                    type="text" required placeholder="e.g. Priya Sharma"
                    value={guestName} onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                {/* Guest Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone *</label>
                    <input
                      type="tel" required placeholder="+91 98765 43210"
                      value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email" placeholder="guest@email.com"
                      value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Check-In *</label>
                    <input
                      type="date" required value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Check-Out *</label>
                    <input
                      type="date" required value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Guests *</label>
                  <input
                    type="number" required min={1} max={50}
                    value={numberOfGuests} onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                {/* Room Preferences */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Preferences</label>
                  <input
                    type="text" placeholder="e.g. Mountain view, ground floor preferred"
                    value={roomPreferences} onChange={(e) => setRoomPreferences(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                  <textarea
                    placeholder="Any special requests or notes..."
                    value={message} onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl transition-colors text-sm font-semibold flex items-center gap-1.5"
                >
                  {submitMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
