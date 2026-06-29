'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Utensils,
  Mountain,
  Sunrise,
  Sun,
  Moon,
  Lightbulb,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image,
  Car,
  Home,
} from 'lucide-react';
import { CreatePackageItineraryDto, MealType } from '@/services/packages/types';

interface ItineraryFormProps {
  itineraries: CreatePackageItineraryDto[];
  numberOfDays: number;
  onChange: (itineraries: CreatePackageItineraryDto[]) => void;
}

const mealOptions = [
  { value: MealType.BREAKFAST, label: '🌅 Breakfast', icon: Sunrise },
  { value: MealType.LUNCH, label: '☀️ Lunch', icon: Sun },
  { value: MealType.DINNER, label: '🌙 Dinner', icon: Moon },
];

const emptyItinerary: CreatePackageItineraryDto = {
  dayNumber: 1,
  title: '',
  description: '',
  placesToVisit: [],
  activities: [],
  mealsIncluded: [],
  accommodation: '',
  drivingDistanceKm: undefined,
  drivingTime: '',
  altitude: '',
  morningActivities: '',
  afternoonActivities: '',
  eveningActivities: '',
  tips: '',
  images: [],
  hasOvernightStay: true,
};

export function ItineraryForm({ itineraries, numberOfDays, onChange }: ItineraryFormProps) {
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addItinerary = () => {
    const newDay = itineraries.length + 1;
    onChange([...itineraries, { ...emptyItinerary, dayNumber: newDay }]);
    setExpandedDays((prev) => [...prev, newDay]);
  };

  const removeItinerary = (dayNumber: number) => {
    const updated = itineraries
      .filter((it) => it.dayNumber !== dayNumber)
      .map((it, idx) => ({ ...it, dayNumber: idx + 1 }));
    onChange(updated);
  };

  const updateItinerary = (dayNumber: number, field: keyof CreatePackageItineraryDto, value: unknown) => {
    onChange(
      itineraries.map((it) =>
        it.dayNumber === dayNumber ? { ...it, [field]: value } : it
      )
    );
  };

  const handleArrayInput = (dayNumber: number, field: keyof CreatePackageItineraryDto, value: string) => {
    const arr = value.split(',').map((s) => s.trim()).filter(Boolean);
    updateItinerary(dayNumber, field, arr);
  };

  const toggleMeal = (dayNumber: number, meal: MealType) => {
    const current = itineraries.find((it) => it.dayNumber === dayNumber)?.mealsIncluded || [];
    const updated = current.includes(meal)
      ? current.filter((m) => m !== meal)
      : [...current, meal];
    updateItinerary(dayNumber, 'mealsIncluded', updated);
  };

  // Auto-generate empty itineraries for all days if needed
  React.useEffect(() => {
    if (itineraries.length < numberOfDays) {
      const newItineraries = [...itineraries];
      for (let i = itineraries.length + 1; i <= numberOfDays; i++) {
        newItineraries.push({ ...emptyItinerary, dayNumber: i });
      }
      onChange(newItineraries);
    }
  }, [numberOfDays, itineraries.length, onChange, itineraries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">📅 Day-by-Day Itinerary</h3>
            <p className="text-white/80">Create an amazing journey for your travelers</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{itineraries.length}</p>
            <p className="text-sm text-white/80">of {numberOfDays} days planned</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(itineraries.filter((it) => it.title).length / numberOfDays) * 100}%` }}
          />
        </div>
      </div>

      {/* Itinerary Cards */}
      <div className="space-y-4">
        {itineraries.map((itinerary) => {
          const isExpanded = expandedDays.includes(itinerary.dayNumber);

          return (
            <div
              key={itinerary.dayNumber}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                isExpanded ? 'border-indigo-300 shadow-lg shadow-indigo-500/10' : 'border-slate-200'
              }`}
            >
              {/* Day Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => toggleDay(itinerary.dayNumber)}
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {itinerary.dayNumber}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Day {itinerary.dayNumber}</p>
                  <p className="font-semibold text-slate-900">
                    {itinerary.title || 'Click to add details...'}
                  </p>
                </div>
                {itinerary.mealsIncluded && itinerary.mealsIncluded.length > 0 && (
                  <div className="flex gap-1">
                    {itinerary.mealsIncluded.includes(MealType.BREAKFAST) && <span>🌅</span>}
                    {itinerary.mealsIncluded.includes(MealType.LUNCH) && <span>☀️</span>}
                    {itinerary.mealsIncluded.includes(MealType.DINNER) && <span>🌙</span>}
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeItinerary(itinerary.dayNumber); }}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {/* Day Content */}
              {isExpanded && (
                <div className="px-4 pb-6 pt-2 border-t border-slate-100 space-y-6">
                  {/* Title & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Day Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={itinerary.title}
                        onChange={(e) => updateItinerary(itinerary.dayNumber, 'title', e.target.value)}
                        placeholder="e.g., Arrival in Leh & Acclimatization"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      {itinerary.dayNumber === numberOfDays ? (
                        <>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Drop Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                            <input
                              type="text"
                              value={itinerary.accommodation || ''}
                              onChange={(e) => updateItinerary(itinerary.dayNumber, 'accommodation', e.target.value)}
                              placeholder="e.g., Leh Airport, Delhi Station"
                              className="w-full pl-12 pr-4 py-3 border border-rose-200 bg-rose-50/40 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Accommodation</label>
                          <div className="relative">
                            <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={itinerary.accommodation || ''}
                              onChange={(e) => updateItinerary(itinerary.dayNumber, 'accommodation', e.target.value)}
                              placeholder="e.g., Hotel Grand Dragon"
                              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      value={itinerary.description}
                      onChange={(e) => updateItinerary(itinerary.dayNumber, 'description', e.target.value)}
                      placeholder="Describe what happens on this day..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>


                  {/* Travel Details */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-500" />
                      Travel Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Driving Distance</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={itinerary.drivingDistanceKm || ''}
                            onChange={(e) => updateItinerary(itinerary.dayNumber, 'drivingDistanceKm', parseFloat(e.target.value) || undefined)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">km</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Driving Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={itinerary.drivingTime || ''}
                            onChange={(e) => updateItinerary(itinerary.dayNumber, 'drivingTime', e.target.value)}
                            placeholder="e.g., 5-6 hours"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Altitude</label>
                        <div className="relative">
                          <Mountain className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={itinerary.altitude || ''}
                            onChange={(e) => updateItinerary(itinerary.dayNumber, 'altitude', e.target.value)}
                            placeholder="e.g., 11,500 ft"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meals */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      <Utensils className="w-4 h-4 inline mr-1 text-orange-500" />
                      Meals Included
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {mealOptions.map((meal) => (
                        <button
                          key={meal.value}
                          type="button"
                          onClick={() => toggleMeal(itinerary.dayNumber, meal.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                            itinerary.mealsIncluded?.includes(meal.value)
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
                          }`}
                        >
                          {meal.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily Schedule */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Sunrise className="w-4 h-4 inline mr-1 text-yellow-500" />
                        Morning Activities
                      </label>
                      <textarea
                        value={itinerary.morningActivities || ''}
                        onChange={(e) => updateItinerary(itinerary.dayNumber, 'morningActivities', e.target.value)}
                        placeholder="What happens in the morning..."
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Sun className="w-4 h-4 inline mr-1 text-orange-500" />
                        Afternoon Activities
                      </label>
                      <textarea
                        value={itinerary.afternoonActivities || ''}
                        onChange={(e) => updateItinerary(itinerary.dayNumber, 'afternoonActivities', e.target.value)}
                        placeholder="What happens in the afternoon..."
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Moon className="w-4 h-4 inline mr-1 text-indigo-500" />
                        Evening Activities
                      </label>
                      <textarea
                        value={itinerary.eveningActivities || ''}
                        onChange={(e) => updateItinerary(itinerary.dayNumber, 'eveningActivities', e.target.value)}
                        placeholder="What happens in the evening..."
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Tips & Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Lightbulb className="w-4 h-4 inline mr-1 text-yellow-500" />
                        Tips for Travelers
                      </label>
                      <textarea
                        value={itinerary.tips || ''}
                        onChange={(e) => updateItinerary(itinerary.dayNumber, 'tips', e.target.value)}
                        placeholder="Any helpful tips for this day..."
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Image className="w-4 h-4 inline mr-1 text-pink-500" />
                        Image URLs
                        <span className="text-slate-400 text-xs font-normal ml-2">(comma separated)</span>
                      </label>
                      <textarea
                        value={itinerary.images?.join(', ') || ''}
                        onChange={(e) => handleArrayInput(itinerary.dayNumber, 'images', e.target.value)}
                        placeholder="https://image1.jpg, https://image2.jpg"
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Overnight Stay */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${
                          itinerary.hasOvernightStay ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-200'
                        }`}
                        onClick={() => updateItinerary(itinerary.dayNumber, 'hasOvernightStay', !itinerary.hasOvernightStay)}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                            itinerary.hasOvernightStay ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </div>
                      <span className="font-medium text-slate-700">🏨 Has Overnight Stay</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Day Button */}
      {itineraries.length < numberOfDays && (
        <button
          type="button"
          onClick={addItinerary}
          className="w-full py-4 border-2 border-dashed border-indigo-300 rounded-2xl text-indigo-600 font-medium hover:bg-indigo-50 hover:border-indigo-400 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Day {itineraries.length + 1}
        </button>
      )}
    </div>
  );
}
