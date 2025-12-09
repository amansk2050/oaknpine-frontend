// Export all services

// Homestay service
export * from './homestay';

// Lead service
export * from './lead';

// Room booking service
export * from './room-booking';

// Packages service - export explicitly to avoid RoomType conflict
export {
  // Hooks
  packageKeys,
  usePackages,
  usePackage,
  usePackageByCode,
  usePackageStatistics,
  usePopularPackages,
  useFeaturedPackages,
  useCreatePackage,
  useUpdatePackage,
  useUpdatePackageStatus,
  useDeletePackage,
  useAddItinerary,
  useUpdateItinerary,
  useDeleteItinerary,
  usePricingForPersons,
  useAddPricing,
  useUpdatePricing,
  useDeletePricing,
  useBulkUpdatePricing,
  useAddInclusion,
  useUpdateInclusion,
  useDeleteInclusion,
  useCustomPackages,
  useCustomPackage,
  useCustomPackageByReference,
  useCreateCustomPackage,
  useUpdateCustomPackage,
  useUpdateCustomPackageStatus,
  useSendQuote,
  useConfirmCustomPackage,
  useDeleteCustomPackage,
  useAddCustomItinerary,
  useUpdateCustomItinerary,
  useDeleteCustomItinerary,
  // Enums
  PackageType,
  PackageStatus,
  PackageCategory,
  MealType,
  PackageRoomType,
  SeasonType,
  InclusionType,
  InclusionCategory,
  CustomPackageStatus,
} from './packages';

// Export package types
export type {
  Package,
  PackageItinerary,
  PackagePricing,
  PackageInclusion,
  CustomPackage,
  CustomPackageItinerary,
  CreatePackageDto,
  UpdatePackageDto,
  CreatePackageItineraryDto,
  CreatePackagePricingDto,
  UpdatePackagePricingDto,
  CreatePackageInclusionDto,
  CreateCustomPackageDto,
  UpdateCustomPackageDto,
  CreateCustomPackageItineraryDto,
  UpdateCustomPackageItineraryDto,
  FilterPackageDto,
  FilterCustomPackageDto,
  PackageStatistics,
  SendQuoteDto,
  ConfirmPackageDto,
} from './packages';
