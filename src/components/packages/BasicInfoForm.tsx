'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Star,
  Tag,
  FileText,
  Image,
  Sparkles,
  Info,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { PackageCategory, PackageStatus, PackageType } from '@/services/packages/types';

interface BasicInfoFormData {
  name: string;
  shortTitle: string;
  description: string;
  packageType: PackageType;
  category: PackageCategory;
  numberOfNights: number;
  numberOfDays: number;
  destination: string;
  startingPoint: string;
  endingPoint: string;
  destinationsCovered: string[];
  minPersons: number;
  maxPersons: number;
  minPricePerHead: number;
  basePricePerHead: number;
  bestTimeToVisit: string;
  difficultyLevel: string;
  suitableFor: string[];
  highlights: string[];
  thumbnailImage: string;
  status: PackageStatus;
  isFeatured: boolean;
  tags: string[];
}

interface BasicInfoFormProps {
  data: BasicInfoFormData;
  onChange: (data: BasicInfoFormData) => void;
  errors?: Record<string, string>;
}

const categoryOptions = [
  { value: PackageCategory.ADVENTURE, label: '🏔️ Adventure', color: 'from-orange-500 to-red-500' },
  { value: PackageCategory.HONEYMOON, label: '💕 Honeymoon', color: 'from-pink-500 to-rose-500' },
  { value: PackageCategory.FAMILY, label: '👨‍👩‍👧‍👦 Family', color: 'from-blue-500 to-cyan-500' },
  { value: PackageCategory.BUDGET, label: '💰 Budget', color: 'from-green-500 to-emerald-500' },
  { value: PackageCategory.LUXURY, label: '✨ Luxury', color: 'from-yellow-500 to-amber-500' },
  { value: PackageCategory.WEEKEND_GETAWAY, label: '🌴 Weekend', color: 'from-teal-500 to-green-500' },
  { value: PackageCategory.PILGRIMAGE, label: '🙏 Pilgrimage', color: 'from-purple-500 to-violet-500' },
  { value: PackageCategory.WILDLIFE, label: '🦁 Wildlife', color: 'from-amber-500 to-orange-500' },
  { value: PackageCategory.CULTURAL, label: '🎭 Cultural', color: 'from-indigo-500 to-purple-500' },
];

const difficultyOptions = ['Easy', 'Moderate', 'Challenging', 'Difficult', 'Extreme'];
const suitableForOptions = ['Solo', 'Couples', 'Families', 'Groups', 'Seniors', 'Kids', 'Adventure Seekers'];

