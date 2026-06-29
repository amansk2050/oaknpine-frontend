'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Rocket,
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
  useCreatePackage,
  CreatePackageDto,
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

const initialBasicInfo = {
  name: '',
  shortTitle: '',
  description: '',
  packageType: PackageType.PREDEFINED,
  categories: [] as PackageCategory[],
  numberOfNights: 2,
  numberOfDays: 3,
  destination: '',
  startingPoint: '',
  endingPoint: '',
  destinationsCovered: [] as string[],
  minPersons: 2,
  maxPersons: 10,
  minPricePerHead: 0,
  basePricePerHead: 0,
  bestTimeToVisit: '',
  difficultyLevel: '',
  suitableFor: [] as string[],
  highlights: [] as string[],
  thumbnailImage: '',
  status: PackageStatus.DRAFT,
  isFeatured: false,
  tags: [] as string[],
};

export default function CreatePackagePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState(initialBasicInfo);
  const [itineraries, setItineraries] = useState<CreatePackageItineraryDto[]>([]);
  const [pricingTiers, setPricingTiers] = useState<CreatePackagePricingDto[]>([]);
  const [inclusions, setInclusions] = useState<CreatePackageInclusionDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createPackageMutation = useCreatePackage({
    onSuccess: (data) => {
      toast.success('Package created successfully! 🎉');
      router.push(`/dashboard/packages/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create package');
    },
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!basicInfo.name?.trim()) newErrors.name = 'Package name is required';
      if (!basicInfo.description?.trim()) newErrors.description = 'Description is required';
      if (!basicInfo.categories || basicInfo.categories.length === 0) {
        newErrors.categories = 'Please select at least one category';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === currentStep + 1 && validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleSaveDraft = async () => {
    const { categories, ...rest } = basicInfo;
    const packageData: CreatePackageDto = {
      ...rest as CreatePackageDto,
      category: categories?.[0] ?? PackageCategory.ADVENTURE,
      status: PackageStatus.DRAFT,
      itineraries: itineraries.filter((it) => it.title),
      pricingTiers,
      inclusions,
    };

    await createPackageMutation.mutateAsync(packageData);
  };

  const handlePublish = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      toast.error('Please complete the basic information');
      return;
    }

    const { categories, ...rest } = basicInfo;
    const packageData: CreatePackageDto = {
      ...rest as CreatePackageDto,
      category: categories?.[0] ?? PackageCategory.ADVENTURE,
      status: PackageStatus.ACTIVE,
      itineraries: itineraries.filter((it) => it.title),
      pricingTiers,
      inclusions,
    };

    await createPackageMutation.mutateAsync(packageData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoForm
            data={basicInfo as Parameters<typeof BasicInfoForm>[0]['data']}
            onChange={setBasicInfo}
            errors={errors}
          />
        );
      case 2:
        return (
          <ItineraryForm
            itineraries={itineraries}
            numberOfDays={basicInfo.numberOfDays || 1}
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
            <span className="text-indigo-300 text-sm font-medium">Create New Package</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Build Your Dream Package ✨</h1>
          <p className="text-slate-300 text-lg">
            Create an amazing tour experience step by step
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
        {renderStepContent()}
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
              onClick={handleSaveDraft}
              disabled={createPackageMutation.isPending}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {createPackageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Draft
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
                disabled={createPackageMutation.isPending}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50"
              >
                {createPackageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                Publish Package
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
