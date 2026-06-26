'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Users,
  Package,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  ChevronDown,
  Home,
  Moon,
  Check,
} from 'lucide-react';
import { useLeads, Lead } from '@/services/lead';
import { usePackages, PackagePricing } from '@/services/packages';
import { useHomestays, useAvailableRooms, Room } from '@/services/homestay';
import {
  useCreatePackageBooking,
  CreatePackageBookingDto,
  PackageHomestayDayDto,
} from '@/services/package-booking';

interface SelectedHomestayNight {
  nightNumber: number;
  roomId: string;
  room: Room;
  numberOfGuests: number;
  notes?: string;
}

function CreatePackageBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get('leadId');

  // Form state
  const [selectedLeadId, setSelectedLeadId] = useState(leadIdParam || '');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [numberOfAdults, setNumberOfAdults] = useState(2);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [includesHomestay, setIncludesHomestay] = useState(false);
  const [selectedHomestayId, setSelectedHomestayId] = useState('');
  const [homestayNights, setHomestayNights] = useState<SelectedHomestayNight[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedArrivalTime, setExpectedArrivalTime] = useState('');

  // Lead search state
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const leadDropdownRef = useRef<HTMLDivElement>(null);

  // Room selection state for multiple nights
  const [selectedNightsForRoom, setSelectedNightsForRoom] = useState<number[]>([]);

  // Queries
  const { data: leads } = useLeads();
  const { data: packages } = usePackages();
  const { data: homestays } = useHomestays();
  const { data: availableRooms } = useAvailableRooms(selectedHomestayId);
  const createPackageBookingMutation = useCreatePackageBooking();

  const selectedLead = leads?.find((l) => l.id === selectedLeadId);
  const selectedPackage = packages?.find((p) => p.id === selectedPackageId);

  // Filter leads
  const filteredLeads = leads?.filter((lead) => {
    if (!leadSearchQuery) return true;
    const query = leadSearchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      lead.email?.toLowerCase().includes(query)
    );
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (leadDropdownRef.current && !leadDropdownRef.current.contains(event.target as Node)) {
        setIsLeadDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsLeadDropdownOpen(false);
    setLeadSearchQuery('');
  };

  const clearSelectedLead = () => {
    setSelectedLeadId('');
    setLeadSearchQuery('');
  };

  const getLeadBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      qualified: 'bg-emerald-100 text-emerald-700',
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      proposal_sent: 'bg-purple-100 text-purple-700',
      negotiation: 'bg-orange-100 text-orange-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  // Calculate end date based on package nights
  const calculateEndDate = () => {
    if (!startDate || !selectedPackage) return '';
    const start = new Date(startDate);
    start.setDate(start.getDate() + selectedPackage.numberOfNights);
    return start.toISOString().split('T')[0];
  };

  // Get available nights for homestay
  const getAvailableNights = () => {
    if (!selectedPackage) return [];
    const nights: number[] = [];
    for (let i = 1; i <= selectedPackage.numberOfNights; i++) {
      nights.push(i);
    }
    return nights;
  };

  // Get unselected nights (nights without room assigned)
  const getUnselectedNights = () => {
    return getAvailableNights().filter((night) => !homestayNights.find((hn) => hn.nightNumber === night));
  };

  // Toggle night selection for room assignment
  const toggleNightSelection = (nightNumber: number) => {
    if (selectedNightsForRoom.includes(nightNumber)) {
      setSelectedNightsForRoom(selectedNightsForRoom.filter((n) => n !== nightNumber));
    } else {
      setSelectedNightsForRoom([...selectedNightsForRoom, nightNumber]);
    }
  };

  // Select all unselected nights
  const selectAllNights = () => {
    const unselected = getUnselectedNights();
    setSelectedNightsForRoom(unselected);
  };

  // Clear night selection
  const clearNightSelection = () => {
    setSelectedNightsForRoom([]);
  };

  // Add room for selected nights
  const addRoomForSelectedNights = (room: Room) => {
    if (selectedNightsForRoom.length === 0) return;

    const newHomestayNights = selectedNightsForRoom.map((nightNumber) => ({
      nightNumber,
      roomId: room.id,
      room,
      numberOfGuests: numberOfAdults,
    }));

    setHomestayNights([...homestayNights, ...newHomestayNights]);
    setSelectedNightsForRoom([]);
  };

  // Remove homestay night
  const removeHomestayNight = (nightNumber: number) => {
    setHomestayNights(homestayNights.filter((hn) => hn.nightNumber !== nightNumber));
  };

  // Remove all homestay nights
  const removeAllHomestayNights = () => {
    setHomestayNights([]);
  };

  // Update guests for a night
  const updateNightGuests = (nightNumber: number, delta: number) => {
    setHomestayNights(
      homestayNights.map((hn) => {
        if (hn.nightNumber === nightNumber) {
          const newCount = Math.max(1, Math.min(hn.room.capacity, hn.numberOfGuests + delta));
          return { ...hn, numberOfGuests: newCount };
        }
        return hn;
      })
    );
  };

  // Find the matching pricing tier based on number of adults
  const getMatchingPricingTier = (): PackagePricing | null => {
    if (!selectedPackage?.pricingTiers || selectedPackage.pricingTiers.length === 0) {
      return null;
    }

    // First try to find exact match for numberOfPersons
    const exactMatch = selectedPackage.pricingTiers.find(
      (tier) => tier.numberOfPersons === numberOfAdults && tier.isActive
    );
    if (exactMatch) return exactMatch;

    // If no exact match, find the closest tier (preferably higher or equal)
    const activeTiers = selectedPackage.pricingTiers
      .filter((tier) => tier.isActive)
      .sort((a, b) => a.numberOfPersons - b.numberOfPersons);

    // Find first tier >= numberOfAdults
    const closestHigher = activeTiers.find((tier) => tier.numberOfPersons >= numberOfAdults);
    if (closestHigher) return closestHigher;

    // If none found, return the highest available tier
    return activeTiers[activeTiers.length - 1] || null;
  };

  const matchingPricingTier = getMatchingPricingTier();

  // Calculate prices
  const calculatePrices = () => {
    if (!selectedPackage) {
      return { packageTotal: 0, homestayTotal: 0, subtotal: 0, tax: 0, total: 0, pricePerHead: 0 };
    }

    let packageTotal = 0;
    let pricePerHead = 0;

    // Use pricing tier if available
    if (matchingPricingTier) {
      // If exact match for numberOfPersons, use totalPrice
      if (matchingPricingTier.numberOfPersons === numberOfAdults) {
        packageTotal = Number(matchingPricingTier.totalPrice);
        pricePerHead = Number(matchingPricingTier.pricePerHead);
      } else {
        // If not exact match, calculate based on pricePerHead
        pricePerHead = Number(matchingPricingTier.pricePerHead);
        packageTotal = pricePerHead * numberOfAdults;
      }
    } else {
      // Fallback to basePricePerHead if no pricing tiers
      pricePerHead = Number(selectedPackage.basePricePerHead);
      packageTotal = pricePerHead * numberOfAdults;
    }

    // Homestay pricing is NOT added separately - it's already included in package price
    // We just track it for display purposes
    let homestayTotal = 0;
    homestayNights.forEach((hn) => {
      homestayTotal += Number(hn.room.pricePerHead) * hn.numberOfGuests;
    });

    // DO NOT add homestayTotal to subtotal - package price already includes accommodation
    const subtotal = packageTotal - discountAmount;
    const tax = (subtotal * taxPercentage) / 100;
    const total = subtotal + tax;

    return { packageTotal, homestayTotal, subtotal, tax, total, pricePerHead };
  };

  const prices = calculatePrices();

  // Form validation
  const isFormValid =
    selectedLeadId &&
    selectedPackageId &&
    startDate &&
    numberOfAdults > 0 &&
    (!includesHomestay || (includesHomestay && homestayNights.length > 0));

  // Submit handler
  const handleSubmit = async () => {
    if (!isFormValid) return;

    // Map to API format (dayNumber is used in API, represents night)
    const homestayDaysDto: PackageHomestayDayDto[] = homestayNights.map((hn) => ({
      dayNumber: hn.nightNumber,
      roomId: hn.roomId,
      numberOfGuests: hn.numberOfGuests,
      notes: hn.notes,
    }));

    const bookingData: CreatePackageBookingDto = {
      leadId: selectedLeadId,
      packageId: selectedPackageId,
      startDate,
      numberOfAdults,
      numberOfChildren,
      includesHomestay,
      homestayDays: includesHomestay ? homestayDaysDto : undefined,
      discountAmount,
      taxPercentage,
      specialRequests,
      notes,
      expectedArrivalTime,
    };

    try {
      const booking = await createPackageBookingMutation.mutateAsync(bookingData);
      router.push(`/dashboard/bookings/package/${booking.id}`);
    } catch (error) {
      console.error('Failed to create package booking:', error);
    }
  };

  // Get date for a specific night number
  const getDateForNight = (nightNumber: number) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + nightNumber - 1);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl p-8">
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
            <span className="text-purple-400 text-sm font-medium">Package Reservation</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Create Package Booking 📦</h1>
          <p className="text-slate-300 text-lg">
            Book a complete tour package with optional homestay
          </p>
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

            <div className="relative" ref={leadDropdownRef}>
              {selectedLead ? (
                <div className="flex items-center justify-between p-3 border-2 border-emerald-500 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedLead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedLead.name}</p>
                      <p className="text-sm text-slate-600">
                        {selectedLead.phone} • {selectedLead.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearSelectedLead}
                    className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              ) : (
                <div className="relative cursor-pointer" onClick={() => setIsLeadDropdownOpen(true)}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search leads by name, phone, or email..."
                    value={leadSearchQuery}
                    onChange={(e) => {
                      setLeadSearchQuery(e.target.value);
                      setIsLeadDropdownOpen(true);
                    }}
                    onFocus={() => setIsLeadDropdownOpen(true)}
                    className="w-full pl-12 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <ChevronDown
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-transform ${isLeadDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              )}

              {isLeadDropdownOpen && !selectedLead && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                  {filteredLeads && filteredLeads.length > 0 ? (
                    filteredLeads.map((lead: Lead) => (
                      <div
                        key={lead.id}
                        onClick={() => handleSelectLead(lead.id)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{lead.name}</p>
                          <p className="text-sm text-slate-500 truncate">
                            {lead.phone} {lead.email && `• ${lead.email}`}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getLeadBadgeColor(lead.status)}`}
                        >
                          {lead.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500">
                      {leadSearchQuery ? (
                        <p>No leads found matching &quot;{leadSearchQuery}&quot;</p>
                      ) : (
                        <p>No leads available</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Select Package */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select Package</h3>
            </div>
            <select
              value={selectedPackageId}
              onChange={(e) => {
                setSelectedPackageId(e.target.value);
                setHomestayNights([]);
                setSelectedNightsForRoom([]);
              }}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">Choose a package...</option>
              {packages?.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - {pkg.numberOfNights}N/{pkg.numberOfDays}D - ₹
                  {pkg.basePricePerHead}/person
                </option>
              ))}
            </select>

            {selectedPackage && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{selectedPackage.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{selectedPackage.destination}</p>
                    <div className="flex gap-3 mt-3 flex-wrap">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {selectedPackage.numberOfNights}N / {selectedPackage.numberOfDays}D
                      </span>
                      {matchingPricingTier && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          ₹{Number(matchingPricingTier.pricePerHead).toLocaleString()}/person (for {matchingPricingTier.numberOfPersons} pax)
                        </span>
                      )}
                    </div>
                    
                    {/* Show available pricing tiers */}
                    {selectedPackage.pricingTiers && selectedPackage.pricingTiers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="text-xs font-semibold text-slate-600 mb-2">Available Pricing:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedPackage.pricingTiers
                            .filter((tier) => tier.isActive)
                            .sort((a, b) => a.numberOfPersons - b.numberOfPersons)
                            .map((tier) => (
                              <span
                                key={tier.id}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  tier.numberOfPersons === numberOfAdults
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {tier.numberOfPersons} pax: ₹{Number(tier.pricePerHead).toLocaleString()}/head
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Trip Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={calculateEndDate()}
                  disabled
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adults</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNumberOfAdults(Math.max(1, numberOfAdults - 1))}
                    className="p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold text-slate-900 w-12 text-center">
                    {numberOfAdults}
                  </span>
                  <button
                    onClick={() => setNumberOfAdults(numberOfAdults + 1)}
                    className="p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Children</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNumberOfChildren(Math.max(0, numberOfChildren - 1))}
                    className="p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold text-slate-900 w-12 text-center">
                    {numberOfChildren}
                  </span>
                  <button
                    onClick={() => setNumberOfChildren(numberOfChildren + 1)}
                    className="p-2 border-2 border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Homestay Option */}
          {selectedPackage && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Include Homestay</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesHomestay}
                    onChange={(e) => {
                      setIncludesHomestay(e.target.checked);
                      if (!e.target.checked) {
                        setHomestayNights([]);
                        setSelectedHomestayId('');
                        setSelectedNightsForRoom([]);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {includesHomestay && (
                <div className="space-y-5">
                  {/* Info Banner */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                      🌙 You can add homestay for <strong>one night</strong>, <strong>multiple nights</strong>, or <strong>all {selectedPackage.numberOfNights} nights</strong> of your package.
                    </p>
                  </div>

                  {/* Select Homestay */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Homestay
                    </label>
                    <select
                      value={selectedHomestayId}
                      onChange={(e) => {
                        setSelectedHomestayId(e.target.value);
                        setHomestayNights([]);
                        setSelectedNightsForRoom([]);
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Choose a homestay...</option>
                      {homestays?.map((homestay) => (
                        <option key={homestay.id} value={homestay.id}>
                          {homestay.name} - {homestay.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Night-wise Room Selection */}
                  {selectedHomestayId && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-slate-700">
                          Select Nights for Homestay
                        </label>
                        {homestayNights.length > 0 && (
                          <button
                            onClick={removeAllHomestayNights}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Remove All
                          </button>
                        )}
                      </div>

                      {/* Quick Action: Book All Nights in One Room */}
                      {homestayNights.length === 0 && availableRooms && availableRooms.length > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <p className="text-sm font-semibold text-purple-800 mb-3">
                            🚀 Quick Book: Select one room for all {selectedPackage.numberOfNights} nights
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableRooms?.map((room) => (
                              <div
                                key={room.id}
                                onClick={() => {
                                  const allNights = getAvailableNights().map((nightNumber) => ({
                                    nightNumber,
                                    roomId: room.id,
                                    room,
                                    numberOfGuests: numberOfAdults,
                                  }));
                                  setHomestayNights(allNights);
                                }}
                                className="p-4 bg-white border-2 border-purple-200 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-900">{room.roomName}</p>
                                    <p className="text-xs text-slate-500">Room {room.roomNumber} • Max {room.capacity} guests</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">₹{room.pricePerHead}</p>
                                    <p className="text-xs text-slate-500">per head/night</p>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-purple-100">
                                  <p className="text-xs text-purple-600 font-medium">
                                    All {selectedPackage.numberOfNights} nights • Total: ₹{(room.pricePerHead * numberOfAdults * selectedPackage.numberOfNights).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 mt-3 text-center">
                            Or select specific nights below for different rooms
                          </p>
                        </div>
                      )}

                      {/* Selected Nights Summary */}
                      {homestayNights.length > 0 && (
                        <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-emerald-800">
                              ✅ Homestay booked for {homestayNights.length} of {selectedPackage.numberOfNights} nights
                            </span>
                            {homestayNights.length > 1 && 
                              new Set(homestayNights.map(hn => hn.roomId)).size === 1 && (
                              <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full font-medium">
                                Same Room
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {homestayNights
                              .sort((a, b) => a.nightNumber - b.nightNumber)
                              .map((hn) => (
                                <div
                                  key={hn.nightNumber}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                      <Moon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-900">Night {hn.nightNumber} - {hn.room.roomName}</p>
                                      <p className="text-xs text-slate-500">{getDateForNight(hn.nightNumber)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                      <button
                                        onClick={() => updateNightGuests(hn.nightNumber, -1)}
                                        className="p-1 hover:bg-white rounded"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-6 text-center text-sm font-semibold">{hn.numberOfGuests}</span>
                                      <button
                                        onClick={() => updateNightGuests(hn.nightNumber, 1)}
                                        className="p-1 hover:bg-white rounded"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => removeHomestayNight(hn.nightNumber)}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Add More Nights Section */}
                      {getUnselectedNights().length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-700">
                              {homestayNights.length > 0 ? 'Add more nights' : 'Or select specific nights'}
                            </span>
                            <div className="flex gap-2">
                              {selectedNightsForRoom.length > 0 && (
                                <button
                                  onClick={clearNightSelection}
                                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                                >
                                  Clear
                                </button>
                              )}
                              <button
                                onClick={selectAllNights}
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                              >
                                Select All Remaining ({getUnselectedNights().length})
                              </button>
                            </div>
                          </div>

                          {/* Night Selection Grid */}
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                            {getUnselectedNights().map((night) => (
                              <button
                                key={night}
                                onClick={() => toggleNightSelection(night)}
                                className={`relative p-3 border-2 rounded-xl text-center font-medium transition-all ${
                                  selectedNightsForRoom.includes(night)
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-slate-200 hover:border-purple-300 bg-white'
                                }`}
                              >
                                {selectedNightsForRoom.includes(night) && (
                                  <Check className="absolute top-1 right-1 w-3 h-3 text-purple-500" />
                                )}
                                <Moon className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                                <div className="text-sm font-bold">N{night}</div>
                                {startDate && (
                                  <div className="text-xs text-slate-500">{getDateForNight(night)}</div>
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Room Selection */}
                          {selectedNightsForRoom.length > 0 && (
                            <div>
                              <p className="text-sm text-slate-600 mb-3">
                                Select room for{' '}
                                <strong>
                                  {selectedNightsForRoom.length === 1
                                    ? `Night ${selectedNightsForRoom[0]}`
                                    : selectedNightsForRoom.length === getUnselectedNights().length
                                    ? `all ${selectedNightsForRoom.length} remaining nights`
                                    : `${selectedNightsForRoom.length} nights`}
                                </strong>
                                :
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {availableRooms?.map((room) => (
                                  <div
                                    key={room.id}
                                    onClick={() => addRoomForSelectedNights(room)}
                                    className="p-4 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-semibold text-slate-900">{room.roomName}</p>
                                        <p className="text-xs text-slate-500">Room {room.roomNumber} • Max {room.capacity} guests</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-600">₹{room.pricePerHead}</p>
                                        <p className="text-xs text-slate-500">per head/night</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* All nights selected message */}
                      {getUnselectedNights().length === 0 && homestayNights.length > 0 && (
                        <div className="p-4 bg-emerald-100 rounded-xl border border-emerald-300 text-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-emerald-800">
                            All {selectedPackage.numberOfNights} nights have homestay booked! 🎉
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Expected Arrival Time
                </label>
                <input
                  type="time"
                  value={expectedArrivalTime}
                  onChange={(e) => setExpectedArrivalTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="Any special requirements from guest..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
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
              {selectedPackage && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Package</span>
                    <span className="font-medium text-slate-900">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-medium text-slate-900">
                      {selectedPackage.numberOfNights}N / {selectedPackage.numberOfDays}D
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Adults</span>
                <span className="font-medium text-slate-900">{numberOfAdults}</span>
              </div>
              {numberOfChildren > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Children</span>
                  <span className="font-medium text-slate-900">{numberOfChildren}</span>
                </div>
              )}
              {includesHomestay && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Homestay Nights</span>
                  <span className="font-medium text-slate-900">
                    {homestayNights.length} of {selectedPackage?.numberOfNights || 0}
                  </span>
                </div>
              )}
              <hr className="border-slate-200" />
              
              {/* Show pricing tier info */}
              {matchingPricingTier && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium mb-1">
                    {matchingPricingTier.numberOfPersons === numberOfAdults
                      ? `✓ Exact match: ${matchingPricingTier.numberOfPersons} person pricing`
                      : `≈ Using ${matchingPricingTier.numberOfPersons} person pricing`}
                  </p>
                  <p className="text-sm font-semibold text-purple-800">
                    ₹{Number(matchingPricingTier.pricePerHead).toLocaleString()}/person
                  </p>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Package ({numberOfAdults} × ₹{prices.pricePerHead.toLocaleString()})
                </span>
                <span className="font-medium text-slate-900">
                  ₹{prices.packageTotal.toLocaleString()}
                </span>
              </div>
              
              {/* Show homestay info but indicate it's included */}
              {includesHomestay && homestayNights.length > 0 && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-emerald-700">
                      🏠 Homestay ({homestayNights.length} nights)
                    </span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      Included in package
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Room value: ₹{prices.homestayTotal.toLocaleString()} (already included)
                  </p>
                </div>
              )}
              
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
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax %</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-right text-sm"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
              {prices.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax Amount</span>
                  <span className="font-medium text-slate-900">₹{prices.tax.toLocaleString()}</span>
                </div>
              )}
              <hr className="border-slate-200" />
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-bold text-purple-600">
                  ₹{prices.total.toLocaleString()}
                </span>
              </div>
            </div>

            {!isFormValid && (
              <div className="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">
                  Please fill all required fields to create booking
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || createPackageBookingMutation.isPending}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createPackageBookingMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Create Package Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatePackageBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <CreatePackageBookingContent />
    </Suspense>
  );
}
