/* eslint-disable @typescript-eslint/no-explicit-any */

// Package Enums
export enum PackageType {
  PREDEFINED = 'predefined',
  CUSTOM = 'custom',
}

export enum PackageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export enum PackageCategory {
  ADVENTURE = 'adventure',
  HONEYMOON = 'honeymoon',
  FAMILY = 'family',
  BUDGET = 'budget',
  LUXURY = 'luxury',
  WEEKEND_GETAWAY = 'weekend_getaway',
  PILGRIMAGE = 'pilgrimage',
  WILDLIFE = 'wildlife',
  CULTURAL = 'cultural',
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
}

export enum PackageRoomType {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  PREMIUM = 'premium',
  LUXURY = 'luxury',
}

export enum SeasonType {
  REGULAR = 'regular',
  PEAK = 'peak',
  OFF_SEASON = 'off_season',
  FESTIVE = 'festive',
}

export enum InclusionType {
  INCLUDED = 'included',
  EXCLUDED = 'excluded',
}

export enum InclusionCategory {
  TRANSPORT = 'transport',
  ACCOMMODATION = 'accommodation',
  MEALS = 'meals',
  SIGHTSEEING = 'sightseeing',
  PERMITS = 'permits',
  GUIDE = 'guide',
  ACTIVITIES = 'activities',
  TAXES = 'taxes',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

export enum CustomPackageStatus {
  DRAFT = 'draft',
  QUOTE_SENT = 'quote_sent',
  NEGOTIATING = 'negotiating',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// Package Itinerary
export interface PackageItinerary {
  id: string;
  packageId: string;
  dayNumber: number;
  title: string;
  description: string;
  placesToVisit?: string[];
  activities?: string[];
  mealsIncluded?: MealType[];
  accommodation?: string;
  drivingDistanceKm?: number;
  drivingTime?: string;
  altitude?: string;
  morningActivities?: string;
  afternoonActivities?: string;
  eveningActivities?: string;
  tips?: string;
  images?: string[];
  hasOvernightStay: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Package Pricing
export interface PackagePricing {
  id: string;
  packageId: string;
  numberOfPersons: number;
  roomType: PackageRoomType;
  seasonType: SeasonType;
  pricePerHead: number;
  totalPrice: number;
  costPricePerHead?: number;
  minPricePerHead?: number;
  maxDiscountPercent: number;
  transportCost?: number;
  accommodationCost?: number;
  mealCost?: number;
  sightseeingCost?: number;
  validFrom?: string;
  validUntil?: string;
  isDefault: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Package Inclusion
export interface PackageInclusion {
  id: string;
  packageId: string;
  type: InclusionType;
  category: InclusionCategory;
  description: string;
  iconName?: string;
  displayOrder: number;
  isHighlight: boolean;
  createdAt: string;
}

// Main Package
export interface Package {
  id: string;
  packageCode: string;
  name: string;
  shortTitle?: string;
  description: string;
  packageType: PackageType;
  category: PackageCategory;
  numberOfNights: number;
  numberOfDays: number;
  destination: string;
  startingPoint?: string;
  endingPoint?: string;
  destinationsCovered?: string[];
  minPersons: number;
  maxPersons: number;
  minPricePerHead: number;
  basePricePerHead: number;
  bestTimeToVisit?: string;
  difficultyLevel?: string;
  suitableFor?: string[];
  highlights?: string[];
  images?: string[];
  thumbnailImage?: string;
  status: PackageStatus;
  isFeatured: boolean;
  displayOrder: number;
  validFrom?: string;
  validUntil?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
  importantNotes?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  customFields?: Record<string, any>;
  itineraries: PackageItinerary[];
  pricingTiers: PackagePricing[];
  inclusions: PackageInclusion[];
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
}

// Custom Package Itinerary
export interface CustomPackageItinerary {
  id: string;
  customPackageId: string;
  dayNumber: number;
  date?: string;
  title: string;
  destination: string;
  activities: string;
  placesToVisit?: string[];
  accommodationName?: string;
  accommodationCost?: number;
  mealsIncluded?: string[];
  transportDetails?: string;
  transportCost?: number;
  drivingDistanceKm?: number;
  notes?: string;
  estimatedDayCost?: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Custom Package
export interface CustomPackage {
  id: string;
  referenceCode: string;
  leadId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  title: string;
  destinations: string[];
  numberOfNights: number;
  numberOfDays: number;
  numberOfAdults: number;
  numberOfChildren: number;
  travelStartDate: string;
  travelEndDate: string;
  customerBudget?: number;
  quotedPricePerHead?: number;
  totalQuotedPrice?: number;
  finalPrice?: number;
  costPrice?: number;
  discountAmount: number;
  status: CustomPackageStatus;
  specialRequirements?: string;
  accommodationPreference?: string;
  transportPreference?: string;
  mealPreference?: string;
  internalNotes?: string;
  inclusions?: string[];
  exclusions?: string[];
  bookingId?: string;
  assignedTo?: string;
  quoteValidUntil?: string;
  itineraries: CustomPackageItinerary[];
  createdAt: string;
  updatedAt: string;
}

// ==================== DTOs ====================

export interface CreatePackageItineraryDto {
  dayNumber: number;
  title: string;
  description: string;
  placesToVisit?: string[];
  activities?: string[];
  mealsIncluded?: MealType[];
  accommodation?: string;
  drivingDistanceKm?: number;
  drivingTime?: string;
  altitude?: string;
  morningActivities?: string;
  afternoonActivities?: string;
  eveningActivities?: string;
  tips?: string;
  images?: string[];
  hasOvernightStay?: boolean;
}

export interface CreatePackagePricingDto {
  numberOfPersons: number;
  roomType?: PackageRoomType;
  seasonType?: SeasonType;
  pricePerHead: number;
  costPricePerHead?: number;
  minPricePerHead?: number;
  maxDiscountPercent?: number;
  transportCost?: number;
  accommodationCost?: number;
  mealCost?: number;
  sightseeingCost?: number;
  validFrom?: string;
  validUntil?: string;
  isDefault?: boolean;
  notes?: string;
}

export interface CreatePackageInclusionDto {
  type: InclusionType;
  category: InclusionCategory;
  description: string;
  iconName?: string;
  displayOrder?: number;
  isHighlight?: boolean;
}

export interface CreatePackageDto {
  name: string;
  shortTitle?: string;
  description: string;
  packageType?: PackageType;
  category?: PackageCategory;
  numberOfNights: number;
  numberOfDays: number;
  destination: string;
  startingPoint?: string;
  endingPoint?: string;
  destinationsCovered?: string[];
  minPersons?: number;
  maxPersons?: number;
  minPricePerHead: number;
  basePricePerHead: number;
  bestTimeToVisit?: string;
  difficultyLevel?: string;
  suitableFor?: string[];
  highlights?: string[];
  images?: string[];
  thumbnailImage?: string;
  status?: PackageStatus;
  isFeatured?: boolean;
  validFrom?: string;
  validUntil?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
  importantNotes?: string;
  tags?: string[];
  itineraries?: CreatePackageItineraryDto[];
  pricingTiers?: CreatePackagePricingDto[];
  inclusions?: CreatePackageInclusionDto[];
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {}

export interface UpdatePackagePricingDto extends Partial<CreatePackagePricingDto> {}

export interface CreateCustomPackageItineraryDto {
  dayNumber: number;
  date?: string;
  title: string;
  destination: string;
  activities: string;
  placesToVisit?: string[];
  accommodationName?: string;
  accommodationCost?: number;
  mealsIncluded?: string[];
  transportDetails?: string;
  transportCost?: number;
  drivingDistanceKm?: number;
  notes?: string;
  estimatedDayCost?: number;
}

export interface CreateCustomPackageDto {
  leadId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  title: string;
  destinations: string[];
  numberOfNights: number;
  numberOfDays: number;
  numberOfAdults: number;
  numberOfChildren?: number;
  travelStartDate: string;
  travelEndDate: string;
  customerBudget?: number;
  specialRequirements?: string;
  accommodationPreference?: string;
  transportPreference?: string;
  mealPreference?: string;
  internalNotes?: string;
  inclusions?: string[];
  exclusions?: string[];
  assignedTo?: string;
  itineraries?: CreateCustomPackageItineraryDto[];
}

export interface UpdateCustomPackageDto extends Partial<CreateCustomPackageDto> {
  status?: CustomPackageStatus;
  quotedPricePerHead?: number;
  totalQuotedPrice?: number;
  finalPrice?: number;
  costPrice?: number;
  discountAmount?: number;
  quoteValidUntil?: string;
  bookingId?: string;
}

export interface UpdateCustomPackageItineraryDto extends Partial<CreateCustomPackageItineraryDto> {}

export interface FilterPackageDto {
  packageType?: PackageType;
  category?: PackageCategory;
  status?: PackageStatus;
  destination?: string;
  numberOfNights?: number;
  isFeatured?: boolean;
  search?: string;
  organizationId?: string;
  organizationSlug?: string;
}

export interface FilterCustomPackageDto {
  status?: CustomPackageStatus;
  assignedTo?: string;
  search?: string;
}

export interface PackageStatistics {
  predefinedPackages: {
    total: number;
    active: number;
    draft: number;
    featured: number;
  };
  customPackages: {
    total: number;
    draft: number;
    quoteSent: number;
    confirmed: number;
    completed: number;
  };
}

export interface SendQuoteDto {
  quotedPricePerHead: number;
  totalQuotedPrice: number;
  validUntil: string;
}

export interface ConfirmPackageDto {
  finalPrice: number;
}
