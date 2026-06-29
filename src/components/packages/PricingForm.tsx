'use client';

import React from 'react';
import {
  IndianRupee,
  Users,
  Plus,
  Trash2,
  Home,
  Percent,
  Calendar,
  Star,
  Copy,
} from 'lucide-react';
import { CreatePackageItineraryDto, CreatePackagePricingDto, PackageRoomType, SeasonType } from '@/services/packages/types';

interface PricingFormProps {
  pricingTiers: CreatePackagePricingDto[];
  onChange: (pricingTiers: CreatePackagePricingDto[]) => void;
  itineraries?: CreatePackageItineraryDto[];
  onItinerariesChange?: (itineraries: CreatePackageItineraryDto[]) => void;
}

const roomTypeOptions = [
  { value: PackageRoomType.STANDARD, label: '🛏️ Standard', desc: 'Basic comfort' },
  { value: PackageRoomType.DELUXE, label: '✨ Deluxe', desc: 'Enhanced amenities' },
  { value: PackageRoomType.PREMIUM, label: '💎 Premium', desc: 'Superior experience' },
  { value: PackageRoomType.LUXURY, label: '👑 Luxury', desc: 'Ultimate comfort' },
];

const seasonOptions = [
  { value: SeasonType.REGULAR, label: '📅 Regular', color: 'from-slate-500 to-slate-600' },
  { value: SeasonType.PEAK, label: '🔥 Peak', color: 'from-red-500 to-orange-500' },
  { value: SeasonType.OFF_SEASON, label: '🍂 Off Season', color: 'from-amber-500 to-yellow-500' },
  { value: SeasonType.FESTIVE, label: '🎉 Festive', color: 'from-purple-500 to-pink-500' },
];

const emptyPricing: CreatePackagePricingDto = {
  numberOfPersons: 2,
  roomType: PackageRoomType.STANDARD,
  seasonType: SeasonType.REGULAR,
  pricePerHead: 0,
  costPricePerHead: undefined,
  minPricePerHead: undefined,
  maxDiscountPercent: 10,
  transportCost: undefined,
  accommodationCost: undefined,
  mealCost: undefined,
  sightseeingCost: undefined,
  validFrom: undefined,
  validUntil: undefined,
  isDefault: false,
  notes: '',
};