export function BasicInfoForm({ data, onChange, errors }: BasicInfoFormProps) {
  // Local state for comma-separated inputs
  const [destinationsInput, setDestinationsInput] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Sync local state with parent data only on mount or when arrays are cleared
  useEffect(() => {
    if (data.destinationsCovered?.length === 0 && destinationsInput !== '') {
      setDestinationsInput('');
    }
  }, [data.destinationsCovered]);

  useEffect(() => {
    if (data.highlights?.length === 0 && highlightsInput !== '') {
      setHighlightsInput('');
    }
  }, [data.highlights]);

  useEffect(() => {
    if (data.tags?.length === 0 && tagsInput !== '') {
      setTagsInput('');
    }
  }, [data.tags]);

  const handleChange = (field: keyof BasicInfoFormData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  // Add item to array on Enter or comma key
  const handleArrayKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: keyof BasicInfoFormData,
    inputValue: string,
    setInputValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedValue = inputValue.replace(/,/g, '').trim();
      if (trimmedValue) {
        const currentArray = (data[field] as string[]) || [];
        if (!currentArray.includes(trimmedValue)) {
          handleChange(field, [...currentArray, trimmedValue]);
        }
        setInputValue('');
      }
    }
  };

  // Add item on blur
  const handleArrayInputBlur = (
    field: keyof BasicInfoFormData,
    inputValue: string,
    setInputValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmedValue = inputValue.replace(/,/g, '').trim();
    if (trimmedValue) {
      const currentArray = (data[field] as string[]) || [];
      if (!currentArray.includes(trimmedValue)) {
        handleChange(field, [...currentArray, trimmedValue]);
      }
      setInputValue('');
    }
  };

  // Remove item from array
  const removeFromArray = (field: keyof BasicInfoFormData, index: number) => {
    const currentArray = (data[field] as string[]) || [];
    handleChange(field, currentArray.filter((_, i) => i !== index));
  };

  const handleNightsChange = (nights: number) => {
    if (nights < 1) return;
    onChange({
      ...data,
      numberOfNights: nights,
      numberOfDays: nights + 1,
    });
  };

  const incrementNights = () => {
    handleNightsChange(data.numberOfNights + 1);
  };

  const decrementNights = () => {
    if (data.numberOfNights > 1) {
      handleNightsChange(data.numberOfNights - 1);
    }
  };

  const toggleSuitableFor = (option: string) => {
    const current = data.suitableFor || [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    handleChange('suitableFor', updated);
  };

  return (
    <div className="space-y-8">
      {/* Package Identity */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Package Identity</h3>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Package Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Magical Ladakh Adventure"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                errors?.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors?.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Short Title</label>
            <input
              type="text"
              value={data.shortTitle}
              onChange={(e) => handleChange('shortTitle', e.target.value)}
              placeholder="e.g., Ladakh 6N/7D"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Package Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('packageType', PackageType.PREDEFINED)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  data.packageType === PackageType.PREDEFINED
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                📦 Predefined
              </button>
              <button
                type="button"
                onClick={() => handleChange('packageType', PackageType.CUSTOM)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  data.packageType === PackageType.CUSTOM
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                ✨ Custom
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={data.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Write an engaging description of this package..."
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none ${
                errors?.description ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors?.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Category</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleChange('category', cat.value)}
              className={`p-4 rounded-xl text-sm font-medium transition-all ${
                data.category === cat.value
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:scale-105'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Details */}
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Destination Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Main Destination <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              placeholder="e.g., Ladakh"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                errors?.destination ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            {errors?.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Starting Point</label>
            <input
              type="text"
              value={data.startingPoint}
              onChange={(e) => handleChange('startingPoint', e.target.value)}
              placeholder="e.g., Leh Airport"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ending Point</label>
            <input
              type="text"
              value={data.endingPoint}
              onChange={(e) => handleChange('endingPoint', e.target.value)}
              placeholder="e.g., Leh Airport"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Destinations Covered
              <span className="text-slate-400 text-xs font-normal ml-2">(Type and press Enter or comma to add)</span>
            </label>
            <input
              type="text"
              value={destinationsInput}
              onChange={(e) => setDestinationsInput(e.target.value)}
              onKeyDown={(e) => handleArrayKeyDown(e, 'destinationsCovered', destinationsInput, setDestinationsInput)}
              onBlur={() => handleArrayInputBlur('destinationsCovered', destinationsInput, setDestinationsInput)}
              placeholder="e.g., Leh, Nubra Valley, Pangong Lake..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            {data.destinationsCovered && data.destinationsCovered.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {data.destinationsCovered.map((dest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full flex items-center gap-2 group"
                  >
                    {dest}
                    <button
                      type="button"
                      onClick={() => removeFromArray('destinationsCovered', idx)}
                      className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Duration & Capacity */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Duration & Capacity</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Number of Nights <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (data.numberOfNights > 1) {
                    const newNights = data.numberOfNights - 1;
                    onChange({
                      ...data,
                      numberOfNights: newNights,
                      numberOfDays: newNights + 1,
                    });
                  }
                }}
                disabled={data.numberOfNights <= 1}
                className="w-12 h-12 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="flex-1 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl">
                <span className="text-2xl font-bold text-indigo-600">{data.numberOfNights}</span>
                <span className="text-slate-500 ml-1 text-sm">N</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newNights = data.numberOfNights + 1;
                  onChange({
                    ...data,
                    numberOfNights: newNights,
                    numberOfDays: newNights + 1,
                  });
                }}
                className="w-12 h-12 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Days</label>
            <div className="h-12 flex items-center justify-center bg-slate-100 rounded-xl">
              <span className="text-2xl font-bold text-purple-600">{data.numberOfDays}</span>
              <span className="text-slate-500 ml-1 text-sm">D</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 text-center">Auto-calculated</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Min Persons</label>
            <input
              type="number"
              min={1}
              value={data.minPersons}
              onChange={(e) => handleChange('minPersons', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Max Persons</label>
            <input
              type="number"
              min={1}
              value={data.maxPersons}
              onChange={(e) => handleChange('maxPersons', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-br from-slate-50 to-green-50 rounded-2xl p-6 border border-green-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Base Pricing</h3>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4" />
            Detailed pricing in next step
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Minimum Price/Head <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                min={0}
                value={data.minPricePerHead || ''}
                onChange={(e) => handleChange('minPricePerHead', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                  errors?.minPricePerHead ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              />
            </div>
            {errors?.minPricePerHead && <p className="text-red-500 text-xs mt-1">{errors.minPricePerHead}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Base Price/Head <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                min={0}
                value={data.basePricePerHead || ''}
                onChange={(e) => handleChange('basePricePerHead', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                  errors?.basePricePerHead ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              />
            </div>
            {errors?.basePricePerHead && <p className="text-red-500 text-xs mt-1">{errors.basePricePerHead}</p>}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-br from-slate-50 to-orange-50 rounded-2xl p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Additional Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Best Time to Visit</label>
            <input
              type="text"
              value={data.bestTimeToVisit}
              onChange={(e) => handleChange('bestTimeToVisit', e.target.value)}
              placeholder="e.g., May to September"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty Level</label>
            <select
              value={data.difficultyLevel}
              onChange={(e) => handleChange('difficultyLevel', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select difficulty</option>
              {difficultyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Suitable For</label>
            <div className="flex flex-wrap gap-2">
              {suitableForOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleSuitableFor(opt)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    data.suitableFor?.includes(opt)
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Highlights
              <span className="text-slate-400 text-xs font-normal ml-2">(Type and press Enter or comma to add)</span>
            </label>
            <input
              type="text"
              value={highlightsInput}
              onChange={(e) => setHighlightsInput(e.target.value)}
              onKeyDown={(e) => handleArrayKeyDown(e, 'highlights', highlightsInput, setHighlightsInput)}
              onBlur={() => handleArrayInputBlur('highlights', highlightsInput, setHighlightsInput)}
              placeholder="e.g., Visit Pangong Lake, Ride through Khardung La..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            {data.highlights && data.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {data.highlights.map((highlight, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-full flex items-center gap-2"
                  >
                    {highlight}
                    <button
                      type="button"
                      onClick={() => removeFromArray('highlights', idx)}
                      className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tags
              <span className="text-slate-400 text-xs font-normal ml-2">(Type and press Enter or comma to add)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={(e) => handleArrayKeyDown(e, 'tags', tagsInput, setTagsInput)}
              onBlur={() => handleArrayInputBlur('tags', tagsInput, setTagsInput)}
              placeholder="e.g., adventure, mountains, photography..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {data.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeFromArray('tags', idx)}
                      className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media & Status */}
      <div className="bg-gradient-to-br from-slate-50 to-pink-50 rounded-2xl p-6 border border-pink-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
            <Image className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Media & Status</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Thumbnail Image URL</label>
            <input
              type="text"
              value={data.thumbnailImage}
              onChange={(e) => handleChange('thumbnailImage', e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={data.status}
              onChange={(e) => handleChange('status', e.target.value as PackageStatus)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            >
              <option value={PackageStatus.DRAFT}>📝 Draft</option>
              <option value={PackageStatus.ACTIVE}>✅ Active</option>
              <option value={PackageStatus.INACTIVE}>⏸️ Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  data.isFeatured ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-slate-200'
                }`}
                onClick={() => handleChange('isFeatured', !data.isFeatured)}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    data.isFeatured ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <Star className={`w-5 h-5 ${data.isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}`} />
                Featured Package
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
