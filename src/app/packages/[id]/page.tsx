'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/services/axiosinstance';
import { usePackage, PackageCategory } from '@/services/packages';
import { useCreateLead, LeadSource } from '@/services/lead';
import { useCreatePackageBooking } from '@/services/package-booking';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  Info,
  Clock,
  Mountain,
  ChevronDown,
  ChevronUp,
  Star,
  Home,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

const categoryLabels: Record<PackageCategory, { emoji: string; label: string }> = {
  [PackageCategory.ADVENTURE]: { emoji: '🏔️', label: 'Adventure' },
  [PackageCategory.HONEYMOON]: { emoji: '💕', label: 'Honeymoon' },
  [PackageCategory.FAMILY]: { emoji: '👨‍👩‍👧‍👦', label: 'Family' },
  [PackageCategory.BUDGET]: { emoji: '💰', label: 'Budget' },
  [PackageCategory.LUXURY]: { emoji: '✨', label: 'Luxury' },
  [PackageCategory.WEEKEND_GETAWAY]: { emoji: '🌴', label: 'Weekend' },
  [PackageCategory.PILGRIMAGE]: { emoji: '🙏', label: 'Pilgrimage' },
  [PackageCategory.WILDLIFE]: { emoji: '🦁', label: 'Wildlife' },
  [PackageCategory.CULTURAL]: { emoji: '🎭', label: 'Cultural' },
};

export default function PublicPackageDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(220,25%,97%)] space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading package...</p>
      </div>
    }>
      <PackageDetailContent />
    </Suspense>
  );
}

function PackageDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const shareToken = searchParams.get('st') || undefined;

  const { data: pkg, isLoading, isError } = usePackage(id, shareToken);
  // pricingHidden is set by the backend when the share token encodes showPricing=false
  const pricingHidden = (pkg as any)?.pricingHidden === true;
  const createLeadMutation = useCreateLead();
  const createBookingMutation = useCreatePackageBooking();

  // Fetch public organization branding details
  const { data: org } = useQuery<{
    name: string;
    slug: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    logo: string;
    description: string;
  }>({
    queryKey: ['public-organization', pkg?.organizationId],
    queryFn: async () => {
      const response = await axiosInstance.get('/auth/organization/public', {
        params: { orgId: pkg?.organizationId || undefined },
      });
      return response.data;
    },
  });

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [expandedItinerary, setExpandedItinerary] = useState<number[]>([1]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    numberOfAdults: 2,
    numberOfChildren: 0,
    specialRequests: '',
  });

  const toggleItinerary = (dayNum: number) => {
    setExpandedItinerary((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.startsWith('numberOf') ? parseInt(value) || 0 : value,
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.startDate) {
      toast.error('⚠️ Please fill in all required fields.');
      return;
    }

    try {
      // Step 1: Create a Lead in CRM
      const lead = await createLeadMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: LeadSource.WEBSITE,
        sourceDetails: `Public Package Booking Request`,
        numberOfAdults: formData.numberOfAdults,
        numberOfChildren: formData.numberOfChildren,
        checkInDate: formData.startDate,
        requirements: `Public Inquiry for Predefined Package: ${pkg?.name}`,
        notes: formData.specialRequests ? `Special Requests: ${formData.specialRequests}` : '',
      });

      // Step 2: Create a Package Booking request linking to the Lead
      const booking = await createBookingMutation.mutateAsync({
        leadId: lead.id,
        packageId: id,
        startDate: formData.startDate,
        numberOfAdults: formData.numberOfAdults,
        numberOfChildren: formData.numberOfChildren,
        specialRequests: formData.specialRequests,
        includesHomestay: false, // will select rooms during sales conversion
      });

      setBookingSuccess(booking);
      toast.success('🚀 Booking request created successfully!');
    } catch (err: any) {
      console.error('Failed to complete booking request:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to submit booking request.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(220,25%,97%)] space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(220,25%,97%)] space-y-4">
        <p className="text-red-500 font-bold text-lg">Package not found</p>
        <button
          onClick={() => router.push('/packages')}
          className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to catalog
        </button>
      </div>
    );
  }

  // Calculate starting from price (only if pricing is visible)
  const minPricing = !pricingHidden && pkg.pricingTiers && pkg.pricingTiers.length > 0
    ? Math.min(...pkg.pricingTiers.map((p) => p.pricePerHead))
    : pkg.basePricePerHead;

  const activePricingTiers = !pricingHidden ? (pkg.pricingTiers || []) : [];
  const activeInclusions = pkg.inclusions || [];

  return (
    <div className="min-h-screen bg-[hsl(220,25%,97%)] text-[hsl(222,47%,11%)] overflow-x-hidden pb-20" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* ── PUBLIC HEADER ────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass shadow-lg shadow-black/5 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/packages')}>
            {org?.logo ? (
              <img src={org.logo} alt={org.name} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 text-emerald-700">
                  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                    <path d="M16 3L6 14h5l-5 8h7v7h6v-7h7l-5-8h5L16 3z" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                    {org?.name ? org.name.split(' ')[0] : 'Oakn'}
                  </span>
                  <span className="text-[hsl(222,47%,11%)] ml-0.5">
                    {org?.name ? org.name.split(' ').slice(1).join(' ') : 'Pine'}
                  </span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/packages')}
              className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/packages')}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all packages
          </button>
          
          <div className="flex items-center gap-2.5 mb-3">
            {pkg.category && (
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-300 text-xs font-bold rounded-full">
                {categoryLabels[pkg.category]?.emoji || '🌟'} {categoryLabels[pkg.category]?.label || pkg.category}
              </span>
            )}
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
              Package code: {pkg.packageCode}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 max-w-4xl">
            {pkg.name}
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
            {pkg.description}
          </p>
        </div>
      </section>

      {/* ── CONTENT SECTION ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Specs info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <MapPin className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Destination</p>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">{pkg.destination || 'Multiple'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <Calendar className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Duration</p>
              <p className="text-sm font-bold text-slate-800">{pkg.numberOfNights}N/{pkg.numberOfDays}D</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ideal Group</p>
              <p className="text-sm font-bold text-slate-800">{pkg.minPersons}-{pkg.maxPersons} Pax</p>
            </div>
          </div>

          {/* Highlights */}
          {pkg.highlights && pkg.highlights.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Trip Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pkg.highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day-by-Day Itinerary */}
          {pkg.itineraries && pkg.itineraries.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Day-by-Day Journey
              </h2>
              
              <div className="space-y-3">
                {pkg.itineraries
                  .sort((a, b) => a.dayNumber - b.dayNumber)
                  .map((itinerary) => {
                    const isExpanded = expandedItinerary.includes(itinerary.dayNumber);
                    const isLastDay = itinerary.dayNumber === pkg.numberOfDays;

                    return (
                      <div
                        key={itinerary.id}
                        className={`border rounded-2xl transition-all duration-300 ${
                          isExpanded ? 'border-emerald-300 bg-emerald-50/5' : 'border-slate-200'
                        }`}
                      >
                        {/* Accordion Trigger */}
                        <div
                          onClick={() => toggleItinerary(itinerary.dayNumber)}
                          className="flex items-center justify-between p-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl flex items-center justify-center shrink-0">
                              D{itinerary.dayNumber}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{itinerary.title}</p>
                              {itinerary.accommodation && (
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  {isLastDay ? (
                                    <>📍 Drop: {itinerary.accommodation}</>
                                  ) : (
                                    <>🏨 Stay: {itinerary.accommodation}</>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        {/* Accordion Content */}
                        {isExpanded && (
                          <div className="px-4 pb-5 pt-2 border-t border-slate-100 space-y-4">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                              {itinerary.description}
                            </p>

                            {/* Travel Details Section */}
                            {(itinerary.drivingDistanceKm || itinerary.drivingTime || itinerary.altitude) && (
                              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 text-center">
                                {itinerary.drivingDistanceKm && (
                                  <div>
                                    <span className="font-semibold text-slate-400 block uppercase tracking-wider">Distance</span>
                                    <span className="font-bold text-slate-800">{itinerary.drivingDistanceKm} km</span>
                                  </div>
                                )}
                                {itinerary.drivingTime && (
                                  <div>
                                    <span className="font-semibold text-slate-400 block uppercase tracking-wider">Drive Time</span>
                                    <span className="font-bold text-slate-800">{itinerary.drivingTime}</span>
                                  </div>
                                )}
                                {itinerary.altitude && (
                                  <div>
                                    <span className="font-semibold text-slate-400 block uppercase tracking-wider">Altitude</span>
                                    <span className="font-bold text-slate-800">{itinerary.altitude}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Schedule info */}
                            {(itinerary.morningActivities || itinerary.afternoonActivities || itinerary.eveningActivities) && (
                              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                {itinerary.morningActivities && (
                                  <p className="text-slate-600">
                                    <span className="font-bold text-slate-800">🌅 Morning:</span> {itinerary.morningActivities}
                                  </p>
                                )}
                                {itinerary.afternoonActivities && (
                                  <p className="text-slate-600">
                                    <span className="font-bold text-slate-800">☀️ Afternoon:</span> {itinerary.afternoonActivities}
                                  </p>
                                )}
                                {itinerary.eveningActivities && (
                                  <p className="text-slate-600">
                                    <span className="font-bold text-slate-800">🌙 Evening:</span> {itinerary.eveningActivities}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Meals list */}
                            {itinerary.mealsIncluded && itinerary.mealsIncluded.length > 0 && (
                              <div className="text-xs text-slate-500">
                                🍳 <span className="font-bold">Meals:</span> {itinerary.mealsIncluded.join(', ')}
                              </div>
                            )}

                            {/* Tips */}
                            {itinerary.tips && (
                              <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-yellow-600 shrink-0">💡</span>
                                <span>{itinerary.tips}</span>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Pricing tiers */}
          {activePricingTiers.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                Pricing Options
              </h2>
              
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                      <th className="py-3.5 px-4 font-semibold">Group Size</th>
                      <th className="py-3.5 px-4 font-semibold">Room Comfort</th>
                      <th className="py-3.5 px-4 font-semibold">Season Type</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Price per Person</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePricingTiers
                      .sort((a, b) => a.numberOfPersons - b.numberOfPersons)
                      .map((tier) => (
                        <tr key={tier.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {tier.numberOfPersons} Pax
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-600">
                            {tier.roomType}
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-600">
                            {tier.seasonType}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700 text-right">
                            ₹{Number(tier.pricePerHead).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                * Prices are per head. Final prices will depend on the exact group size and dates selected.
              </p>
            </div>
          )}

          {/* Inclusions / Exclusions */}
          {activeInclusions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Inclusions */}
              <div>
                <h3 className="text-base font-bold text-emerald-800 mb-3 flex items-center gap-1.5 border-b border-emerald-50 pb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  What&apos;s Included
                </h3>
                <ul className="space-y-2">
                  {activeInclusions
                    .filter((inc) => inc.type === 'included')
                    .map((inc) => (
                      <li key={inc.id} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                        <span>{inc.description}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div>
                <h3 className="text-base font-bold text-red-800 mb-3 flex items-center gap-1.5 border-b border-red-50 pb-2">
                  <X className="w-4 h-4 text-red-600 border border-red-500 rounded-full" />
                  What&apos;s Excluded
                </h3>
                <ul className="space-y-2">
                  {activeInclusions
                    .filter((inc) => inc.type === 'excluded')
                    .map((inc) => (
                      <li key={inc.id} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-red-500 font-bold shrink-0 mt-0.5">✗</span>
                        <span>{inc.description}</span>
                      </li>
                    ))}
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Book Now Floating card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-lg space-y-5">
            {!pricingHidden ? (
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Special Price Starting From</p>
                <div className="flex items-baseline mt-1 text-emerald-700">
                  <span className="text-3xl font-black flex items-center">
                    <IndianRupee className="w-6 h-6" />
                    {Number(minPricing).toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-slate-500 ml-1 font-normal">/person</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Pricing</p>
                <p className="text-sm font-semibold text-slate-600">Available on request</p>
                <p className="text-xs text-slate-400 mt-0.5">Contact us for a personalised quote</p>
              </div>
            )}

            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl text-base transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-px"
            >
              {pricingHidden ? 'Enquire Now' : 'Book Now'}
            </button>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">⚡</span>
                <span className="font-semibold text-slate-700">Instant Inquiry Submission</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">🛡️</span>
                <span className="font-semibold text-slate-700">Dedicated Tour Manager Assignment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">📞</span>
                <span className="font-semibold text-slate-700">Support via Phone & WhatsApp</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Contact {org?.name || 'OaknPine Tourism'}
              </p>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">📞 Phone:</span> {org?.phone || '+91 97330 12345'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">✉️ Email:</span> {org?.email || 'info@oaknpine.com'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">📍 Office:</span> {org?.address || 'Siliguri, West Bengal, India'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── BOOKING DIALOG / DRAWER ─────────────────────────────────────── */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-emerald-50/20">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Book Tour Package</h3>
                <p className="text-xs text-slate-500 mt-0.5">Let&apos;s customize your perfect itinerary</p>
              </div>
              <button
                onClick={() => {
                  setBookingModalOpen(false);
                  setBookingSuccess(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {!bookingSuccess ? (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sheikh Aman"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Travel Info Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        required
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Adults <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="numberOfAdults"
                        min={1}
                        required
                        value={formData.numberOfAdults}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Special Notes / Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      rows={3}
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      placeholder="e.g. Vegetarian food only, extra beds needed, etc."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={createLeadMutation.isPending || createBookingMutation.isPending}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                  >
                    {(createLeadMutation.isPending || createBookingMutation.isPending) ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting Inquiry...
                      </>
                    ) : (
                      <>Submit Booking Request</>
                    )}
                  </button>

                </form>
              ) : (
                // Success screen
                <div className="text-center py-6 space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900">Request Received!</h4>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                      Thank you, {formData.name}. Your booking inquiry has been registered.
                    </p>
                  </div>
                  
                  {/* Reference card */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 inline-block text-left w-full">
                    <div className="flex justify-between border-b border-slate-100 pb-2 mb-2 text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Reference Code</span>
                      <span className="font-extrabold text-emerald-700">{bookingSuccess.bookingReference}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Package:</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{pkg.name}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>Preferred Date:</span>
                      <span className="font-semibold text-slate-800">{formData.startDate}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>Total Adults:</span>
                      <span className="font-semibold text-slate-800">{formData.numberOfAdults} Pax</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    Our dedicated tour advisor will contact you within 24 hours via phone at <span className="font-bold text-slate-600">{formData.phone}</span> or email at <span className="font-bold text-slate-600">{formData.email}</span> to confirm pricing and select homestay rooms.
                  </p>

                  <button
                    onClick={() => {
                      setBookingModalOpen(false);
                      setBookingSuccess(null);
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-[hsl(222,47%,7%)] text-white py-16 px-4 sm:px-6 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} {org?.name || 'OaknPine Tourism'}. All rights reserved.</p>
            <p>Providing premium travel experiences in North Bengal & Sikkim.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
