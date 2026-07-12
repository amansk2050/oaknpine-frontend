'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Package,
  Calendar,
  IndianRupee,
  ClipboardList,
  Eye,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  StepIndicator,
  BasicInfoForm,
  ItineraryForm,
  PricingForm,
  InclusionsForm,
  ReviewForm,
} from '@/components/packages';
import {
  usePackage,
  useUpdatePackage,
  UpdatePackageDto,
  CreatePackageItineraryDto,
  CreatePackagePricingDto,
  CreatePackageInclusionDto,
  PackageType,
  PackageStatus,
  PackageCategory,
} from '@/services/packages';

const steps = [
  { id: 1, title: 'Basic Info', icon: <Package className="w-5 h-5 text-white" /> },
  { id: 2, title: 'Itinerary', icon: <Calendar className="w-5 h-5 text-white" /> },
  { id: 3, title: 'Pricing', icon: <IndianRupee className="w-5 h-5 text-white" /> },
  { id: 4, title: 'Inclusions', icon: <ClipboardList className="w-5 h-5 text-white" /> },
  { id: 5, title: 'Review', icon: <Eye className="w-5 h-5 text-white" /> },
];

export default function EditPackagePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { data: pkg, isLoading, isError } = usePackage(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<Record<string, unknown>>({});
  const [itineraries, setItineraries] = useState<CreatePackageItineraryDto[]>([]);
  const [pricingTiers, setPricingTiers] = useState<CreatePackagePricingDto[]>([]);
  const [inclusions, setInclusions] = useState<CreatePackageInclusionDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Pre-populate form once package loads
  useEffect(() => {
    if (pkg && !initialized) {
      setBasicInfo({
        name: pkg.name || '',
        shortTitle: pkg.shortTitle || '',
        description: pkg.description || '',
        packageType: pkg.packageType || PackageType.PREDEFINED,
        // Map single category → array for multi-select UI
        categories: pkg.category ? [pkg.category] : [] as PackageCategory[],
        numberOfNights: pkg.numberOfNights || 2,
        numberOfDays: pkg.numberOfDays || 3,
        destination: pkg.destination || '',
        startingPoint: pkg.startingPoint || '',
        endingPoint: pkg.endingPoint || '',
        destinationsCovered: pkg.destinationsCovered || [],
        minPersons: pkg.minPersons || 2,
        maxPersons: pkg.maxPersons || 10,
        minPricePerHead: pkg.minPricePerHead || 0,
        basePricePerHead: pkg.basePricePerHead || 0,
        bestTimeToVisit: pkg.bestTimeToVisit || '',
        difficultyLevel: pkg.difficultyLevel || '',
        suitableFor: pkg.suitableFor || [],
        highlights: pkg.highlights || [],
        thumbnailImage: pkg.thumbnailImage || '',
        status: pkg.status || PackageStatus.DRAFT,
        isFeatured: pkg.isFeatured || false,
        tags: pkg.tags || [],
      });

      // Map existing itineraries to DTO shape
      setItineraries(
        (pkg.itineraries || [])
          .sort((a, b) => a.dayNumber - b.dayNumber)
          .map((it) => ({
            dayNumber: it.dayNumber,
            title: it.title,
            description: it.description,
            placesToVisit: it.placesToVisit || [],
            activities: it.activities || [],
            mealsIncluded: it.mealsIncluded || [],
            accommodation: it.accommodation || '',
            drivingDistanceKm: it.drivingDistanceKm,
            drivingTime: it.drivingTime || '',
            altitude: it.altitude || '',
            morningActivities: it.morningActivities || '',
            afternoonActivities: it.afternoonActivities || '',
            eveningActivities: it.eveningActivities || '',
            tips: it.tips || '',
            images: it.images || [],
            hasOvernightStay: it.hasOvernightStay ?? true,
          }))
      );

      // Map existing pricing tiers to DTO shape
      setPricingTiers(
        (pkg.pricingTiers || []).map((tier) => ({
          numberOfPersons: tier.numberOfPersons,
          roomType: tier.roomType,
          seasonType: tier.seasonType,
          pricePerHead: tier.pricePerHead,
          costPricePerHead: tier.costPricePerHead,
          minPricePerHead: tier.minPricePerHead,
          maxDiscountPercent: tier.maxDiscountPercent || 10,
          transportCost: tier.transportCost,
          accommodationCost: tier.accommodationCost,
          mealCost: tier.mealCost,
          sightseeingCost: tier.sightseeingCost,
          validFrom: tier.validFrom,
          validUntil: tier.validUntil,
          isDefault: tier.isDefault,
          notes: tier.notes || '',
        }))
      );

      // Map existing inclusions to DTO shape
      setInclusions(
        (pkg.inclusions || [])
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((inc) => ({
            type: inc.type,
            category: inc.category,
            description: inc.description,
            iconName: inc.iconName,
            displayOrder: inc.displayOrder,
            isHighlight: inc.isHighlight,
          }))
      );

      setInitialized(true);
    }
  }, [pkg, initialized]);

  // Save draft — stays on the page
  const saveMutation = useUpdatePackage({
    onSuccess: () => {
      toast.success('✅ Changes saved successfully!');
    },
    onError: (error) => {
      toast.error(`❌ Failed to save: ${error.message || 'Something went wrong'}`);
    },
  });

  // Publish — saves with Active status and redirects
  const publishMutation = useUpdatePackage({
    onSuccess: () => {
      toast.success('🚀 Package published successfully!');
      router.push(`/dashboard/packages/${id}`);
    },
    onError: (error) => {
      toast.error(`❌ Failed to publish: ${error.message || 'Something went wrong'}`);
    },
  });

  const isSaving = saveMutation.isPending;
  const isPublishing = publishMutation.isPending;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!basicInfo.name || !(basicInfo.name as string).trim()) newErrors.name = 'Package name is required';
      if (!basicInfo.description || !(basicInfo.description as string).trim()) newErrors.description = 'Description is required';
      if (!basicInfo.categories || (basicInfo.categories as PackageCategory[]).length === 0) {
        newErrors.categories = 'Please select at least one category';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      try {
        await saveMutation.mutateAsync({ id, data: buildUpdatePayload() });
        setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      } catch {
        // Error is handled by mutateAsync onError toast
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = async (step: number) => {
    if (step < currentStep) {
      try {
        await saveMutation.mutateAsync({ id, data: buildUpdatePayload() });
        setCurrentStep(step);
      } catch {
        // Error handled
      }
    } else if (step === currentStep + 1 && validateStep(currentStep)) {
      try {
        await saveMutation.mutateAsync({ id, data: buildUpdatePayload() });
        setCurrentStep(step);
      } catch {
        // Error handled
      }
    }
  };

  const buildUpdatePayload = (status?: PackageStatus): UpdatePackageDto => {
    const { categories, ...rest } = basicInfo as { categories: PackageCategory[]; [key: string]: unknown };
    return {
      ...(rest as UpdatePackageDto),
      category: categories?.[0] ?? PackageCategory.ADVENTURE,
      ...(status ? { status } : {}),
      itineraries: itineraries.filter((it) => it.title),
      pricingTiers,
      inclusions,
    };
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync({ id, data: buildUpdatePayload() });
  };

  const handlePublish = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      toast.error('⚠️ Please complete the basic information before publishing');
      return;
    }
    await publishMutation.mutateAsync({ id, data: buildUpdatePayload(PackageStatus.ACTIVE) });
  };

  // ── Loading / Error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-lg font-bold text-red-600">Package not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
    );
  }

  // ── Step content ─────────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoForm
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={basicInfo as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(data: any) => setBasicInfo(data)}
            errors={errors}
          />
        );
      case 2:
        return (
          <ItineraryForm
            itineraries={itineraries}
            numberOfDays={(basicInfo.numberOfDays as number) || 1}
            onChange={setItineraries}
          />
        );
      case 3:
        return (
          <PricingForm
            pricingTiers={pricingTiers}
            onChange={setPricingTiers}
            itineraries={itineraries}
            onItinerariesChange={setItineraries}
          />
        );
      case 4:
        return (
          <InclusionsForm
            inclusions={inclusions}
            onChange={setInclusions}
          />
        );
      case 5:
        return (
          <ReviewForm
            basicInfo={basicInfo}
            itineraries={itineraries}
            pricingTiers={pricingTiers}
            inclusions={inclusions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-2xl p-8 mb-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Packages
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-indigo-300 text-sm font-medium">Edit Package</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {pkg.name} ✏️
          </h1>
          <p className="text-slate-300 text-lg">
            Update the package details below
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {initialized ? renderStepContent() : (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
              Step {currentStep} of {steps.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || isPublishing}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isSaving || isPublishing}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isPublishing ? 'Publishing...' : 'Save & Publish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
