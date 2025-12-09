/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Users,
  Building2,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLeads, LeadStatus } from '@/services/lead';
import { useHomestays, useAvailableRooms, Room } from '@/services/homestay';
import { useCreateBooking, CreateBookingDto, BookingRoomDto } from '@/services/room-booking';

interface SelectedRoom {
  roomId: string;
  room: Room;
  numberOfGuests: number;
}

function CreateBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get('leadId');

  const [selectedLeadId, setSelectedLeadId] = useState(leadIdParam || '');
  const [selectedHomestayId, setSelectedHomestayId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [notes, setNotes] = useState('');

  const { data: leads } = useLeads({ status: LeadStatus.QUALIFIED });
  const { data: homestays } = useHomestays();
  const { data: availableRooms } = useAvailableRooms(selectedHomestayId);
  const createBookingMutation = useCreateBooking();

  const qualifiedLeads = leads?.filter(l => 
    l.status === LeadStatus.QUALIFIED || 
    l.status === LeadStatus.PROPOSAL_SENT || 
    l.status === LeadStatus.NEGOTIATION
  );

  const selectedLead = qualifiedLeads?.find(l => l.id === selectedLeadId);

  // Use useCallback to memoize calculatePrices
  const calculatePrices = useCallback(() => {
    if (!checkInDate || !checkOutDate || selectedRooms.length === 0) {
      return { subtotal: 0, discount: 0, total: 0, nights: 0 };
    }

    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    let subtotal = 0;
    selectedRooms.forEach(sr => {
      subtotal += sr.room.pricePerHead * sr.numberOfGuests * nights;
    });

    const total = subtotal - discountAmount;

    return { subtotal, discount: discountAmount, total, nights };
  }, [checkInDate, checkOutDate, selectedRooms, discountAmount]);

  // Auto-fill dates from lead
  useEffect(() => {
    if (selectedLead) {
      if (selectedLead.checkInDate) {
        setCheckInDate(new Date(selectedLead.checkInDate).toISOString().split('T')[0]);
      }
      if (selectedLead.checkOutDate) {
        setCheckOutDate(new Date(selectedLead.checkOutDate).toISOString().split('T')[0]);
      }
      if (selectedLead.interestedHomestayId) {
        setSelectedHomestayId(selectedLead.interestedHomestayId);
      }
    }
  }, [selectedLead]);

  const prices = calculatePrices();

  const addRoom = (room: Room) => {
    if (selectedRooms.find(sr => sr.roomId === room.id)) return;
    setSelectedRooms([...selectedRooms, { roomId: room.id, room, numberOfGuests: 1 }]);
  };

  const removeRoom = (roomId: string) => {
    setSelectedRooms(selectedRooms.filter(sr => sr.roomId !== roomId));
  };

  const updateGuestCount = (roomId: string, delta: number) => {
    setSelectedRooms(selectedRooms.map(sr => {
      if (sr.roomId === roomId) {
        const newCount = Math.max(1, Math.min(sr.room.capacity, sr.numberOfGuests + delta));
        return { ...sr, numberOfGuests: newCount };
      }
      return sr;
    }));
  };

  const handleSubmit = async () => {
    if (!selectedLeadId || !selectedHomestayId || !checkInDate || !checkOutDate || selectedRooms.length === 0) {
      return;
    }

    const rooms: BookingRoomDto[] = selectedRooms.map(sr => ({
      roomId: sr.roomId,
      numberOfGuests: sr.numberOfGuests,
    }));

    const bookingData: CreateBookingDto = {
      leadId: selectedLeadId,
      homestayId: selectedHomestayId,
      checkInDate,
      checkOutDate,
      rooms,
      discountAmount,
      specialRequests,
      notes,
    };

    try {
      const booking = await createBookingMutation.mutateAsync(bookingData);
      router.push(`/dashboard/bookings/${booking.id}`);
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const isFormValid = selectedLeadId && selectedHomestayId && checkInDate && checkOutDate && selectedRooms.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-blue-900 rounded-2xl p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-emerald-400 text-sm font-medium">New Reservation</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Create Booking ✨</h1>
          <p className="text-slate-300 text-lg">Convert a qualified lead into a confirmed reservation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Select Lead */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select Lead</h3>
            </div>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Choose a qualified lead...</option>
              {qualifiedLeads?.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} - {lead.phone} ({lead.status})
                </option>
              ))}
            </select>
            {selectedLead && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{selectedLead.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">{selectedLead.phone}</p>
                  </div>
                  {selectedLead.numberOfAdults && (
                    <div>
                      <p className="text-slate-500">Guests</p>
                      <p className="font-medium text-slate-900">
                        {selectedLead.numberOfAdults} Adults, {selectedLead.numberOfChildren || 0} Children
                      </p>
                    </div>
                  )}
                  {selectedLead.budget && (
                    <div>
                      <p className="text-slate-500">Budget</p>
                      <p className="font-medium text-emerald-600">₹{selectedLead.budget.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Select Homestay */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select Homestay</h3>
            </div>
            <select
              value={selectedHomestayId}
              onChange={(e) => {
                setSelectedHomestayId(e.target.value);
                setSelectedRooms([]);
              }}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Choose a homestay...</option>
              {homestays?.map(homestay => (
                <option key={homestay.id} value={homestay.id}>
                  {homestay.name} - {homestay.city}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Stay Dates</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Check-out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            {prices.nights > 0 && (
              <p className="mt-3 text-sm text-emerald-600 font-medium">
                {prices.nights} night(s) selected
              </p>
            )}
          </div>

          {/* Room Selection */}
          {selectedHomestayId && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Select Rooms</h3>
                </div>
                <span className="text-sm text-slate-500">{availableRooms?.length || 0} available</span>
              </div>

              {/* Selected Rooms */}
              {selectedRooms.length > 0 && (
                <div className="mb-6 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Selected Rooms:</p>
                  {selectedRooms.map(sr => (
                    <div key={sr.roomId} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div>
                        <p className="font-semibold text-slate-900">{sr.room.roomName}</p>
                        <p className="text-xs text-slate-600">Room {sr.room.roomNumber} • ₹{sr.room.pricePerHead}/head/night</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateGuestCount(sr.roomId, -1)}
                            className="p-1 bg-white rounded-lg border border-slate-200 hover:bg-slate-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{sr.numberOfGuests}</span>
                          <button
                            onClick={() => updateGuestCount(sr.roomId, 1)}
                            className="p-1 bg-white rounded-lg border border-slate-200 hover:bg-slate-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeRoom(sr.roomId)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableRooms?.filter(r => !selectedRooms.find(sr => sr.roomId === r.id)).map(room => (
                  <div
                    key={room.id}
                    onClick={() => addRoom(room)}
                    className="p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{room.roomName}</p>
                        <p className="text-xs text-slate-500">Room {room.roomNumber} • {room.roomType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">₹{room.pricePerHead}</p>
                        <p className="text-xs text-slate-500">per head/night</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                      <Users className="w-3 h-3" />
                      Max {room.capacity} guests
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Special Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Any special requirements from guest..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Notes for internal reference..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Booking Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Rooms</span>
                <span className="font-medium text-slate-900">{selectedRooms.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Nights</span>
                <span className="font-medium text-slate-900">{prices.nights}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Guests</span>
                <span className="font-medium text-slate-900">
                  {selectedRooms.reduce((sum, sr) => sum + sr.numberOfGuests, 0)}
                </span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">₹{prices.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Discount</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">₹</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-right text-sm"
                  />
                </div>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-bold text-emerald-600">₹{prices.total.toLocaleString()}</span>
              </div>
            </div>

            {!isFormValid && (
              <div className="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">Please fill all required fields to create booking</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || createBookingMutation.isPending}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createBookingMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Create Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <CreateBookingContent />
    </Suspense>
  );
}
