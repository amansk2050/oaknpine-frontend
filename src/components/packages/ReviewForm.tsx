'use client';

import React from 'react';
import {
  Package,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Star,
  Check,
  X,
  Clock,
  Mountain,
  Utensils,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  CreatePackageDto,
  CreatePackageItineraryDto,
  CreatePackagePricingDto,
  CreatePackageInclusionDto,
  PackageCategory,
  PackageStatus,
  InclusionType,
  MealType,
} from '@/services/packages/types';

interface ReviewFormProps {
  basicInfo: Partial<CreatePackageDto>;
  itineraries: CreatePackageItineraryDto[];
  pricingTiers: CreatePackagePricingDto[];
  inclusions: CreatePackageInclusionDto[];
}

const categoryLabels: Record<PackageCategory, { emoji: string; label: string }> = {
  [PackageCategory.ADVENTURE]: { emoji: '🏔️', label: 'Adventure' },
  [PackageCategory.HONEYMOON]: { emoji: '💕', label: 'Honeymoon' },
  [PackageCategory.FAMILY]: { emoji: '👨‍👩‍👧‍👦', label: 'Family' },
  [PackageCategory.BUDGET]: { emoji: '💰', label: 'Budget' },
  [PackageCategory.LUXURY]: { emoji: '✨', label: 'Luxury' },
  [PackageCategory.WEEKEND_GETAWAY]: { emoji: '🌴', label: 'Weekend Getaway' },
  [PackageCategory.PILGRIMAGE]: { emoji: '🙏', label: 'Pilgrimage' },
  [PackageCategory.WILDLIFE]: { emoji: '🦁', label: 'Wildlife' },
  [PackageCategory.CULTURAL]: { emoji: '🎭', label: 'Cultural' },
};

function calculateCompletionScore(
  basicInfo: Partial<CreatePackageDto>,
  itineraries: CreatePackageItineraryDto[],
  pricingTiers: CreatePackagePricingDto[],
  inclusions: CreatePackageInclusionDto[]
): number {
  let score = 0;
  const totalChecks = 10;

  if (basicInfo.name) score++;
  if (basicInfo.description) score++;
  if (basicInfo.destination) score++;
  if (basicInfo.numberOfNights && basicInfo.numberOfNights > 0) score++;
  if (basicInfo.minPricePerHead && basicInfo.minPricePerHead > 0) score++;
  if (basicInfo.category) score++;
  if (itineraries.filter((it) => it.title).length > 0) score++;
  if (pricingTiers.length > 0) score++;
  if (inclusions.filter((i) => i.type === InclusionType.INCLUDED).length > 0) score++;
  if (inclusions.filter((i) => i.type === InclusionType.EXCLUDED).length > 0) score++;

  return Math.round((score / totalChecks) * 100);
}

