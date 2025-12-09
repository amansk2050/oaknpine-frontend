'use client';

import React from 'react';
import { Calendar, User, Phone, Mail, MapPin, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { Booking, BookingStatus } from '@/services/room-booking';

interface BookingCardProps {
  booking: Booking;
  onView: (id: string) => void;
}

export default function BookingCard({ booking, onView }: BookingCardProps) {
  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      [BookingStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      [BookingStatus.CONFIRMED]: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
      [BookingStatus.CHECKED_IN]: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: User },
      [BookingStatus.CHECKED_OUT]: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle },
      [BookingStatus.CANCELLED]: { color: 'bg-red-100 text-red-700 border-red-200', icon: Clock },
      [BookingStatus.NO_SHOW]: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
    };
    return configs[status] || configs[BookingStatus.PENDING];
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const isActive = booking.status === BookingStatus.CHECKED_IN;

  return (
    <div
      onClick={() => onView(booking.id)}
      className="bg-white rounded-xl border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      {/* Header with Status */}
      <div className={`relative h-24 bg-gradient-to-r ${isActive ? 'from-emerald-500 to-emerald-600' : 'from-slate-100 to-slate-200'}`}>
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <div>
            <p className={`text-xs ${isActive ? 'text-emerald-100' : 'text-slate-500'} mb-1`}>Booking Reference</p>
            <p className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
              {booking.bookingReference}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full border font-medium text-xs ${statusConfig.color} flex items-center gap-1`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {booking.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Guest Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-900">{booking.guestName}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <Phone className="w-3.5 h-3.5" />
            <span>{booking.guestPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{booking.guestEmail}</span>
          </div>
        </div>

        {/* Homestay & Dates */}
        <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg">
          {booking.homestay && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-slate-700">{booking.homestay.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600">
              {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-medium">
              {booking.numberOfNights}N
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>{booking.numberOfAdults} Adults</span>
            {booking.numberOfChildren > 0 && <span>{booking.numberOfChildren} Children</span>}
            <span>{booking.totalRooms} Rooms</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Amount</p>
            <p className="text-lg font-bold text-slate-900">₹{booking.totalAmount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Balance</p>
            <p className={`text-lg font-bold ${booking.isPaymentComplete ? 'text-emerald-600' : 'text-orange-600'}`}>
              ₹{booking.balanceAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment Status Badge */}
        <div className="mt-3">
          {booking.isPaymentComplete ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="font-medium">Payment Complete</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
              <CreditCard className="w-3.5 h-3.5" />
              <span className="font-medium">₹{booking.paidAmount.toLocaleString()} Paid</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
