'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Building2, Package, ArrowRight, Sparkles } from 'lucide-react';

interface BookingTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingTypeDialog({ isOpen, onClose }: BookingTypeDialogProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRoomBooking = () => {
    onClose();
    router.push('/dashboard/bookings/create');
  };

  const handlePackageBooking = () => {
    onClose();
    router.push('/dashboard/bookings/package/create');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-blue-900 p-6">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-emerald-400 text-sm font-medium">New Reservation</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Select Booking Type</h2>
              <p className="text-slate-300 text-sm mt-1">Choose the type of booking you want to create</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Room Booking Option */}
          <button
            onClick={handleRoomBooking}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-6 transition-all duration-300 text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Room Booking</h3>
                <p className="text-sm text-slate-600">
                  Book individual rooms at a homestay for specific dates
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    🏠 Homestay
                  </span>
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                    🛏️ Per Night
                  </span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Package Booking Option */}
          <button
            onClick={handlePackageBooking}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-6 transition-all duration-300 text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Package Booking</h3>
                <p className="text-sm text-slate-600">
                  Book a complete tour package with optional homestay
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    📦 All Inclusive
                  </span>
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                    🏔️ Tours & Activities
                  </span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-purple-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