export function ReviewForm({ basicInfo, itineraries, pricingTiers, inclusions }: ReviewFormProps) {
  const includedItems = inclusions.filter((i) => i.type === InclusionType.INCLUDED);
  const excludedItems = inclusions.filter((i) => i.type === InclusionType.EXCLUDED);
  const filledItineraries = itineraries.filter((it) => it.title);
  const minPrice = pricingTiers.length > 0
    ? Math.min(...pricingTiers.map((p) => p.pricePerHead))
    : basicInfo.minPricePerHead || 0;

  const completionScore = calculateCompletionScore(basicInfo, itineraries, pricingTiers, inclusions);

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">🎯 Package Review</h3>
            <p className="text-white/80">Review all details before creating the package</p>
          </div>
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${completionScore * 2.2} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{completionScore}%</span>
              </div>
            </div>
            <p className="text-xs text-white/80 mt-1">Complete</p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {completionScore < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Missing Information</p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                {!basicInfo.name && <li>• Package name is required</li>}
                {!basicInfo.description && <li>• Description is required</li>}
                {!basicInfo.destination && <li>• Destination is required</li>}
                {filledItineraries.length === 0 && <li>• At least one day itinerary is recommended</li>}
                {pricingTiers.length === 0 && <li>• At least one pricing tier is recommended</li>}
                {inclusions.length === 0 && <li>• Inclusions/Exclusions are recommended</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Package Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          {basicInfo.thumbnailImage ? (
            <img
              src={basicInfo.thumbnailImage}
              alt={basicInfo.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              {basicInfo.category && (
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  {categoryLabels[basicInfo.category]?.emoji} {categoryLabels[basicInfo.category]?.label}
                </span>
              )}
              {basicInfo.isFeatured && (
                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                basicInfo.status === PackageStatus.ACTIVE
                  ? 'bg-emerald-400 text-emerald-900'
                  : basicInfo.status === PackageStatus.INACTIVE
                  ? 'bg-slate-400 text-slate-900'
                  : 'bg-yellow-400 text-yellow-900'
              }`}>
                {basicInfo.status || 'Draft'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{basicInfo.name || 'Untitled Package'}</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-slate-600 mb-6 line-clamp-3">
            {basicInfo.description || 'No description provided'}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <MapPin className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">Destination</p>
              <p className="font-semibold text-slate-900">{basicInfo.destination || '-'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">Duration</p>
              <p className="font-semibold text-slate-900">
                {basicInfo.numberOfNights || 0}N / {basicInfo.numberOfDays || 0}D
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">Group Size</p>
              <p className="font-semibold text-slate-900">
                {basicInfo.minPersons || 1} - {basicInfo.maxPersons || 10}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <IndianRupee className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">Starting From</p>
              <p className="font-semibold text-emerald-600">₹{minPrice.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Additional Info */}
          {(basicInfo.bestTimeToVisit || basicInfo.difficultyLevel || (basicInfo.suitableFor && basicInfo.suitableFor.length > 0)) && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
              {basicInfo.bestTimeToVisit && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Best Time: {basicInfo.bestTimeToVisit}</span>
                </div>
              )}
              {basicInfo.difficultyLevel && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mountain className="w-4 h-4 text-emerald-500" />
                  <span>Difficulty: {basicInfo.difficultyLevel}</span>
                </div>
              )}
            </div>
          )}

          {basicInfo.suitableFor && basicInfo.suitableFor.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {basicInfo.suitableFor.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Highlights */}
      {basicInfo.highlights && basicInfo.highlights.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-slate-900">Highlights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {basicInfo.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itinerary Summary */}
      {filledItineraries.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900">Itinerary ({filledItineraries.length} Days)</h3>
          </div>
          <div className="space-y-3">
            {filledItineraries.map((day) => (
              <div key={day.dayNumber} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {day.dayNumber}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{day.title}</h4>
                  {day.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{day.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {day.placesToVisit && day.placesToVisit.length > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {day.placesToVisit.length} places
                      </span>
                    )}
                    {day.mealsIncluded && day.mealsIncluded.length > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        {day.mealsIncluded.map(m => m === MealType.BREAKFAST ? 'B' : m === MealType.LUNCH ? 'L' : 'D').join('/')}
                      </span>
                    )}
                    {day.accommodation && (
                      <span className="text-xs text-slate-500">🏨 {day.accommodation}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      {pricingTiers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900">Pricing ({pricingTiers.length} Tiers)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Persons</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Room Type</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Season</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Price/Head</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {pricingTiers.map((tier, idx) => (
                  <tr key={idx} className={`border-b border-slate-100 ${tier.isDefault ? 'bg-emerald-50' : ''}`}>
                    <td className="py-3 px-2">
                      {tier.numberOfPersons}
                      {tier.isDefault && (
                        <span className="ml-2 text-xs text-emerald-600 font-medium">Default</span>
                      )}
                    </td>
                    <td className="py-3 px-2 capitalize">{tier.roomType}</td>
                    <td className="py-3 px-2 capitalize">{tier.seasonType?.replace('_', ' ')}</td>
                    <td className="py-3 px-2 text-right font-medium">₹{tier.pricePerHead.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-600">
                      ₹{(tier.pricePerHead * tier.numberOfPersons).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inclusions & Exclusions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inclusions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Inclusions ({includedItems.length})</h3>
          </div>
          {includedItems.length > 0 ? (
            <ul className="space-y-2">
              {includedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No inclusions added</p>
          )}
        </div>

        {/* Exclusions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Exclusions ({excludedItems.length})</h3>
          </div>
          {excludedItems.length > 0 ? (
            <ul className="space-y-2">
              {excludedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No exclusions added</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {basicInfo.tags && basicInfo.tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🏷️ Tags</h3>
          <div className="flex flex-wrap gap-2">
            {basicInfo.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Destinations Covered */}
      {basicInfo.destinationsCovered && basicInfo.destinationsCovered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📍 Destinations Covered</h3>
          <div className="flex flex-wrap gap-2">
            {basicInfo.destinationsCovered.map((dest, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                {dest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
