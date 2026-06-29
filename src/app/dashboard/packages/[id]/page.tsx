'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  usePackage,
  PackageStatus,
  PackageCategory,
  PackageItinerary,
  PackagePricing,
  PackageInclusion,
} from '@/services/packages';
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Sparkles,
  Loader2,
  CheckCircle2,
  ClipboardList,
  Image as ImageIcon,
  Info,
  Package,
  Share2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

function getStatusBadge(status: PackageStatus) {
  const configs = {
    [PackageStatus.ACTIVE]: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '✅ Active' },
    [PackageStatus.INACTIVE]: { bg: 'bg-slate-100', text: 'text-slate-700', label: '⏸️ Inactive' },
    [PackageStatus.DRAFT]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '📝 Draft' },
  };
  const config = configs[status] || configs[PackageStatus.DRAFT];
  return (
    <span className={`px-2 py-1 ${config.bg} ${config.text} text-xs font-bold rounded-full`}>
      {config.label}
    </span>
  );
}

function getCategoryBadge(category: PackageCategory) {
  const configs: Record<PackageCategory, { emoji: string; label: string }> = {
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
  const config = configs[category] || { emoji: '📦', label: category };
  return (
    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
      {config.emoji} {config.label}
    </span>
  );
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { data: pkg, isLoading, isError } = usePackage(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Info className="w-10 h-10 text-red-500 mb-2" />
        <p className="text-lg font-bold text-red-600 mb-2">Package not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    );
  }

  // Calculate min pricing
  const minPricing =
    pkg.pricingTiers?.reduce(
      (min, tier) => (tier.pricePerHead < min ? tier.pricePerHead : min),
      pkg.basePricePerHead
    ) || pkg.basePricePerHead;

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-2xl p-8 mb-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Packages
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/dashboard/packages/${id}/edit`)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-all font-semibold flex items-center gap-2 text-xs shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Package
                </button>
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/packages/${id}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('📋 Link copied to clipboard!');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-semibold flex items-center gap-2 text-xs shadow-sm border border-emerald-500/20"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Public Link
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-indigo-300 text-sm font-medium">Package Details</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{pkg.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(pkg.status)}
              {pkg.isFeatured && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
              {getCategoryBadge(pkg.category)}
            </div>
            <p className="text-slate-300 text-lg max-w-2xl">{pkg.description}</p>
          </div>
          <div className="hidden md:block">
            <div className="w-56 h-40 rounded-2xl overflow-hidden shadow-lg border-4 border-white/20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              {pkg.thumbnailImage ? (
                <img src={pkg.thumbnailImage} alt={pkg.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-20 h-20 text-white/40" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trip Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center gap-2 text-slate-700 text-sm">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>{pkg.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-sm">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>
                  {pkg.numberOfNights}N/{pkg.numberOfDays}D
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span>
                  {pkg.minPersons}-{pkg.maxPersons} pax
                </span>
              </div>
              {pkg.bestTimeToVisit && (
                <div className="flex items-center gap-2 text-slate-700 text-sm">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Best: {pkg.bestTimeToVisit}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {pkg.tags?.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          {pkg.images && pkg.images.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900">Gallery</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pkg.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Package Image ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-xl border border-slate-100"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {pkg.highlights && pkg.highlights.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-slate-900">Highlights</h2>
              </div>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                {pkg.highlights.map((hl, idx) => (
                  <li key={idx}>{hl}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Itinerary */}
          <ItinerarySection itineraries={pkg.itineraries} />

          {/* Pricing */}
          <PricingSection pricingTiers={pkg.pricingTiers} />

          {/* Inclusions */}
          <InclusionsSection inclusions={pkg.inclusions} />
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-8">
          {/* Pricing Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="w-5 h-5 text-emerald-500" />
              <span className="text-slate-500 text-sm font-medium">Starting from</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600 flex items-center mb-1">
              <IndianRupee className="w-6 h-6" />
              {Number(minPricing).toLocaleString('en-IN')}
              <span className="text-base text-slate-500 font-normal ml-1">/person</span>
            </p>
            <p className="text-xs text-slate-500">* Price may vary based on group size, season, and room type.</p>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
              <span className="text-slate-900 font-bold">Quick Info</span>
            </div>
            <ul className="text-slate-700 text-sm space-y-2">
              <li>
                <b>Package Code:</b> {pkg.packageCode}
              </li>
              {pkg.startingPoint && (
                <li>
                  <b>Start:</b> {pkg.startingPoint}
                </li>
              )}
              {pkg.endingPoint && (
                <li>
                  <b>End:</b> {pkg.endingPoint}
                </li>
              )}
              {pkg.difficultyLevel && (
                <li>
                  <b>Difficulty:</b> {pkg.difficultyLevel}
                </li>
              )}
              {pkg.suitableFor && pkg.suitableFor.length > 0 && (
                <li>
                  <b>Suitable For:</b> {pkg.suitableFor.join(', ')}
                </li>
              )}
              {pkg.destinationsCovered && pkg.destinationsCovered.length > 0 && (
                <li>
                  <b>Destinations Covered:</b> {pkg.destinationsCovered.join(', ')}
                </li>
              )}
            </ul>
          </div>

          {/* Notes */}
          {(pkg.importantNotes || pkg.cancellationPolicy) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-500" />
                <span className="text-slate-900 font-bold">Important Notes</span>
              </div>
              {pkg.importantNotes && (
                <div className="mb-2 text-slate-700 text-sm whitespace-pre-line">{pkg.importantNotes}</div>
              )}
              {pkg.cancellationPolicy && (
                <div className="text-xs text-slate-500">
                  <b>Cancellation Policy:</b> {pkg.cancellationPolicy}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Itinerary Section
function ItinerarySection({ itineraries }: { itineraries: PackageItinerary[] }) {
  if (!itineraries || itineraries.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-bold text-slate-900">Itinerary</h2>
      </div>
      <div className="space-y-6">
        {itineraries
          .sort((a, b) => a.dayNumber - b.dayNumber)
          .map((it, idx) => (
            <div key={it.id} className="border-l-4 border-indigo-400 pl-4 py-2 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-600">Day {it.dayNumber}</span>
                <span className="text-slate-900 font-semibold">{it.title}</span>
                {it.hasOvernightStay && (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                    <CheckCircle2 className="w-3 h-3 inline" /> Overnight
                  </span>
                )}
              </div>
              <div className="text-slate-700 text-sm mb-1 whitespace-pre-line">{it.description}</div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {it.placesToVisit && it.placesToVisit.length > 0 && (
                  <span>
                    <b>Places:</b> {it.placesToVisit.join(', ')}
                  </span>
                )}
                {it.activities && it.activities.length > 0 && (
                  <span>
                    <b>Activities:</b> {it.activities.join(', ')}
                  </span>
                )}
                {it.mealsIncluded && it.mealsIncluded.length > 0 && (
                  <span>
                    <b>Meals:</b> {it.mealsIncluded.join(', ')}
                  </span>
                )}
                {it.accommodation && (
                  <span>
                    <b>Stay:</b> {it.accommodation}
                  </span>
                )}
                {it.drivingDistanceKm && (
                  <span>
                    <b>Drive:</b> {it.drivingDistanceKm} km
                  </span>
                )}
                {it.drivingTime && (
                  <span>
                    <b>Time:</b> {it.drivingTime}
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// Pricing Section
function PricingSection({ pricingTiers }: { pricingTiers: PackagePricing[] }) {
  if (!pricingTiers || pricingTiers.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <IndianRupee className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-bold text-slate-900">Pricing</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-2 text-left font-semibold">Persons</th>
              <th className="px-3 py-2 text-left font-semibold">Room Type</th>
              <th className="px-3 py-2 text-left font-semibold">Season</th>
              <th className="px-3 py-2 text-left font-semibold">Price/Head</th>
              <th className="px-3 py-2 text-left font-semibold">Total Price</th>
              <th className="px-3 py-2 text-left font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {pricingTiers
              .sort((a, b) => a.numberOfPersons - b.numberOfPersons)
              .map((tier) => (
                <tr key={tier.id} className="border-t">
                  <td className="px-3 py-2">{tier.numberOfPersons}</td>
                  <td className="px-3 py-2 capitalize">{tier.roomType}</td>
                  <td className="px-3 py-2 capitalize">{tier.seasonType}</td>
                  <td className="px-3 py-2 text-emerald-700 font-bold">
                    <IndianRupee className="w-4 h-4 inline" />{' '}
                    {Number(tier.pricePerHead).toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2">
                    <IndianRupee className="w-4 h-4 inline" />{' '}
                    {Number(tier.totalPrice).toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2">{tier.notes || '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inclusions Section
function InclusionsSection({ inclusions }: { inclusions: PackageInclusion[] }) {
  if (!inclusions || inclusions.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-900">Inclusions & Exclusions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-emerald-700 mb-2">Included</h3>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            {inclusions
              .filter((inc) => inc.type === 'included')
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((inc) => (
                <li key={inc.id}>
                  {inc.iconName && <span className="mr-1">{inc.iconName}</span>}
                  {inc.description}
                </li>
              ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-red-700 mb-2">Excluded</h3>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            {inclusions
              .filter((inc) => inc.type === 'excluded')
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((inc) => (
                <li key={inc.id}>
                  {inc.iconName && <span className="mr-1">{inc.iconName}</span>}
                  {inc.description}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
