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
  Trash2,
  TrendingUp,
  TrendingDown,
  PiggyBank,
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
  CreateBookingDto, // change CreatePaymentDto import
  CreatePaymentDto,
} from '@/services/room-booking';
import {
  useExpensesByBooking,
  useCreateExpense,
  useDeleteExpense,
} from '@/services/expense';

// Helper function to safely format currency
const formatCurrency = (value: number | string | undefined | null): string => {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const getCategoryConfig = (category: string) => {
  const configs: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
    stay: { label: 'Stay', emoji: '🏨', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    food: { label: 'Food', emoji: '🍽️', bg: 'bg-amber-50', text: 'text-amber-700' },
    vehicle: { label: 'Vehicle', emoji: '🚗', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    guide: { label: 'Guide', emoji: '🧑‍🌾', bg: 'bg-sky-50', text: 'text-sky-700' },
    tickets: { label: 'Tickets', emoji: '🎟️', bg: 'bg-rose-50', text: 'text-rose-700' },
    other: { label: 'Other', emoji: '📦', bg: 'bg-slate-50', text: 'text-slate-700' },
  };
  return configs[category.toLowerCase()] || { label: category, emoji: '💰', bg: 'bg-slate-50', text: 'text-slate-700' };
};

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePaymentDto>({
    amount: 0,
    paymentMethod: PaymentMethod.CASH,
    paymentType: PaymentType.PARTIAL,
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({
    category: 'stay',
    title: '',
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
  });

  const { data: booking, isLoading } = useBooking(params.id);
  const { data: payments } = usePaymentsByBooking(params.id);
  const { data: expenses } = useExpensesByBooking(params.id);
  
  const updateStatusMutation = useUpdateBookingStatus();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const addPaymentMutation = useAddPayment();
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const handleAddExpense = async () => {
    try {
      await createExpenseMutation.mutateAsync({
        ...expenseData,
        bookingId: params.id,
      });
      setIsExpenseModalOpen(false);
      setExpenseData({
        category: 'stay',
        title: '',
        description: '',
        amount: 0,
        expenseDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpenseMutation.mutateAsync({
          id: expenseId,
          bookingId: params.id,
        });
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

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

  const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(String(exp.amount)), 0) || 0;
  const netProfit = totalAmount - totalExpenses;
  const profitMargin = totalAmount > 0 ? (netProfit / totalAmount) * 100 : 0;

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

          {/* Expense Tracker Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Expense Tracker</h3>
                <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                  {expenses?.length || 0}
                </span>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-rose-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>

            {/* Profitability Micro-Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Booking Revenue</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-xs text-rose-600 font-semibold">Total Expenses</p>
                <p className="text-xl font-bold text-rose-700">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className={`p-4 rounded-xl border ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <p className={`text-xs font-semibold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Net Profit</p>
                <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(netProfit)}</p>
                <p className={`text-xs mt-0.5 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{profitMargin.toFixed(1)}% Margin</p>
              </div>
            </div>

            {expenses && expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Title</th>
                      <th className="py-3 px-2">Description</th>
                      <th className="py-3 px-2 text-right">Amount</th>
                      <th className="py-3 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expenses.map((exp) => {
                      const cat = getCategoryConfig(exp.category);
                      return (
                        <tr key={exp.id} className="text-sm text-slate-700 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-2 whitespace-nowrap">
                            {new Date(exp.expenseDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cat.bg} ${cat.text}`}>
                              {cat.emoji} {cat.label}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-medium text-slate-900">{exp.title}</td>
                          <td className="py-3 px-2 text-slate-500 max-w-xs truncate">{exp.description || '-'}</td>
                          <td className="py-3 px-2 text-right font-bold text-slate-900">{formatCurrency(exp.amount)}</td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-rose-500" />
                </div>
                <p className="text-slate-500">No expenses recorded yet</p>
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

              {/* Profitability summary inside the summary card */}
              <div className={`p-4 rounded-xl border-2 mt-3 ${netProfit >= 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-600">Total Expenses</span>
                  <span className="text-sm font-semibold text-rose-600">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Net Profit</span>
                  <span className={`text-base font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatCurrency(netProfit)}
                  </span>
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

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Add Expense</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                <select
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="stay">🏨 Stay</option>
                  <option value="food">🍽️ Food</option>
                  <option value="vehicle">🚗 Vehicle</option>
                  <option value="guide">🧑‍🌾 Guide</option>
                  <option value="tickets">🎟️ Tickets</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={expenseData.title}
                  onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                  placeholder="e.g. Darjeeling Cab Fuel"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={expenseData.amount || ''}
                    onChange={(e) => setExpenseData({ ...expenseData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-lg font-semibold"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={expenseData.expenseDate}
                  onChange={(e) => setExpenseData({ ...expenseData, expenseDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="Enter detailed description"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!expenseData.title || expenseData.amount <= 0 || !expenseData.expenseDate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-rose-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
