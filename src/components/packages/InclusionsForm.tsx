'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  Plus,
  Trash2,
  Car,
  Home,
  Utensils,
  MapPin,
  FileText,
  Users,
  Activity,
  Receipt,
  Shield,
  MoreHorizontal,
  Sparkles,
  Star,
  GripVertical,
} from 'lucide-react';
import { CreatePackageInclusionDto, InclusionType, InclusionCategory } from '@/services/packages/types';

interface InclusionsFormProps {
  inclusions: CreatePackageInclusionDto[];
  onChange: (inclusions: CreatePackageInclusionDto[]) => void;
}

const categoryConfig = {
  [InclusionCategory.TRANSPORT]: { icon: Car, label: 'Transport', color: 'blue' },
  [InclusionCategory.ACCOMMODATION]: { icon: Home, label: 'Accommodation', color: 'purple' },
  [InclusionCategory.MEALS]: { icon: Utensils, label: 'Meals', color: 'orange' },
  [InclusionCategory.SIGHTSEEING]: { icon: MapPin, label: 'Sightseeing', color: 'emerald' },
  [InclusionCategory.PERMITS]: { icon: FileText, label: 'Permits', color: 'slate' },
  [InclusionCategory.GUIDE]: { icon: Users, label: 'Guide', color: 'cyan' },
  [InclusionCategory.ACTIVITIES]: { icon: Activity, label: 'Activities', color: 'pink' },
  [InclusionCategory.TAXES]: { icon: Receipt, label: 'Taxes', color: 'amber' },
  [InclusionCategory.INSURANCE]: { icon: Shield, label: 'Insurance', color: 'indigo' },
  [InclusionCategory.OTHER]: { icon: MoreHorizontal, label: 'Other', color: 'gray' },
};

const commonInclusions = [
  { description: 'Airport/Railway station pickup & drop', category: InclusionCategory.TRANSPORT },
  { description: 'All transfers by private AC vehicle', category: InclusionCategory.TRANSPORT },
  { description: 'Accommodation in mentioned hotels or similar', category: InclusionCategory.ACCOMMODATION },
  { description: 'Daily breakfast at hotel', category: InclusionCategory.MEALS },
  { description: 'All meals (Breakfast, Lunch & Dinner)', category: InclusionCategory.MEALS },
  { description: 'Sightseeing as per itinerary', category: InclusionCategory.SIGHTSEEING },
  { description: 'All applicable permits and entry fees', category: InclusionCategory.PERMITS },
  { description: 'Experienced driver cum guide', category: InclusionCategory.GUIDE },
  { description: 'All toll charges, parking & driver allowances', category: InclusionCategory.TAXES },
  { description: 'GST and all applicable taxes', category: InclusionCategory.TAXES },
];

const commonExclusions = [
  { description: 'Airfare / Train fare', category: InclusionCategory.TRANSPORT },
  { description: 'Personal expenses like tips, laundry, telephone calls', category: InclusionCategory.OTHER },
  { description: 'Any adventure activities not mentioned', category: InclusionCategory.ACTIVITIES },
  { description: 'Travel insurance', category: InclusionCategory.INSURANCE },
  { description: 'Any meals not mentioned in the itinerary', category: InclusionCategory.MEALS },
  { description: 'Camera/Video charges at monuments', category: InclusionCategory.SIGHTSEEING },
  { description: 'Any expenses arising out of unforeseen circumstances', category: InclusionCategory.OTHER },
  { description: 'Room heater charges (if applicable)', category: InclusionCategory.ACCOMMODATION },
];

const emptyInclusion: CreatePackageInclusionDto = {
  type: InclusionType.INCLUDED,
  category: InclusionCategory.OTHER,
  description: '',
  iconName: '',
  displayOrder: 0,
  isHighlight: false,
};

