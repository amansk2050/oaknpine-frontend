/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  MapPin,
  IndianRupee,
  ClipboardList,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCustomPackage,
  useUpdateCustomPackage,
  UpdateCustomPackageDto,
  CreateCustomPackageItineraryDto,
  CustomPackageStatus,
} from '@/services/packages';
import { useLeads } from '@/services/lead';

const steps = [
  { id: 1, title: 'Client Info', icon: <User className="w-5 h-5" /> },
  { id: 2, title: 'Package Details', icon: <Compass className="w-5 h-5" /> },
  { id: 3, title: 'Itinerary Plan', icon: <Calendar className="w-5 h-5" /> },
  { id: 4, title: 'Pricing & Tiers', icon: <IndianRupee className="w-5 h-5" /> },
  { id: 5, title: 'Confirmation', icon: <CheckCircle className="w-5 h-5" /> },
];

export default function EditCustomPackagePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { data: pkg, isLoading: isPkgLoading, isError } = useCustomPackage(id);
  const { data: leads } = useLeads();

  const [currentStep, setCurrentStep] = useState(1);
  const [initialized, setInitialized] = useState(false);

  // Form fields
  const [clientInfo, setClientInfo] = useState({
    leadId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    travelStartDate: '',
    travelEndDate: '',
    numberOfAdults: 2,
    numberOfChildren: 0,
    customerBudget: 0,
    specialRequirements: '',
    accommodationPreference: '',
    transportPreference: '',
    mealPreference: '',
  });

  const [packageInfo, setPackageInfo] = useState({
    title: '',
    destinations: [] as string[],
    newDestination: '',
    numberOfNights: 2,
    numberOfDays: 3,
  });

  const [itineraries, setItineraries] = useState<CreateCustomPackageItineraryDto[]>([]);
  const [pricingInfo, setPricingInfo] = useState({
    quotedPricePerHead: 0,
    costPrice: 0,
    discountAmount: 0,
    internalNotes: '',
    inclusions: [] as string[],
    newInclusion: '',
    exclusions: [] as string[],
    newExclusion: '',
    quoteValidUntil: '',
    status: CustomPackageStatus.DRAFT,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateCustomPackageMutation = useUpdateCustomPackage({
    onSuccess: () => {
      toast.success('Custom Package proposal updated successfully! 💾');
      router.push(`/dashboard/packages`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update custom package');
    },
  });

  // Pre-populate fields once custom package loads
  useEffect(() => {
    if (pkg && !initialized) {
      setClientInfo({
        leadId: pkg.leadId || '',
        customerName: pkg.customerName || '',
        customerEmail: pkg.customerEmail || '',
        customerPhone: pkg.customerPhone || '',
        travelStartDate: pkg.travelStartDate ? new Date(pkg.travelStartDate).toISOString().split('T')[0] : '',
        travelEndDate: pkg.travelEndDate ? new Date(pkg.travelEndDate).toISOString().split('T')[0] : '',
        numberOfAdults: pkg.numberOfAdults || 2,
        numberOfChildren: pkg.numberOfChildren || 0,
        customerBudget: pkg.customerBudget || 0,
        specialRequirements: pkg.specialRequirements || '',
        accommodationPreference: pkg.accommodationPreference || '',
        transportPreference: pkg.transportPreference || '',
        mealPreference: pkg.mealPreference || '',
      });

      setPackageInfo({
        title: pkg.title || '',
        destinations: pkg.destinations || [],
        newDestination: '',
        numberOfNights: pkg.numberOfNights || 2,
        numberOfDays: pkg.numberOfDays || 3,
      });

      setPricingInfo({
        quotedPricePerHead: pkg.quotedPricePerHead || 0,
        costPrice: pkg.costPrice || 0,
        discountAmount: pkg.discountAmount || 0,
        internalNotes: pkg.internalNotes || '',
        inclusions: pkg.inclusions || [],
        newInclusion: '',
        exclusions: pkg.exclusions || [],
        newExclusion: '',
        quoteValidUntil: pkg.quoteValidUntil ? new Date(pkg.quoteValidUntil).toISOString().split('T')[0] : '',
        status: pkg.status || CustomPackageStatus.DRAFT,
      });

      setItineraries(
        (pkg.itineraries || [])
          .sort((a, b) => a.dayNumber - b.dayNumber)
          .map((it) => ({
            dayNumber: it.dayNumber,
            title: it.title || `Day ${it.dayNumber}`,
            destination: it.destination || '',
            activities: it.activities || '',
            accommodationName: it.accommodationName || '',
            accommodationCost: it.accommodationCost || 0,
            transportDetails: it.transportDetails || '',
            transportCost: it.transportCost || 0,
            mealsIncluded: it.mealsIncluded || ['breakfast'],
            notes: it.notes || '',
            estimatedDayCost: it.estimatedDayCost || 0,
          }))
      );

      setInitialized(true);
    }
  }, [pkg, initialized]);

  // Adjust itineraries based on packageInfo.numberOfDays
  useEffect(() => {
    if (!initialized) return;
    const days = packageInfo.numberOfDays || 1;
    setItineraries((prev) => {
      const adjusted = [...prev];
      if (adjusted.length < days) {
        for (let i = adjusted.length; i < days; i++) {
          adjusted.push({
            dayNumber: i + 1,
            title: `Day ${i + 1} Itinerary`,
            destination: packageInfo.destinations[0] || '',
            activities: '',
            accommodationName: '',
            accommodationCost: 0,
            transportDetails: '',
            transportCost: 0,
            mealsIncluded: ['breakfast'],
            notes: '',
            estimatedDayCost: 0,
          });
        }
      } else if (adjusted.length > days) {
        adjusted.splice(days);
      }
      return adjusted;
    });
  }, [packageInfo.numberOfDays, packageInfo.destinations, initialized]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!clientInfo.customerName.trim()) newErrors.customerName = 'Customer name is required';
      if (!clientInfo.customerPhone.trim()) newErrors.customerPhone = 'Customer phone is required';
      if (!clientInfo.travelStartDate) newErrors.travelStartDate = 'Start date is required';
      if (!clientInfo.travelEndDate) newErrors.travelEndDate = 'End date is required';
    } else if (step === 2) {
      if (!packageInfo.title.trim()) newErrors.title = 'Proposal title is required';
      if (packageInfo.destinations.length === 0) newErrors.destinations = 'At least one destination is required';
    } else if (step === 3) {
      itineraries.forEach((it, idx) => {
        if (!it.title.trim()) newErrors[`itinerary_${idx}_title`] = `Day ${idx + 1} title is required`;
        if (!it.activities.trim()) newErrors[`itinerary_${idx}_activities`] = `Day ${idx + 1} activities are required`;
      });
    } else if (step === 4) {
      if (pricingInfo.quotedPricePerHead <= 0) newErrors.quotedPricePerHead = 'Quoted price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Please complete all required fields.');
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addDestination = () => {
    const dest = packageInfo.newDestination.trim();
    if (dest && !packageInfo.destinations.includes(dest)) {
      setPackageInfo((prev) => ({
        ...prev,
        destinations: [...prev.destinations, dest],
        newDestination: '',
      }));
    }
  };

  const removeDestination = (idx: number) => {
    setPackageInfo((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== idx),
    }));
  };

  const addInclusion = () => {
    const inc = pricingInfo.newInclusion.trim();
    if (inc && !pricingInfo.inclusions.includes(inc)) {
      setPricingInfo((prev) => ({
        ...prev,
        inclusions: [...prev.inclusions, inc],
        newInclusion: '',
      }));
    }
  };

  const removeInclusion = (idx: number) => {
    setPricingInfo((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== idx),
    }));
  };

  const addExclusion = () => {
    const exc = pricingInfo.newExclusion.trim();
    if (exc && !pricingInfo.exclusions.includes(exc)) {
      setPricingInfo((prev) => ({
        ...prev,
        exclusions: [...prev.exclusions, exc],
        newExclusion: '',
      }));
    }
  };

  const removeExclusion = (idx: number) => {
    setPricingInfo((prev) => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== idx),
    }));
  };

  const handleItineraryChange = (idx: number, field: keyof CreateCustomPackageItineraryDto, value: any) => {
    setItineraries((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  };

  const handleUpdateProposal = async (status: CustomPackageStatus) => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      toast.error('Form contains validation errors. Please review all steps.');
      return;
    }

    const payload: UpdateCustomPackageDto = {
      leadId: clientInfo.leadId || undefined,
      customerName: clientInfo.customerName,
      customerEmail: clientInfo.customerEmail,
      customerPhone: clientInfo.customerPhone,
      travelStartDate: clientInfo.travelStartDate,
      travelEndDate: clientInfo.travelEndDate,
      numberOfAdults: clientInfo.numberOfAdults,
      numberOfChildren: clientInfo.numberOfChildren,
      customerBudget: clientInfo.customerBudget || undefined,
      specialRequirements: clientInfo.specialRequirements || undefined,
      accommodationPreference: clientInfo.accommodationPreference || undefined,
      transportPreference: clientInfo.transportPreference || undefined,
      mealPreference: clientInfo.mealPreference || undefined,
      title: packageInfo.title,
      destinations: packageInfo.destinations,
      numberOfNights: packageInfo.numberOfNights,
      numberOfDays: packageInfo.numberOfDays,
      itineraries: itineraries as any,
      inclusions: pricingInfo.inclusions,
      exclusions: pricingInfo.exclusions,
      internalNotes: pricingInfo.internalNotes || undefined,
      status,
      quotedPricePerHead: pricingInfo.quotedPricePerHead,
      costPrice: pricingInfo.costPrice || undefined,
      discountAmount: pricingInfo.discountAmount || 0,
      totalQuotedPrice: pricingInfo.quotedPricePerHead * (clientInfo.numberOfAdults + clientInfo.numberOfChildren),
      quoteValidUntil: pricingInfo.quoteValidUntil || undefined,
    };

    await updateCustomPackageMutation.mutateAsync({ id, data: payload });
  };

  if (isPkgLoading) {
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

  const totalPax = clientInfo.numberOfAdults + clientInfo.numberOfChildren;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 shadow-xl text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <button
            onClick={() => router.push('/dashboard/packages')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Packages Catalog
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-indigo-200 text-sm font-semibold uppercase tracking-wider">Proposal Editor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Edit Custom Package Quote ✏️</h1>
          <p className="text-indigo-150 text-base mt-2">Update customer details, pricing rules, or modify itineraries dynamically.</p>
        </div>
      </div>

      {/* Step Progress bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div
                onClick={() => currentStep > s.id && setCurrentStep(s.id)}
                className={`flex items-center gap-3 cursor-pointer transition-all ${
                  currentStep === s.id
                    ? 'text-indigo-600 scale-105 font-bold'
                    : currentStep > s.id
                    ? 'text-emerald-600 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-sm transition-colors ${
                    currentStep === s.id
                      ? 'bg-indigo-600 text-white shadow-indigo-200'
                      : currentStep > s.id
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                  }`}
                >
                  {s.icon}
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step 0{s.id}</p>
                  <p className="text-sm">{s.title}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-0.5 bg-slate-100 rounded-full mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8">

        {/* STEP 1: CLIENT INFO */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" /> Lead & Client Identity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Optional Lead Link */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Link Existing CRM Lead (Optional)</label>
                <select
                  value={clientInfo.leadId}
                  onChange={(e) => setClientInfo({ ...clientInfo, leadId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-slate-800 bg-slate-50 text-sm"
                >
                  <option value="">-- select lead to prefill credentials --</option>
                  {leads?.map((l) => (
                    <option key={l.id} value={l.id}>
                      👤 {l.name} ({l.phone}) - {l.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Client Name *</label>
                <input
                  type="text"
                  required
                  value={clientInfo.customerName}
                  onChange={(e) => setClientInfo({ ...clientInfo, customerName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm ${
                    errors.customerName ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {errors.customerName && <p className="text-red-550 text-xs">{errors.customerName}</p>}
              </div>

              {/* Customer Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={clientInfo.customerPhone}
                  onChange={(e) => setClientInfo({ ...clientInfo, customerPhone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm ${
                    errors.customerPhone ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {errors.customerPhone && <p className="text-red-550 text-xs">{errors.customerPhone}</p>}
              </div>

              {/* Customer Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Email Address</label>
                <input
                  type="email"
                  value={clientInfo.customerEmail}
                  onChange={(e) => setClientInfo({ ...clientInfo, customerEmail: e.target.value })}
                  placeholder="e.g. client@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              {/* Customer Budget */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Estimated Budget (INR)</label>
                <input
                  type="number"
                  value={clientInfo.customerBudget || ''}
                  onChange={(e) => setClientInfo({ ...clientInfo, customerBudget: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Departure/Start Date *</label>
                <input
                  type="date"
                  required
                  value={clientInfo.travelStartDate}
                  onChange={(e) => setClientInfo({ ...clientInfo, travelStartDate: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm ${
                    errors.travelStartDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {errors.travelStartDate && <p className="text-red-550 text-xs">{errors.travelStartDate}</p>}
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Return/End Date *</label>
                <input
                  type="date"
                  required
                  value={clientInfo.travelEndDate}
                  onChange={(e) => setClientInfo({ ...clientInfo, travelEndDate: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm ${
                    errors.travelEndDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {errors.travelEndDate && <p className="text-red-550 text-xs">{errors.travelEndDate}</p>}
              </div>

              {/* Number of Adults */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Number of Adults</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setClientInfo({ ...clientInfo, numberOfAdults: Math.max(1, clientInfo.numberOfAdults - 1) })}
                    className="p-2 border border-slate-200 bg-slate-55 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="font-bold text-slate-800 w-8 text-center">{clientInfo.numberOfAdults}</span>
                  <button
                    type="button"
                    onClick={() => setClientInfo({ ...clientInfo, numberOfAdults: clientInfo.numberOfAdults + 1 })}
                    className="p-2 border border-slate-200 bg-slate-55 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Number of Children */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Number of Children</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setClientInfo({ ...clientInfo, numberOfChildren: Math.max(0, clientInfo.numberOfChildren - 1) })}
                    className="p-2 border border-slate-200 bg-slate-55 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="font-bold text-slate-800 w-8 text-center">{clientInfo.numberOfChildren}</span>
                  <button
                    type="button"
                    onClick={() => setClientInfo({ ...clientInfo, numberOfChildren: clientInfo.numberOfChildren + 1 })}
                    className="p-2 border border-slate-200 bg-slate-55 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Travel Preferences */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 border border-slate-200/50 rounded-2xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accommodation preference</label>
                  <input
                    type="text"
                    value={clientInfo.accommodationPreference}
                    onChange={(e) => setClientInfo({ ...clientInfo, accommodationPreference: e.target.value })}
                    placeholder="e.g. Deluxe Room or Homestay"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transport preference</label>
                  <input
                    type="text"
                    value={clientInfo.transportPreference}
                    onChange={(e) => setClientInfo({ ...clientInfo, transportPreference: e.target.value })}
                    placeholder="e.g. Private Innova / Sedan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meal preference</label>
                  <input
                    type="text"
                    value={clientInfo.mealPreference}
                    onChange={(e) => setClientInfo({ ...clientInfo, mealPreference: e.target.value })}
                    placeholder="e.g. Breakfast & Dinner (MAPAI)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Special Requirements */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Special Notes or Dietary Requirements</label>
                <textarea
                  value={clientInfo.specialRequirements}
                  onChange={(e) => setClientInfo({ ...clientInfo, specialRequirements: e.target.value })}
                  placeholder="Describe any special instructions, physical constraints, or custom requests."
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PACKAGE DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" /> Proposal Config & Scope
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Custom Package Title *</label>
                <input
                  type="text"
                  required
                  value={packageInfo.title}
                  onChange={(e) => setPackageInfo({ ...packageInfo, title: e.target.value })}
                  placeholder="e.g. Bespoke Darjeeling & Sikkim Getaway"
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {errors.title && <p className="text-red-550 text-xs">{errors.title}</p>}
              </div>

              {/* Nights */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Nights</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={packageInfo.numberOfNights}
                  onChange={(e) => setPackageInfo({ ...packageInfo, numberOfNights: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-550 outline-none text-sm"
                />
              </div>

              {/* Days */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Days</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={packageInfo.numberOfDays}
                  onChange={(e) => setPackageInfo({ ...packageInfo, numberOfDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-550 outline-none text-sm"
                />
              </div>

              {/* Destinations covered */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-800">Destinations Covered *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={packageInfo.newDestination}
                    onChange={(e) => setPackageInfo({ ...packageInfo, newDestination: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
                    placeholder="Type destination and press Enter or Add button"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addDestination}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-bold transition-all text-sm shadow-md"
                  >
                    Add
                  </button>
                </div>
                {errors.destinations && <p className="text-red-550 text-xs">{errors.destinations}</p>}

                {/* Destinations tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {packageInfo.destinations.map((dest, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs rounded-full flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {dest}
                      <button
                        type="button"
                        onClick={() => removeDestination(idx)}
                        className="w-4 h-4 bg-indigo-200 hover:bg-indigo-300 text-indigo-850 rounded-full flex items-center justify-center text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {packageInfo.destinations.length === 0 && (
                    <p className="text-slate-400 text-xs italic">No destinations added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ITINERARY PLAN */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Day-by-Day Custom Itinerary
            </h2>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {itineraries.map((it, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-base">
                      <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {it.dayNumber}
                      </span>
                      Day {it.dayNumber} Config
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Day Title */}
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Day Title *</label>
                      <input
                        type="text"
                        required
                        value={it.title}
                        onChange={(e) => handleItineraryChange(idx, 'title', e.target.value)}
                        placeholder="e.g. Arrival in Darjeeling & Sunset Stroll"
                        className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-550 outline-none text-sm ${
                          errors[`itinerary_${idx}_title`] ? 'border-red-300 bg-red-55' : 'border-slate-200'
                        }`}
                      />
                    </div>

                    {/* Day Destination */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</label>
                      <input
                        type="text"
                        value={it.destination}
                        onChange={(e) => handleItineraryChange(idx, 'destination', e.target.value)}
                        placeholder="e.g. Darjeeling"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                      />
                    </div>

                    {/* Day Activities */}
                    <div className="md:col-span-3 flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activities Description *</label>
                      <textarea
                        required
                        value={it.activities}
                        onChange={(e) => handleItineraryChange(idx, 'activities', e.target.value)}
                        placeholder="Describe the day's events, tour guidelines, sightseeing activities..."
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm resize-none ${
                          errors[`itinerary_${idx}_activities`] ? 'border-red-300 bg-red-55' : 'border-slate-200'
                        }`}
                      />
                    </div>

                    {/* Accommodation info */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stay Place Name</label>
                      <input
                        type="text"
                        value={it.accommodationName || ''}
                        onChange={(e) => handleItineraryChange(idx, 'accommodationName', e.target.value)}
                        placeholder="e.g. Elgin Hotel / Homestay"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                      />
                    </div>

                    {/* Accommodation Cost */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stay Cost (Internal)</label>
                      <input
                        type="number"
                        value={it.accommodationCost || ''}
                        onChange={(e) => handleItineraryChange(idx, 'accommodationCost', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 3500"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                      />
                    </div>

                    {/* Transport Details */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transport Details</label>
                      <input
                        type="text"
                        value={it.transportDetails || ''}
                        onChange={(e) => handleItineraryChange(idx, 'transportDetails', e.target.value)}
                        placeholder="e.g. SUV pick-up"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                      />
                    </div>

                    {/* Transport Cost */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transport Cost (Internal)</label>
                      <input
                        type="number"
                        value={it.transportCost || ''}
                        onChange={(e) => handleItineraryChange(idx, 'transportCost', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 2500"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                      />
                    </div>

                    {/* Driving distance */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driving Distance (KM)</label>
                      <input
                        type="number"
                        value={it.drivingDistanceKm || ''}
                        onChange={(e) => handleItineraryChange(idx, 'drivingDistanceKm', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 75"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                      />
                    </div>

                    {/* Estimated Day Cost */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Total Cost</label>
                      <input
                        type="number"
                        value={it.estimatedDayCost || ''}
                        onChange={(e) => handleItineraryChange(idx, 'estimatedDayCost', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 6000"
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: PRICING & TIERS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-indigo-600" /> Proposal Financials & Inclusions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Internal Cost Price (Total Proposal Cost)</label>
                <input
                  type="number"
                  value={pricingInfo.costPrice || ''}
                  onChange={(e) => setPricingInfo({ ...pricingInfo, costPrice: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 35000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                />
              </div>

              {/* Quoted Price per Head */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Quoted Price Per Head (Selling Price) *</label>
                <input
                  type="number"
                  required
                  value={pricingInfo.quotedPricePerHead || ''}
                  onChange={(e) => setPricingInfo({ ...pricingInfo, quotedPricePerHead: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 12500"
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm ${
                    errors.quotedPricePerHead ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {errors.quotedPricePerHead && <p className="text-red-550 text-xs">{errors.quotedPricePerHead}</p>}
              </div>

              {/* Discount Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Discount Amount (Total Package)</label>
                <input
                  type="number"
                  value={pricingInfo.discountAmount || ''}
                  onChange={(e) => setPricingInfo({ ...pricingInfo, discountAmount: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 2000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                />
              </div>

              {/* Validity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Quote Validity Deadline</label>
                <input
                  type="date"
                  value={pricingInfo.quoteValidUntil}
                  onChange={(e) => setPricingInfo({ ...pricingInfo, quoteValidUntil: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm text-slate-850"
                />
              </div>

              {/* Inclusions list */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-800">Inclusions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pricingInfo.newInclusion}
                    onChange={(e) => setPricingInfo({ ...pricingInfo, newInclusion: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
                    placeholder="Type inclusion and press Enter or Add button"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addInclusion}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-bold transition-all text-sm shadow-md"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pricingInfo.inclusions.map((inc, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-250 text-emerald-700 font-semibold text-xs rounded-full flex items-center gap-1.5"
                    >
                      ✓ {inc}
                      <button
                        type="button"
                        onClick={() => removeInclusion(idx)}
                        className="w-4 h-4 bg-emerald-200 hover:bg-emerald-355 text-emerald-850 rounded-full flex items-center justify-center text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Exclusions list */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-800">Exclusions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pricingInfo.newExclusion}
                    onChange={(e) => setPricingInfo({ ...pricingInfo, newExclusion: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
                    placeholder="Type exclusion and press Enter or Add button"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addExclusion}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-bold transition-all text-sm shadow-md"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pricingInfo.exclusions.map((exc, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-red-50 border border-red-250 text-red-700 font-semibold text-xs rounded-full flex items-center gap-1.5"
                    >
                      ✕ {exc}
                      <button
                        type="button"
                        onClick={() => removeExclusion(idx)}
                        className="w-4 h-4 bg-red-200 hover:bg-red-355 text-red-850 rounded-full flex items-center justify-center text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-800">Internal Office Notes (Not visible to client)</label>
                <textarea
                  value={pricingInfo.internalNotes}
                  onChange={(e) => setPricingInfo({ ...pricingInfo, internalNotes: e.target.value })}
                  placeholder="Add secret pricing logic, room negotiations details, client follow-up details..."
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/40 outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" /> Review Updated Proposal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Client metadata */}
              <div className="md:col-span-1 space-y-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm text-slate-700">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" /> Client Metadata
                </h3>
                <div className="space-y-2">
                  <p><span className="font-bold text-slate-900">Name:</span> {clientInfo.customerName}</p>
                  <p><span className="font-bold text-slate-900">Phone:</span> {clientInfo.customerPhone}</p>
                  <p><span className="font-bold text-slate-900">Email:</span> {clientInfo.customerEmail || '-'}</p>
                  <p><span className="font-bold text-slate-900">Travel Dates:</span> {clientInfo.travelStartDate} to {clientInfo.travelEndDate}</p>
                  <p><span className="font-bold text-slate-900">Pax:</span> {clientInfo.numberOfAdults} Adults {clientInfo.numberOfChildren > 0 && `, ${clientInfo.numberOfChildren} Children`}</p>
                  <p><span className="font-bold text-slate-900">Budget:</span> {clientInfo.customerBudget ? `₹${clientInfo.customerBudget.toLocaleString()}` : '-'}</p>
                  <p><span className="font-bold text-slate-900">Status:</span> {pricingInfo.status}</p>
                </div>
              </div>

              {/* Middle Column: Package details */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm text-slate-700">
                  <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-600" /> Proposal Identity
                  </h3>
                  <div className="space-y-2 mt-2">
                    <p><span className="font-bold text-slate-900">Proposal Name:</span> {packageInfo.title}</p>
                    <p><span className="font-bold text-slate-900">Duration:</span> {packageInfo.numberOfNights} Nights / {packageInfo.numberOfDays} Days</p>
                    <p><span className="font-bold text-slate-900">Destinations:</span> {packageInfo.destinations.join(', ')}</p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm text-slate-700">
                  <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-indigo-600" /> Quote & Price Summary
                  </h3>
                  <div className="space-y-2.5 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-650">Price Per Head:</span>
                      <span className="font-bold text-slate-900">₹{pricingInfo.quotedPricePerHead.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-650">Total Pax:</span>
                      <span className="font-bold text-slate-900">{totalPax} Pax</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-650">Discount Amount:</span>
                      <span className="font-bold text-red-600">- ₹{pricingInfo.discountAmount.toLocaleString()}</span>
                    </div>
                    <hr className="border-slate-200" />
                    <div className="flex justify-between text-base">
                      <span className="font-black text-slate-900">Total Client Price:</span>
                      <span className="font-black text-emerald-700">
                        ₹{Math.max(0, (pricingInfo.quotedPricePerHead * totalPax) - pricingInfo.discountAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            )}
          </div>

          <div className="text-sm font-semibold text-indigo-600">
            Step {currentStep} of {steps.length}
          </div>

          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl transition-all font-bold flex items-center gap-2 text-sm shadow-md"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={updateCustomPackageMutation.isPending}
                  onClick={() => handleUpdateProposal(pricingInfo.status)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {updateCustomPackageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
                {pricingInfo.status === CustomPackageStatus.DRAFT && (
                  <button
                    type="button"
                    disabled={updateCustomPackageMutation.isPending}
                    onClick={() => handleUpdateProposal(CustomPackageStatus.QUOTE_SENT)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all font-bold flex items-center gap-2 text-sm shadow-lg disabled:opacity-50"
                  >
                    {updateCustomPackageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Send Quote proposal
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
