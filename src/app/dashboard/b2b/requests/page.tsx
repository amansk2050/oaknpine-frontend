'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  Home,
  MessageSquare,
  Sparkles,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useB2bRequests, useAcceptB2bRequest, useRejectB2bRequest } from '@/services/b2b';
import { useRoomsByHomestay } from '@/services/homestay';

export default function B2bBookingRequestsQueue() {
  const [sortBy, setSortBy] = useState<'checkInDate' | 'createdAt'>('checkInDate');
  const { data: requests = [], isLoading } = useB2bRequests(sortBy);
  const acceptMutation = useAcceptB2bRequest();
  const rejectMutation = useRejectB2bRequest();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestForAccept, setSelectedRequestForAccept] = useState<any | null>(null);
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<any | null>(null);

  // Rejection State
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtering
  const filteredRequests = requests.filter((r) =>
    r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.partner?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: selectedRequestForReject.id,
        rejectionReason,
      });
      toast.success('Booking request rejected successfully');
      setSelectedRequestForReject(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject request');
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link
            href="/dashboard/b2b"
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors text-sm font-medium w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partners
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-emerald-400 text-sm font-medium">Chronological Booking Requests Queue</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Partner Requests Queue</h1>
          <p className="text-slate-300 text-lg">
            Review, accept, and allocate rooms for pending bookings submitted by B2B partners.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label className="text-sm font-semibold text-slate-600">Sort Queue By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          >
            <option value="checkInDate">Chronological (Check-in Date)</option>
            <option value="createdAt">First-In First-Served (Request Date)</option>
          </select>
        </div>
      </div>

      {/* Queue Listing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-slate-500">Loading request queue...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Requests Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            You do not have any pending or submitted requests in the queue right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${
                req.status === 'pending'
                  ? 'border-l-4 border-l-amber-500'
                  : req.status === 'accepted'
                  ? 'border-l-4 border-l-emerald-500 bg-emerald-50/5'
                  : 'border-l-4 border-l-red-500 bg-red-50/5'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      B2B Partner & Booking Status
                    </div>
                    <div className="font-bold text-slate-900 text-lg">
                      {req.partner?.businessName || 'Unknown Partner'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold leading-none ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Recv: {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Guest & Stay Info
                    </div>
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <User className="w-4 h-4 text-slate-400" />
                      {req.guestName} ({req.numberOfGuests} guests)
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm mt-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(req.checkInDate).toLocaleDateString()} –{' '}
                      {new Date(req.checkOutDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Contact Details
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.guestPhone}</span>
                    </div>
                    {req.guestEmail && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.guestEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences & Message */}
                <div className="lg:w-80 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700">Preferences:</span>{' '}
                      {req.roomPreferences || 'None specified'}
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 border-t border-slate-200/60 pt-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700">Message:</span>{' '}
                      {req.message || 'None'}
                    </div>
                  </div>
                  {req.rejectionReason && (
                    <div className="text-red-600 border-t border-red-100 pt-1.5 font-medium">
                      Reason: {req.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                {req.status === 'pending' && (
                  <div className="flex lg:flex-col gap-2 justify-end self-center">
                    <button
                      onClick={() => setSelectedRequestForAccept(req)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => setSelectedRequestForReject(req)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {selectedRequestForReject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-100 bg-red-50/50">
              <h2 className="text-xl font-bold text-red-950 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Reject Booking Request
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Provide a reason for rejecting the booking request from {selectedRequestForReject.partner?.businessName}.
              </p>
            </div>

            <form onSubmit={handleReject}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Rejection Reason *
                  </label>
                  <textarea
                    required
                    placeholder="e.g. No availability for the requested room type on these dates."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequestForReject(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {rejectMutation.isPending && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept & Allocate Rooms Modal */}
      {selectedRequestForAccept && (
        <AcceptRequestModal
          request={selectedRequestForAccept}
          onClose={() => setSelectedRequestForAccept(null)}
          onConfirm={async (data) => {
            try {
              await acceptMutation.mutateAsync({
                id: selectedRequestForAccept.id,
                data,
              });
              toast.success('Request accepted and rooms booked! 🛌');
              setSelectedRequestForAccept(null);
            } catch (err: any) {
              toast.error(err.message || 'Failed to accept booking request');
            }
          }}
          isSubmitting={acceptMutation.isPending}
        />
      )}
    </div>
  );
}

// Inner Modal component to handle rooms query and local selection states safely
interface AcceptRequestModalProps {
  request: any;
  onClose: () => void;
  onConfirm: (data: any) => void;
  isSubmitting: boolean;
}

function AcceptRequestModal({ request, onClose, onConfirm, isSubmitting }: AcceptRequestModalProps) {
  const { data: rooms = [], isLoading: loadingRooms } = useRoomsByHomestay(request.homestayId);

  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [roomGuestCounts, setRoomGuestCounts] = useState<Record<string, number>>({});
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(12);

  const handleToggleRoom = (roomId: string, maxCapacity: number) => {
    if (selectedRoomIds.includes(roomId)) {
      setSelectedRoomIds(selectedRoomIds.filter((id) => id !== roomId));
      const updatedCounts = { ...roomGuestCounts };
      delete updatedCounts[roomId];
      setRoomGuestCounts(updatedCounts);
    } else {
      setSelectedRoomIds([...selectedRoomIds, roomId]);
      setRoomGuestCounts({
        ...roomGuestCounts,
        [roomId]: Math.min(request.numberOfGuests, maxCapacity),
      });
    }
  };

  const handleGuestCountChange = (roomId: string, count: number, maxCapacity: number) => {
    const validCount = Math.max(1, Math.min(count, maxCapacity));
    setRoomGuestCounts({
      ...roomGuestCounts,
      [roomId]: validCount,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoomIds.length === 0) {
      toast.error('Please select at least one room to allocate');
      return;
    }

    const allocatedRooms = selectedRoomIds.map((roomId) => ({
      roomId,
      numberOfGuests: roomGuestCounts[roomId] || 1,
    }));

    onConfirm({
      rooms: allocatedRooms,
      discountAmount: discountAmount || undefined,
      taxPercentage: taxPercentage || undefined,
    });
  };

  const totalAllocatedGuests = selectedRoomIds.reduce(
    (sum, roomId) => sum + (roomGuestCounts[roomId] || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-emerald-50/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Accept & Allocate Rooms
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Allocate rooms for {request.guestName} ({request.numberOfGuests} guests requested).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Requested Info Card */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs text-slate-600 grid grid-cols-2 gap-3">
            <div>
              <span className="font-semibold text-slate-700">Check-in:</span>{' '}
              {new Date(request.checkInDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Check-out:</span>{' '}
              {new Date(request.checkOutDate).toLocaleDateString()}
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-slate-700">Stay Preferences:</span>{' '}
              {request.roomPreferences || 'None'}
            </div>
          </div>

          {/* Rooms Allocation Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Select Rooms to Book *
            </label>

            {loadingRooms ? (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-4">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                Loading property rooms...
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-red-500 text-xs font-semibold py-2">
                No rooms found for this homestay. Please add rooms in the Homestays settings.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                {rooms.map((room) => {
                  const isChecked = selectedRoomIds.includes(room.id);
                  return (
                    <div
                      key={room.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-sm transition-all ${
                        isChecked
                          ? 'bg-emerald-50/30 border-emerald-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 py-1 select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRoom(room.id, room.capacity)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            Room {room.roomNumber} ({room.roomType})
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Max Capacity: {room.capacity} | ₹{room.pricePerHead}/head
                          </div>
                        </div>
                      </label>

                      {isChecked && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500">Guests:</span>
                          <input
                            type="number"
                            min="1"
                            max={room.capacity}
                            value={roomGuestCounts[room.id] || 1}
                            onChange={(e) =>
                              handleGuestCountChange(
                                room.id,
                                parseInt(e.target.value),
                                room.capacity
                              )
                            }
                            className="w-12 text-center py-1 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedRoomIds.length > 0 && (
              <div className="text-xs font-semibold mt-2 text-right">
                <span
                  className={
                    totalAllocatedGuests >= request.numberOfGuests
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }
                >
                  Allocated: {totalAllocatedGuests} of {request.numberOfGuests} guests
                </span>
              </div>
            )}
          </div>

          {/* Pricing Tweak Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Discount Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tax Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                placeholder="12"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedRoomIds.length === 0}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm & Create Booking
          </button>
        </div>
      </div>
    </div>
  );
}