export function PricingForm({ pricingTiers, onChange, itineraries, onItinerariesChange }: PricingFormProps) {
  const stayNightsCount = itineraries?.filter((it) => it.hasOvernightStay).length || 0;

  const toggleNightStay = (dayNumber: number) => {
    if (!itineraries || !onItinerariesChange) return;
    const updated = itineraries.map((it) =>
      it.dayNumber === dayNumber ? { ...it, hasOvernightStay: !it.hasOvernightStay } : it
    );
    onItinerariesChange(updated);
  };
  const addPricingTier = () => {
    const isFirst = pricingTiers.length === 0;
    onChange([...pricingTiers, { ...emptyPricing, isDefault: isFirst }]);
  };

  const removePricingTier = (index: number) => {
    const updated = pricingTiers.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((p) => p.isDefault)) {
      updated[0].isDefault = true;
    }
    onChange(updated);
  };

  const updatePricingTier = (index: number, field: keyof CreatePackagePricingDto, value: unknown) => {
    onChange(
      pricingTiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      )
    );
  };

  const setAsDefault = (index: number) => {
    onChange(
      pricingTiers.map((tier, i) => ({
        ...tier,
        isDefault: i === index,
      }))
    );
  };

  const duplicateTier = (index: number) => {
    const tier = pricingTiers[index];
    onChange([...pricingTiers, { ...tier, isDefault: false, numberOfPersons: tier.numberOfPersons + 1 }]);
  };

  const addQuickTemplate = (template: 'couple' | 'family' | 'group') => {
    const templates: Record<string, CreatePackagePricingDto[]> = {
      couple: [
        { ...emptyPricing, numberOfPersons: 2, roomType: PackageRoomType.STANDARD, isDefault: true },
        { ...emptyPricing, numberOfPersons: 2, roomType: PackageRoomType.DELUXE },
        { ...emptyPricing, numberOfPersons: 2, roomType: PackageRoomType.LUXURY },
      ],
      family: [
        { ...emptyPricing, numberOfPersons: 4, roomType: PackageRoomType.STANDARD, isDefault: true },
        { ...emptyPricing, numberOfPersons: 4, roomType: PackageRoomType.DELUXE },
        { ...emptyPricing, numberOfPersons: 6, roomType: PackageRoomType.STANDARD },
      ],
      group: [
        { ...emptyPricing, numberOfPersons: 6, roomType: PackageRoomType.STANDARD, isDefault: true },
        { ...emptyPricing, numberOfPersons: 8, roomType: PackageRoomType.STANDARD },
        { ...emptyPricing, numberOfPersons: 10, roomType: PackageRoomType.STANDARD },
      ],
    };
    onChange([...pricingTiers, ...templates[template]]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">💰 Pricing Configuration</h3>
            <p className="text-white/80">Set up different pricing tiers for various group sizes and room types</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{pricingTiers.length}</p>
            <p className="text-sm text-white/80">pricing tiers</p>
          </div>
        </div>
      </div>

      {/* Night-Stay Toggle Controller Section */}
      {itineraries && itineraries.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" />
                Stay Nights Accommodation Toggle
              </h4>
              <p className="text-slate-500 text-xs">Include or exclude specific nights stay to dynamically compute accommodation pricing.</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              {stayNightsCount} / {itineraries.length} Nights Stay Included
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {itineraries.map((it) => (
              <div
                key={it.dayNumber}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  it.hasOvernightStay
                    ? 'border-indigo-200 bg-indigo-50/30'
                    : 'border-slate-200 bg-slate-50/50 opacity-70'
                }`}
                onClick={() => toggleNightStay(it.dayNumber)}
              >
                <div>
                  <span className="text-xs font-bold text-slate-800">Night {it.dayNumber}</span>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {it.title || 'Untitled Itinerary Day'}
                  </p>
                </div>
                <div
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                    it.hasOvernightStay ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      it.hasOvernightStay ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Pricing Tiers */}
      <div className="space-y-4">
        {pricingTiers.map((tier, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl border transition-all ${
              tier.isDefault
                ? 'border-emerald-300 shadow-lg shadow-emerald-500/10'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Tier Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tier.isDefault
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                } text-white font-bold`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {tier.numberOfPersons} Person{tier.numberOfPersons > 1 ? 's' : ''} - {roomTypeOptions.find(r => r.value === tier.roomType)?.label || 'Standard'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {seasonOptions.find(s => s.value === tier.seasonType)?.label || 'Regular'} Season
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tier.isDefault && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Default
                  </span>
                )}
                {!tier.isDefault && (
                  <button
                    type="button"
                    onClick={() => setAsDefault(index)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => duplicateTier(index)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removePricingTier(index)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tier Content */}
            <div className="p-6 space-y-6">
              {/* Basic Config */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Number of Persons
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={tier.numberOfPersons}
                    onChange={(e) => updatePricingTier(index, 'numberOfPersons', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type</label>
                  <select
                    value={tier.roomType}
                    onChange={(e) => updatePricingTier(index, 'roomType', e.target.value as PackageRoomType)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  >
                    {roomTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Season Type</label>
                  <select
                    value={tier.seasonType}
                    onChange={(e) => updatePricingTier(index, 'seasonType', e.target.value as SeasonType)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  >
                    {seasonOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Percent className="w-4 h-4 inline mr-1" />
                    Max Discount %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tier.maxDiscountPercent || 0}
                    onChange={(e) => updatePricingTier(index, 'maxDiscountPercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                <h5 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-500" />
                  Pricing Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Price Per Head *</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        value={tier.pricePerHead}
                        onChange={(e) => updatePricingTier(index, 'pricePerHead', parseFloat(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Min Price/Head</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        value={tier.minPricePerHead || ''}
                        onChange={(e) => updatePricingTier(index, 'minPricePerHead', parseFloat(e.target.value) || undefined)}
                        placeholder="Optional"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Preview */}
                <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total for {tier.numberOfPersons} person(s):</span>
                    <span className="text-xl font-bold text-emerald-600 flex items-center">
                      <IndianRupee className="w-5 h-5" />
                      {(tier.pricePerHead * tier.numberOfPersons).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>


              {/* Validity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={tier.validFrom || ''}
                    onChange={(e) => updatePricingTier(index, 'validFrom', e.target.value || undefined)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={tier.validUntil || ''}
                    onChange={(e) => updatePricingTier(index, 'validUntil', e.target.value || undefined)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <input
                    type="text"
                    value={tier.notes || ''}
                    onChange={(e) => updatePricingTier(index, 'notes', e.target.value)}
                    placeholder="Any special notes..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Tier Button */}
      <button
        type="button"
        onClick={addPricingTier}
        className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 font-medium hover:bg-emerald-50 hover:border-emerald-400 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Pricing Tier
      </button>
    </div>
  );
}
