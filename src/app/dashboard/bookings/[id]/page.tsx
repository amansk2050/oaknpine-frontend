'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Download,
  Users as UsersIcon,
  Building2,
  Receipt,
  Sparkles,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  Home,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import {
  useBooking,
  useUpdateBookingStatus,
  useCheckIn,
  useCheckOut,
  useAddPayment,
  usePaymentsByBooking,
  BookingStatus,
  PaymentMethod,
  PaymentType,
  CreatePaymentDto,
} from '@/services/room-booking';

// Helper function to safely format currency
const formatCurrency = (value: number | string | undefined | null): string => {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePaymentDto>({
    amount: 0,
    paymentMethod: PaymentMethod.CASH,
    paymentType: PaymentType.PARTIAL,
  });

  const { data: booking, isLoading } = useBooking(params.id);
  const { data: payments } = usePaymentsByBooking(params.id);
  const updateStatusMutation = useUpdateBookingStatus();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const addPaymentMutation = useAddPayment();

  const handleStatusChange = async (newStatus: BookingStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: params.id,
        data: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync({
        id: params.id,
        data: { actualCheckInTime: new Date().toISOString() },
      });
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync({
        id: params.id,
        data: { actualCheckOutTime: new Date().toISOString() },
      });
    } catch (error) {
      console.error('Failed to check out:', error);
    }
  };

  const handleAddPayment = async () => {
    try {
      await addPaymentMutation.mutateAsync({
        bookingId: params.id,
        data: paymentData,
      });
      setIsPaymentModalOpen(false);
      setPaymentData({
        amount: 0,
        paymentMethod: PaymentMethod.CASH,
        paymentType: PaymentType.PARTIAL,
      });
    } catch (error) {
      console.error('Failed to add payment:', error);
    }
  };

  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      [BookingStatus.PENDING]: { gradient: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: '⏳ Pending', emoji: '⏳' },
      [BookingStatus.CONFIRMED]: { gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle, label: '✅ Confirmed', emoji: '✅' },
      [BookingStatus.CHECKED_IN]: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: UsersIcon, label: '🏨 Checked In', emoji: '🏨' },
      [BookingStatus.CHECKED_OUT]: { gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: CheckCircle, label: '👋 Checked Out', emoji: '👋' },
      [BookingStatus.CANCELLED]: { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: '❌ Cancelled', emoji: '❌' },
      [BookingStatus.NO_SHOW]: { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: XCircle, label: '🚫 No Show', emoji: '🚫' },
    };
    return configs[status] || configs[BookingStatus.PENDING];
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const icons: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: '💵',
      [PaymentMethod.UPI]: '📱',
      [PaymentMethod.CREDIT_CARD]: '💳',
      [PaymentMethod.DEBIT_CARD]: '💳',
      [PaymentMethod.BANK_TRANSFER]: '🏦',
      [PaymentMethod.ONLINE]: '🌐',
      [PaymentMethod.CHEQUE]: '📝',
      [PaymentMethod.OTHER]: '💰',
    };
    return icons[method] || '💰';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  
  // Safely parse numeric values
  const totalAmount = parseFloat(String(booking.totalAmount)) || 0;
  const paidAmount = parseFloat(String(booking.paidAmount)) || 0;
  const balanceAmount = parseFloat(String(booking.balanceAmount)) || 0;
  const discountAmount = parseFloat(String(booking.discountAmount)) || 0;
  const taxAmount = parseFloat(String(booking.taxAmount)) || 0;
  const roomCharges = totalAmount - taxAmount + discountAmount;
  
  const paidPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${statusConfig.gradient} rounded-2xl p-8`}>
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                  <StatusIcon className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 text-white text-sm font-bold rounded-full backdrop-blur-sm">
                  {statusConfig.label}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{booking.bookingReference}</h1>
              <p className="text-white/80 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                {booking.homestay?.name || 'Homestay'} • {booking.numberOfNights} Nights
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-white/80 text-sm">Total Amount</p>
                <p className="text-4xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                <p className="text-white/80 text-sm mt-1">
                  {paidPercentage.toFixed(0)}% Collected
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {booking.status === BookingStatus.CONFIRMED && (
              <button
                onClick={handleCheckIn}
                className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ArrowDownRight className="w-5 h-5" />
                Check In Guest
              </button>
            )}
            {booking.status === BookingStatus.CHECKED_IN && (
              <button
                onClick={handleCheckOut}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ArrowUpRight className="w-5 h-5" />
                Check Out Guest
              </button>
            )}
            {!booking.isPaymentComplete && booking.status !== BookingStatus.CANCELLED && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <CreditCard className="w-5 h-5" />
                Add Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Guest Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Guest Name</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.guestName}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Phone</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.guestPhone}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 hover:shadow-md transition-all md:col-span-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Email</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.guestEmail}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-orange-600 font-medium">Guests</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.numberOfAdults} Adults, {booking.numberOfChildren} Children
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-xl border border-pink-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-pink-600" />
                  <div>
                    <p className="text-xs text-pink-600 font-medium">Rooms Booked</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.totalRooms} Rooms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Stay Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">Check-in</p>
                </div>
                <p className="text-2xl font-bold text-emerald-800">
                  {checkInDate.toLocaleDateString('en-US', { day: 'numeric' })}
                </p>
                <p className="text-sm text-emerald-600">
                  {checkInDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-emerald-500 mt-1">
                  {checkInDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">Check-out</p>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {checkOutDate.toLocaleDateString('en-US', { day: 'numeric' })}
                </p>
                <p className="text-sm text-blue-600">
                  {checkOutDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {checkOutDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-medium text-purple-700">Duration</p>
                </div>
                <p className="text-2xl font-bold text-purple-800">{booking.numberOfNights}</p>
                <p className="text-sm text-purple-600">Nights</p>
              </div>
            </div>

            {booking.homestay && (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{booking.homestay.name}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.homestay.city}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rooms Booked */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Rooms Booked</h3>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                {booking.rooms.length}
              </span>
            </div>
            <div className="space-y-3">
              {booking.rooms.map((bookingRoom) => {
                const roomTotal = parseFloat(String(bookingRoom.totalAmount)) || 0;
                const ratePerNight = parseFloat(String(bookingRoom.ratePerNight)) || 0;
                return (
                  <div key={bookingRoom.id} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                          <span className="text-lg font-bold">{bookingRoom.room?.roomNumber || 'N/A'}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{bookingRoom.room?.roomName}</p>
                          <p className="text-xs text-slate-600">
                            {bookingRoom.room?.roomType === 'view' ? '🏔️ View Room' : '🏠 Non-View Room'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {bookingRoom.numberOfGuests} guests • {formatCurrency(ratePerNight)}/night
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(roomTotal)}</p>
                        <p className="text-xs text-slate-500">{booking.numberOfNights} nights</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Payment History</h3>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  {payments?.length || 0}
                </span>
              </div>
              {!booking.isPaymentComplete && booking.status !== BookingStatus.CANCELLED && (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Payment
                </button>
              )}
            </div>
            
            {payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => {
                  const paymentAmount = parseFloat(String(payment.amount)) || 0;
                  return (
                    <div key={payment.id} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center text-2xl">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{payment.paymentReference}</p>
                            <p className="text-xs text-slate-600">
                              {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {payment.paymentType.replace('_', ' ')}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(paymentAmount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-slate-500">No payments recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-2xl border-2 border-emerald-200 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Payment Summary</h3>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-sm text-slate-600">Room Charges</span>
                <span className="font-semibold text-slate-900">{formatCurrency(roomCharges)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-sm text-orange-700">Discount</span>
                  <span className="font-semibold text-orange-600">- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              {taxAmount > 0 && (
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-600">Tax</span>
                  <span className="font-semibold text-slate-900">+ {formatCurrency(taxAmount)}</span>
                </div>
              )}
              
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-700">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${paidPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-2 text-center">{paidPercentage.toFixed(1)}% Collected</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-600 mb-1">Paid</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(paidAmount)}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <p className="text-xs text-orange-600 mb-1">Balance</p>
                  <p className="text-lg font-bold text-orange-700">{formatCurrency(balanceAmount)}</p>
                </div>
              </div>
            </div>

            {booking.isPaymentComplete ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">Fully Paid</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 p-3 bg-orange-100 text-orange-700 rounded-xl border border-orange-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold">Payment Pending</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            </div>
            <select
              value={booking.status}
              onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
            >
              <option value={BookingStatus.PENDING}>⏳ Pending</option>
              <option value={BookingStatus.CONFIRMED}>✅ Confirmed</option>
              <option value={BookingStatus.CHECKED_IN}>🏨 Checked In</option>
              <option value={BookingStatus.CHECKED_OUT}>👋 Checked Out</option>
              <option value={BookingStatus.CANCELLED}>❌ Cancelled</option>
              <option value={BookingStatus.NO_SHOW}>🚫 No Show</option>
            </select>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📝</span>
                <h3 className="text-sm font-bold text-yellow-900">Special Requests</h3>
              </div>
              <p className="text-sm text-yellow-800">{booking.specialRequests}</p>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💡</span>
                <h3 className="text-sm font-bold text-blue-900">Internal Notes</h3>
              </div>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Add Payment</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={balanceAmount}
                    value={paymentData.amount || ''}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Balance: {formatCurrency(balanceAmount)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method *</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value={PaymentMethod.CASH}>💵 Cash</option>
                  <option value={PaymentMethod.UPI}>📱 UPI</option>
                  <option value={PaymentMethod.CREDIT_CARD}>💳 Credit Card</option>
                  <option value={PaymentMethod.DEBIT_CARD}>💳 Debit Card</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>🏦 Bank Transfer</option>
                  <option value={PaymentMethod.ONLINE}>🌐 Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Type *</label>
                <select
                  value={paymentData.paymentType}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value as PaymentType })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value={PaymentType.ADVANCE}>Advance</option>
                  <option value={PaymentType.PARTIAL}>Partial</option>
                  <option value={PaymentType.FULL}>Full Payment</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                disabled={!paymentData.amount || paymentData.amount > balanceAmount || paymentData.amount <= 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
