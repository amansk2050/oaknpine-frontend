/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Sparkles,
  Loader2,
  CheckCircle,
  X,
  Info,
  Clock,
  User,
  Mail,
  Phone,
  Compass,
  FileText,
  AlertCircle,
  Trash2,
  Check,
  Send,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCustomPackage,
  useUpdateCustomPackageStatus,
  useSendQuote,
  useConfirmCustomPackage,
  CustomPackageStatus,
} from '@/services/packages';

export default function CustomPackageDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { data: pkg, isLoading, isError, refetch } = useCustomPackage(id);
  const updateStatusMutation = useUpdateCustomPackageStatus();
  const sendQuoteMutation = useSendQuote();
  const confirmPackageMutation = useConfirmCustomPackage();

  // Dialog states
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Form states inside modals
  const [quotePrice, setQuotePrice] = useState(0);
  const [validDays, setValidDays] = useState(7);
  const [finalPrice, setFinalPrice] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-bold text-slate-800">Proposal not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: CustomPackageStatus) => {
    const configs: Record<CustomPackageStatus, { bg: string; text: string; label: string }> = {
      [CustomPackageStatus.DRAFT]: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-750', label: 'Draft' },
      [CustomPackageStatus.QUOTE_SENT]: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Quote Sent' },
      [CustomPackageStatus.NEGOTIATING]: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Negotiating' },
      [CustomPackageStatus.CONFIRMED]: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Confirmed' },
      [CustomPackageStatus.CANCELLED]: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Cancelled' },
      [CustomPackageStatus.COMPLETED]: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Completed' },
    };
    const config = configs[status] || configs[CustomPackageStatus.DRAFT];
    return (
      <span className={`px-3.5 py-1.5 border ${config.bg} ${config.text} text-xs font-bold rounded-full shadow-sm`}>
        {config.label}
      </span>
    );
  };

  const handleSendQuote = async () => {
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + validDays);

      await sendQuoteMutation.mutateAsync({
        id,
        data: {
          quotedPricePerHead: quotePrice || pkg.quotedPricePerHead || 0,
          totalQuotedPrice: (quotePrice || pkg.quotedPricePerHead || 0) * (pkg.numberOfAdults + pkg.numberOfChildren),
          validUntil: deadline.toISOString().split('T')[0],
        },
      });
      toast.success('Quote proposal sent successfully! 📤');
      setQuoteModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch quote');
    }
  };

  const handleConfirmPackage = async () => {
    try {
      await confirmPackageMutation.mutateAsync({
        id,
        data: {
          finalPrice: finalPrice || ((pkg.quotedPricePerHead || 0) * (pkg.numberOfAdults + pkg.numberOfChildren)) - (pkg.discountAmount || 0),
        },
      });
      toast.success('Package booking confirmed! 🎉');
      setConfirmModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm booking');
    }
  };

  const handleCancelPackage = async () => {
    if (confirm('Are you sure you want to cancel this proposal?')) {
      try {
        await updateStatusMutation.mutateAsync({ id, status: CustomPackageStatus.CANCELLED });
        toast.success('Proposal cancelled.');
        refetch();
      } catch (err: any) {
        toast.error(err.message || 'Failed to cancel proposal');
      }
    }
  };

  const totalPax = pkg.numberOfAdults + pkg.numberOfChildren;
  const rawTotalPrice = (pkg.quotedPricePerHead || 0) * totalPax;
  const netPrice = Math.max(0, rawTotalPrice - (pkg.discountAmount || 0));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-8 shadow-xl text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/packages')}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-2 transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Packages
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
                {pkg.referenceCode}
              </span>
              {getStatusBadge(pkg.status)}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">{pkg.title}</h1>
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" /> Destinations: {pkg.destinations?.join(', ') || 'Multiple'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={() => router.push(`/dashboard/packages/custom/${id}/edit`)}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-all font-semibold flex items-center gap-2 text-sm shadow-md"
            >
              <Edit className="w-4 h-4" /> Edit Proposal
            </button>
            
            {pkg.status === CustomPackageStatus.DRAFT && (
              <button
                onClick={() => {
                  setQuotePrice(pkg.quotedPricePerHead || 0);
                  setQuoteModalOpen(true);
                }}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-semibold flex items-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
              >
                <Send className="w-4 h-4" /> Send Quote
              </button>
            )}

            {pkg.status === CustomPackageStatus.QUOTE_SENT && (
              <button
                onClick={() => {
                  setFinalPrice(netPrice);
                  setConfirmModalOpen(true);
                }}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-semibold flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" /> Confirm Booking
              </button>
            )}

            {pkg.status !== CustomPackageStatus.CONFIRMED && pkg.status !== CustomPackageStatus.CANCELLED && (
              <button
                onClick={handleCancelPackage}
                className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-colors font-semibold flex items-center gap-2 text-sm"
              >
                Cancel Proposal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Itinerary Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Day by Day travel plan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Day-by-Day Journey
            </h2>

            <div className="space-y-4 mt-4">
              {pkg.itineraries && pkg.itineraries.length > 0 ? (
                pkg.itineraries
                  .sort((a, b) => a.dayNumber - b.dayNumber)
                  .map((itinerary) => (
                    <div
                      key={itinerary.id}
                      className="border border-slate-100 rounded-2xl p-5 hover:bg-slate-50/50 transition-all flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {itinerary.dayNumber}
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="font-bold text-slate-800 text-base">{itinerary.title}</h4>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold text-[10px] rounded-full uppercase tracking-wider self-start sm:self-center">
                            📍 {itinerary.destination}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{itinerary.activities}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-500">
                          {itinerary.accommodationName && (
                            <p>🏨 <span className="font-semibold text-slate-700">Stay:</span> {itinerary.accommodationName}</p>
                          )}
                          {itinerary.transportDetails && (
                            <p>🚗 <span className="font-semibold text-slate-700">Transfer:</span> {itinerary.transportDetails}</p>
                          )}
                          {itinerary.drivingDistanceKm && (
                            <p>🛣️ <span className="font-semibold text-slate-700">Distance:</span> {itinerary.drivingDistanceKm} KM</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-slate-400 text-sm italic py-4 text-center">No itineraries defined for this custom package.</p>
              )}
            </div>
          </div>

          {/* Inclusions and Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inclusions */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">✓ Inclusions</h3>
              <div className="space-y-2 mt-2">
                {pkg.inclusions && pkg.inclusions.length > 0 ? (
                  pkg.inclusions.map((inc: string, idx: number) => (
                    <p key={idx} className="text-sm text-slate-650 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span> {inc}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-450 text-xs italic">No inclusions specified.</p>
                )}
              </div>
            </div>

            {/* Exclusions */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">✕ Exclusions</h3>
              <div className="space-y-2 mt-2">
                {pkg.exclusions && pkg.exclusions.length > 0 ? (
                  pkg.exclusions.map((exc: string, idx: number) => (
                    <p key={idx} className="text-sm text-slate-650 flex items-start gap-2">
                      <span className="text-red-500 font-bold">✕</span> {exc}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-450 text-xs italic">No exclusions specified.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Side cards */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Price details card */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">Quote Summary</h3>
            
            <div className="space-y-3.5 text-sm text-slate-650">
              <div className="flex justify-between">
                <span>Quoted Price per Head:</span>
                <span className="font-bold text-slate-900">₹{(pkg.quotedPricePerHead || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of Travelers:</span>
                <span className="font-bold text-slate-900">{totalPax} Pax</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal Quote:</span>
                <span className="font-bold text-slate-900">₹{rawTotalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount Amount:</span>
                <span>- ₹{(pkg.discountAmount || 0).toLocaleString()}</span>
              </div>
              
              <hr className="border-slate-100" />
              
              <div className="flex justify-between text-base">
                <span className="font-black text-slate-950">Total Quotation:</span>
                <span className="font-black text-emerald-600 text-lg">₹{netPrice.toLocaleString()}</span>
              </div>

              {pkg.costPrice && (
                <div className="pt-2 border-t border-dashed border-slate-150 text-xs text-slate-400 flex justify-between">
                  <span>Internal cost price:</span>
                  <span>₹{pkg.costPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Client Details card */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">Client Details</h3>
            
            <div className="space-y-3 text-sm text-slate-650">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">{pkg.customerName}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{pkg.customerPhone}</span>
              </p>
              {pkg.customerEmail && (
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{pkg.customerEmail}</span>
                </p>
              )}
              
              <hr className="border-slate-100" />
              
              <p className="flex items-center gap-2 text-xs">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span><span className="font-semibold text-slate-700">Travel Start:</span> {pkg.travelStartDate ? new Date(pkg.travelStartDate).toLocaleDateString() : '-'}</span>
              </p>
              <p className="flex items-center gap-2 text-xs">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span><span className="font-semibold text-slate-700">Travel End:</span> {pkg.travelEndDate ? new Date(pkg.travelEndDate).toLocaleDateString() : '-'}</span>
              </p>
              <p className="flex items-center gap-2 text-xs">
                <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{pkg.numberOfAdults} Adults {pkg.numberOfChildren > 0 && `, ${pkg.numberOfChildren} Children`}</span>
              </p>
              {pkg.customerBudget && (
                <p className="flex items-center gap-2 text-xs">
                  <IndianRupee className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span><span className="font-semibold text-slate-700">Budget Limit:</span> ₹{pkg.customerBudget.toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Internal notes card */}
          {pkg.internalNotes && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Internal Office Notes
              </h4>
              <p className="text-xs text-indigo-900 leading-normal">{pkg.internalNotes}</p>
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL: SEND QUOTE ───────────────────────────────────────────── */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Send Quote Proposal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase">Verify Quoted Price Per Head *</label>
                <input
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase">Link Validity Days</label>
                <input
                  type="number"
                  min={1}
                  value={validDays}
                  onChange={(e) => setValidDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendQuote}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md"
                >
                  Send Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM BOOKING ──────────────────────────────────────── */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Confirm Package Booking</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase">Final Agreed Price (Total Package) *</label>
                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPackage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md"
                >
                  Confirm Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
