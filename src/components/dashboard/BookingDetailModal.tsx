'use client';

import React, { useState } from 'react';
import {
  useBooking,
  useCheckIn,
  useCheckOut,
  useUpdateBookingStatus,
  useAddPayment,
  usePaymentsByBooking,
} from '@/services/room-booking';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Plus,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingDetailModalProps {
  bookingId: string;
  onClose: () => void;
}

export default function BookingDetailModal({ bookingId, onClose }: BookingDetailModalProps) {
  const { data: booking, isLoading: loadingBooking } = useBooking(bookingId);
  const { data: payments, isLoading: loadingPayments } = usePaymentsByBooking(bookingId);

  // Mutations
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const updateStatusMutation = useUpdateBookingStatus();
  const addPaymentMutation = useAddPayment();

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [type, setType] = useState('partial');
  const [notes, setNotes] = useState('');

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync({
        id: bookingId,
        data: { notes: 'Checked in via visual scheduler' },
      });
      toast.success('Guest successfully checked in!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync({
        id: bookingId,
        data: { notes: 'Checked out via visual scheduler' },
      });
      toast.success('Guest successfully checked out!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to check out');
    }
  };

  const handleCancelBooking = async () => {
    const reason = prompt('Please enter the reason for cancellation:');
    if (reason === null) return; // Cancelled prompt
    if (!reason.trim()) {
      toast.error('Rejection/Cancellation reason is required!');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: bookingId,
        data: { status: 'cancelled' as any, cancellationReason: reason },
      });
      toast.success('Booking cancelled successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await addPaymentMutation.mutateAsync({
        bookingId,
        data: {
          amount: parseFloat(amount),
          paymentMethod: method as any,
          paymentType: type as any,
          notes,
        },
      });
      toast.success('Payment recorded successfully!');
      setAmount('');
      setNotes('');
      setShowPaymentForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment');
    }
  };

  if (loadingBooking) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 flex items-center shadow-xl border border-slate-100">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-3" />
          <span className="font-semibold text-slate-700">Loading reservation details...</span>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                booking.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                booking.status === 'checked_out' ? 'bg-slate-100 text-slate-800' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {booking.status.replace('_', ' ')}
              </span>
              <span className="text-slate-400 font-mono text-xs">{booking.bookingReference}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{booking.guestName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Guest Contact Details */}
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{booking.guestPhone}</span>
            </div>
            {booking.guestEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">{booking.guestEmail}</span>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-slate-100 rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Check-in</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">
                {new Date(booking.checkInDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Check-out</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">
                {new Date(booking.checkOutDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Nights</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{booking.numberOfNights}</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 text-center">
              <User className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Guests</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">
                {booking.numberOfAdults + booking.numberOfChildren} Total
              </p>
            </div>
          </div>

          {/* Financial details */}
          <div className="border border-slate-100 rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Financial Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Base Total</span>
                <span>₹{booking.totalAmount - (booking.taxAmount || 0) + (booking.discountAmount || 0)}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span>-₹{booking.discountAmount}</span>
                </div>
              )}
              {booking.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount</span>
                  <span>+₹{booking.taxAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-800 text-base pt-2 border-t border-slate-100">
                <span>Total Amount</span>
                <span>₹{booking.totalAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Paid Amount</span>
                <span>₹{booking.paidAmount}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold text-base">
                <span>Balance Due</span>
                <span>₹{booking.balanceAmount}</span>
              </div>
            </div>
          </div>

          {/* Operational action triggers */}
          {booking.status !== 'cancelled' && (
            <div className="flex flex-wrap items-center gap-3">
              {booking.status === 'confirmed' && (
                <button
                  onClick={handleCheckIn}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Check-in
                </button>
              )}
              {booking.status === 'checked_in' && (
                <button
                  onClick={handleCheckOut}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/10"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Check-out
                </button>
              )}
              {booking.status !== 'checked_out' && (
                <button
                  onClick={handleCancelBooking}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl transition text-sm flex items-center gap-1.5 border border-rose-200"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Cancel Reservation
                </button>
              )}

              {booking.balanceAmount > 0 && (
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-sm flex items-center gap-1.5 ml-auto shadow-md shadow-emerald-500/10"
                >
                  <Plus className="w-4 h-4" />
                  Record Payment
                </button>
              )}
            </div>
          )}

          {/* Quick Payment Entry Form */}
          {showPaymentForm && (
            <form onSubmit={handleAddPayment} className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4">
              <h5 className="font-bold text-emerald-900 text-sm">Add Payment Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    max={booking.balanceAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="upi">UPI / GPay / PhonePe</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="partial">Partial Payment</option>
                    <option value="advance">Advance</option>
                    <option value="full">Full Settlement</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Transaction ID</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Txn Ref 429188..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPaymentMutation.isPending}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-sm"
                >
                  {addPaymentMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Payment
                </button>
              </div>
            </form>
          )}

          {/* Payment Transaction History */}
          {payments && payments.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-bold text-slate-800 text-sm">Payment History</h5>
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">₹{p.amount}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                        {p.paymentMethod} · {p.paymentType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {p.notes && <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