export function InclusionsForm({ inclusions, onChange }: InclusionsFormProps) {
  const [activeTab, setActiveTab] = useState<'included' | 'excluded'>('included');

  const includedItems = inclusions.filter((i) => i.type === InclusionType.INCLUDED);
  const excludedItems = inclusions.filter((i) => i.type === InclusionType.EXCLUDED);

  const addInclusion = (type: InclusionType) => {
    const newInclusion: CreatePackageInclusionDto = {
      ...emptyInclusion,
      type,
      displayOrder: inclusions.filter((i) => i.type === type).length,
    };
    onChange([...inclusions, newInclusion]);
  };

  const removeInclusion = (index: number) => {
    onChange(inclusions.filter((_, i) => i !== index));
  };

  const updateInclusion = (index: number, field: keyof CreatePackageInclusionDto, value: unknown) => {
    onChange(
      inclusions.map((inc, i) =>
        i === index ? { ...inc, [field]: value } : inc
      )
    );
  };

  const getInclusionIndex = (item: CreatePackageInclusionDto) => {
    return inclusions.findIndex((i) => i === item);
  };

  const addCommonItem = (item: { description: string; category: InclusionCategory }, type: InclusionType) => {
    const exists = inclusions.some(
      (i) => i.description === item.description && i.type === type
    );
    if (!exists) {
      onChange([
        ...inclusions,
        {
          ...emptyInclusion,
          type,
          category: item.category,
          description: item.description,
          displayOrder: inclusions.filter((i) => i.type === type).length,
        },
      ]);
    }
  };

  const addAllCommon = (type: InclusionType) => {
    const items = type === InclusionType.INCLUDED ? commonInclusions : commonExclusions;
    const newItems = items
      .filter((item) => !inclusions.some((i) => i.description === item.description && i.type === type))
      .map((item, idx) => ({
        ...emptyInclusion,
        type,
        category: item.category,
        description: item.description,
        displayOrder: inclusions.filter((i) => i.type === type).length + idx,
      }));
    onChange([...inclusions, ...newItems]);
  };

  const renderInclusionItem = (item: CreatePackageInclusionDto, type: InclusionType) => {
    const index = getInclusionIndex(item);

    return (
      <div
        key={index}
        className={`group bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
          item.isHighlight
            ? 'border-yellow-300 bg-yellow-50/50'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="text-slate-400 cursor-grab">
            <GripVertical className="w-5 h-5" />
          </div>

          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              type === InclusionType.INCLUDED
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {type === InclusionType.INCLUDED ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateInclusion(index, 'description', e.target.value)}
              placeholder="Enter description..."
              className="w-full px-0 py-1 border-0 border-b border-transparent focus:border-slate-300 focus:ring-0 outline-none transition-all text-slate-900"
            />

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={item.category}
                onChange={(e) => updateInclusion(index, 'category', e.target.value as InclusionCategory)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                {Object.entries(categoryConfig).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => updateInclusion(index, 'isHighlight', !item.isHighlight)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1 ${
                  item.isHighlight
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-yellow-50 hover:text-yellow-700'
                }`}
              >
                <Star className={`w-3 h-3 ${item.isHighlight ? 'fill-yellow-500' : ''}`} />
                Highlight
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeInclusion(index)}
            className="p-2 hover:bg-red-50 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">📋 Inclusions & Exclusions</h3>
            <p className="text-white/80">Define what&apos;s included and excluded in the package</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{includedItems.length}</p>
              <p className="text-sm text-white/80">Included</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-3xl font-bold">{excludedItems.length}</p>
              <p className="text-sm text-white/80">Excluded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('included')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'included'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Check className="w-5 h-5" />
            Inclusions ({includedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('excluded')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'excluded'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
            Exclusions ({excludedItems.length})
          </button>
        </div>
      </div>

      {/* Quick Add Common Items */}
      <div className={`rounded-2xl p-6 border ${
        activeTab === 'included'
          ? 'bg-gradient-to-br from-slate-50 to-emerald-50 border-emerald-100'
          : 'bg-gradient-to-br from-slate-50 to-red-50 border-red-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${activeTab === 'included' ? 'text-emerald-500' : 'text-red-500'}`} />
            <h4 className="text-sm font-semibold text-slate-700">
              Quick Add Common {activeTab === 'included' ? 'Inclusions' : 'Exclusions'}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => addAllCommon(activeTab === 'included' ? InclusionType.INCLUDED : InclusionType.EXCLUDED)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'included'
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Add All
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(activeTab === 'included' ? commonInclusions : commonExclusions).map((item, idx) => {
            const type = activeTab === 'included' ? InclusionType.INCLUDED : InclusionType.EXCLUDED;
            const exists = inclusions.some((i) => i.description === item.description && i.type === type);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => addCommonItem(item, type)}
                disabled={exists}
                className={`px-3 py-2 text-xs rounded-lg transition-all ${
                  exists
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : activeTab === 'included'
                    ? 'bg-white border border-emerald-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                    : 'bg-white border border-red-200 text-slate-700 hover:border-red-400 hover:bg-red-50'
                }`}
              >
                {exists ? '✓ ' : '+ '}{item.description}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {(activeTab === 'included' ? includedItems : excludedItems).map((item) =>
          renderInclusionItem(item, activeTab === 'included' ? InclusionType.INCLUDED : InclusionType.EXCLUDED)
        )}
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={() => addInclusion(activeTab === 'included' ? InclusionType.INCLUDED : InclusionType.EXCLUDED)}
        className={`w-full py-4 border-2 border-dashed rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
          activeTab === 'included'
            ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400'
            : 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
        }`}
      >
        <Plus className="w-5 h-5" />
        Add {activeTab === 'included' ? 'Inclusion' : 'Exclusion'}
      </button>
    </div>
  );
}
