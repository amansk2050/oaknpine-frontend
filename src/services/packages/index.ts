import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  packageApi,
  itineraryApi,
  pricingApi,
  inclusionApi,
  customPackageApi,
  customItineraryApi,
} from './queryFunction';
import type {
  Package,
  CreatePackageDto,
  UpdatePackageDto,
  PackageItinerary,
  CreatePackageItineraryDto,
  PackagePricing,
  CreatePackagePricingDto,
  UpdatePackagePricingDto,
  PackageInclusion,
  CreatePackageInclusionDto,
  CustomPackage,
  CreateCustomPackageDto,
  UpdateCustomPackageDto,
  CustomPackageItinerary,
  CreateCustomPackageItineraryDto,
  UpdateCustomPackageItineraryDto,
  FilterPackageDto,
  FilterCustomPackageDto,
  PackageStatistics,
  SendQuoteDto,
  ConfirmPackageDto,
} from './types';
import {
  PackageStatus,
  CustomPackageStatus,
} from './types';

// Query Keys
export const packageKeys = {
  all: ['packages'] as const,
  lists: () => [...packageKeys.all, 'list'] as const,
  list: (filters?: FilterPackageDto) => [...packageKeys.lists(), filters] as const,
  details: () => [...packageKeys.all, 'detail'] as const,
  detail: (id: string) => [...packageKeys.details(), id] as const,
  byCode: (code: string) => [...packageKeys.all, 'code', code] as const,
  statistics: () => [...packageKeys.all, 'statistics'] as const,
  popular: (limit?: number) => [...packageKeys.all, 'popular', limit] as const,
  featured: () => [...packageKeys.all, 'featured'] as const,
  pricing: (packageId: string, numberOfPersons: number) => [...packageKeys.all, 'pricing', packageId, numberOfPersons] as const,
  customAll: ['custom-packages'] as const,
  customLists: () => [...packageKeys.customAll, 'list'] as const,
  customList: (filters?: FilterCustomPackageDto) => [...packageKeys.customLists(), filters] as const,
  customDetails: () => [...packageKeys.customAll, 'detail'] as const,
  customDetail: (id: string) => [...packageKeys.customDetails(), id] as const,
  customByReference: (reference: string) => [...packageKeys.customAll, 'reference', reference] as const,
};

// ==================== PREDEFINED PACKAGE HOOKS ====================

export const usePackages = (filters?: FilterPackageDto, options?: UseQueryOptions<Package[]>) => {
  return useQuery<Package[]>({
    queryKey: packageKeys.list(filters),
    queryFn: () => packageApi.getAllPackages(filters),
    ...options,
  });
};

export const usePackage = (id: string, shareToken?: string, options?: UseQueryOptions<Package>) => {
  return useQuery<Package>({
    queryKey: shareToken ? [...packageKeys.detail(id), shareToken] : packageKeys.detail(id),
    queryFn: () => packageApi.getPackageById(id, shareToken),
    enabled: !!id,
    ...options,
  });
};

export const useGenerateShareToken = (
  options?: UseMutationOptions<{ token: string }, Error, { packageId: string; showPricing: boolean }>,
) => {
  return useMutation<{ token: string }, Error, { packageId: string; showPricing: boolean }>({
    mutationFn: ({ packageId, showPricing }) =>
      packageApi.generateShareToken(packageId, showPricing),
    ...options,
  });
};

export const usePackageByCode = (code: string, options?: UseQueryOptions<Package>) => {
  return useQuery<Package>({
    queryKey: packageKeys.byCode(code),
    queryFn: () => packageApi.getPackageByCode(code),
    enabled: !!code,
    ...options,
  });
};

export const usePackageStatistics = (options?: UseQueryOptions<PackageStatistics>) => {
  return useQuery<PackageStatistics>({
    queryKey: packageKeys.statistics(),
    queryFn: packageApi.getPackageStatistics,
    ...options,
  });
};

export const usePopularPackages = (limit?: number, options?: UseQueryOptions<Package[]>) => {
  return useQuery<Package[]>({
    queryKey: packageKeys.popular(limit),
    queryFn: () => packageApi.getPopularPackages(limit),
    ...options,
  });
};

export const useFeaturedPackages = (options?: UseQueryOptions<Package[]>) => {
  return useQuery<Package[]>({
    queryKey: packageKeys.featured(),
    queryFn: packageApi.getFeaturedPackages,
    ...options,
  });
};

export const useCreatePackage = (options?: UseMutationOptions<Package, Error, CreatePackageDto>) => {
  const queryClient = useQueryClient();
  return useMutation<Package, Error, CreatePackageDto>({
    mutationFn: packageApi.createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.statistics() });
    },
    ...options,
  });
};

export const useUpdatePackage = (options?: UseMutationOptions<Package, Error, { id: string; data: UpdatePackageDto }>) => {
  const queryClient = useQueryClient();
  return useMutation<Package, Error, { id: string; data: UpdatePackageDto }>({
    mutationFn: ({ id, data }) => packageApi.updatePackage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.id) });
    },
    ...options,
  });
};

export const useUpdatePackageStatus = (options?: UseMutationOptions<Package, Error, { id: string; status: PackageStatus }>) => {
  const queryClient = useQueryClient();
  return useMutation<Package, Error, { id: string; status: PackageStatus }>({
    mutationFn: ({ id, status }) => packageApi.updatePackageStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: packageKeys.statistics() });
    },
    ...options,
  });
};

export const useDeletePackage = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: packageApi.deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.statistics() });
    },
    ...options,
  });
};

// ==================== ITINERARY HOOKS ====================

export const useAddItinerary = (options?: UseMutationOptions<PackageItinerary, Error, { packageId: string; data: CreatePackageItineraryDto }>) => {
  const queryClient = useQueryClient();
  return useMutation<PackageItinerary, Error, { packageId: string; data: CreatePackageItineraryDto }>({
    mutationFn: ({ packageId, data }) => itineraryApi.addItinerary(packageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

export const useUpdateItinerary = (options?: UseMutationOptions<PackageItinerary, Error, { itineraryId: string; data: Partial<CreatePackageItineraryDto>; packageId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<PackageItinerary, Error, { itineraryId: string; data: Partial<CreatePackageItineraryDto>; packageId: string }>({
    mutationFn: ({ itineraryId, data }) => itineraryApi.updateItinerary(itineraryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

export const useDeleteItinerary = (options?: UseMutationOptions<void, Error, { itineraryId: string; packageId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { itineraryId: string; packageId: string }>({
    mutationFn: ({ itineraryId }) => itineraryApi.deleteItinerary(itineraryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

// ==================== PRICING HOOKS ====================

export const usePricingForPersons = (packageId: string, numberOfPersons: number, options?: UseQueryOptions<PackagePricing>) => {
  return useQuery<PackagePricing>({
    queryKey: packageKeys.pricing(packageId, numberOfPersons),
    queryFn: () => pricingApi.getPricingForPersons(packageId, numberOfPersons),
    enabled: !!packageId && numberOfPersons >= 2,
    ...options,
  });
};

export const useAddPricing = (options?: UseMutationOptions<PackagePricing, Error, { packageId: string; data: CreatePackagePricingDto }>) => {
  const queryClient = useQueryClient();
  return useMutation<PackagePricing, Error, { packageId: string; data: CreatePackagePricingDto }>({
    mutationFn: ({ packageId, data }) => pricingApi.addPricing(packageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

export const useUpdatePricing = (options?: UseMutationOptions<PackagePricing, Error, { pricingId: string; data: UpdatePackagePricingDto; packageId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<PackagePricing, Error, { pricingId: string; data: UpdatePackagePricingDto; packageId: string }>({
    mutationFn: ({ pricingId, data }) => pricingApi.updatePricing(pricingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

export const useDeletePricing = (options?: UseMutationOptions<void, Error, { pricingId: string; packageId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { pricingId: string; packageId: string }>({
    mutationFn: ({ pricingId }) => pricingApi.deletePricing(pricingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

export const useBulkUpdatePricing = (options?: UseMutationOptions<PackagePricing[], Error, { packageId: string; pricingTiers: CreatePackagePricingDto[] }>) => {
  const queryClient = useQueryClient();
  return useMutation<PackagePricing[], Error, { packageId: string; pricingTiers: CreatePackagePricingDto[] }>({
    mutationFn: ({ packageId, pricingTiers }) => pricingApi.bulkUpdatePricing(packageId, pricingTiers),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

// ==================== INCLUSION HOOKS ====================

export const useAddInclusion = (options?: UseMutationOptions<PackageInclusion, Error, { packageId: string; data: CreatePackageInclusionDto }>) => {
  const queryClient = useQueryClient();
  return useMutation<PackageInclusion, Error, { packageId: string; data: CreatePackageInclusionDto }>({
    mutationFn: ({ packageId, data }) => inclusionApi.addInclusion(packageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

export const useUpdateInclusion = (options?: UseMutationOptions<PackageInclusion, Error, { inclusionId: string; data: Partial<CreatePackageInclusionDto>; packageId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<PackageInclusion, Error, { inclusionId: string; data: Partial<CreatePackageInclusionDto>; packageId: string }>({
    mutationFn: ({ inclusionId, data }) => inclusionApi.updateInclusion(inclusionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

export const useDeleteInclusion = (options?: UseMutationOptions<void, Error, { inclusionId: string; packageId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { inclusionId: string; packageId: string }>({
    mutationFn: ({ inclusionId }) => inclusionApi.deleteInclusion(inclusionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.detail(variables.packageId) });
    },
    ...options,
  });
};

// ==================== CUSTOM PACKAGE HOOKS ====================

export const useCustomPackages = (filters?: FilterCustomPackageDto, options?: UseQueryOptions<CustomPackage[]>) => {
  return useQuery<CustomPackage[]>({
    queryKey: packageKeys.customList(filters),
    queryFn: () => customPackageApi.getAllCustomPackages(filters),
    ...options,
  });
};

export const useCustomPackage = (id: string, options?: UseQueryOptions<CustomPackage>) => {
  return useQuery<CustomPackage>({
    queryKey: packageKeys.customDetail(id),
    queryFn: () => customPackageApi.getCustomPackageById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCustomPackageByReference = (reference: string, options?: UseQueryOptions<CustomPackage>) => {
  return useQuery<CustomPackage>({
    queryKey: packageKeys.customByReference(reference),
    queryFn: () => customPackageApi.getCustomPackageByReference(reference),
    enabled: !!reference,
    ...options,
  });
};

export const useCreateCustomPackage = (options?: UseMutationOptions<CustomPackage, Error, CreateCustomPackageDto>) => {
  const queryClient = useQueryClient();
  return useMutation<CustomPackage, Error, CreateCustomPackageDto>({
    mutationFn: customPackageApi.createCustomPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customLists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.statistics() });
    },
    ...options,
  });
};

export const useUpdateCustomPackage = (options?: UseMutationOptions<CustomPackage, Error, { id: string; data: UpdateCustomPackageDto }>) => {
  const queryClient = useQueryClient();
  return useMutation<CustomPackage, Error, { id: string; data: UpdateCustomPackageDto }>({
    mutationFn: ({ id, data }) => customPackageApi.updateCustomPackage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customLists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.customDetail(variables.id) });
    },
    ...options,
  });
};

export const useUpdateCustomPackageStatus = (options?: UseMutationOptions<CustomPackage, Error, { id: string; status: CustomPackageStatus }>) => {
  const queryClient = useQueryClient();
  return useMutation<CustomPackage, Error, { id: string; status: CustomPackageStatus }>({
    mutationFn: ({ id, status }) => customPackageApi.updateCustomPackageStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customLists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.customDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: packageKeys.statistics() });
    },
    ...options,
  });
};

export const useSendQuote = (options?: UseMutationOptions<CustomPackage, Error, { id: string; data: SendQuoteDto }>) => {
  const queryClient = useQueryClient();
  return useMutation<CustomPackage, Error, { id: string; data: SendQuoteDto }>({
    mutationFn: ({ id, data }) => customPackageApi.sendQuote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customLists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.customDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: packageKeys.statistics() });
    },
    ...options,
  });
};

export const useConfirmCustomPackage = (options?: UseMutationOptions<CustomPackage, Error, { id: string; data: ConfirmPackageDto }>) => {
  const queryClient = useQueryClient();
  return useMutation<CustomPackage, Error, { id: string; data: ConfirmPackageDto }>({
    mutationFn: ({ id, data }) => customPackageApi.confirmCustomPackage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customLists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.customDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: packageKeys.statistics() });
    },
    ...options,
  });
};

export const useDeleteCustomPackage = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: customPackageApi.deleteCustomPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customLists() });
      queryClient.invalidateQueries({ queryKey: packageKeys.statistics() });
    },
    ...options,
  });
};

// ==================== CUSTOM ITINERARY HOOKS ====================

export const useAddCustomItinerary = (options?: UseMutationOptions<CustomPackageItinerary, Error, { customPackageId: string; data: CreateCustomPackageItineraryDto }>) => {
  const queryClient = useQueryClient();
  return useMutation<CustomPackageItinerary, Error, { customPackageId: string; data: CreateCustomPackageItineraryDto }>({
    mutationFn: ({ customPackageId, data }) => customItineraryApi.addCustomItinerary(customPackageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customDetail(variables.customPackageId) });
    },
    ...options,
  });
};

export const useUpdateCustomItinerary = (options?: UseMutationOptions<CustomPackageItinerary, Error, { itineraryId: string; data: UpdateCustomPackageItineraryDto; customPackageId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<CustomPackageItinerary, Error, { itineraryId: string; data: UpdateCustomPackageItineraryDto; customPackageId: string }>({
    mutationFn: ({ itineraryId, data }) => customItineraryApi.updateCustomItinerary(itineraryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customDetail(variables.customPackageId) });
    },
    ...options,
  });
};

export const useDeleteCustomItinerary = (options?: UseMutationOptions<void, Error, { itineraryId: string; customPackageId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { itineraryId: string; customPackageId: string }>({
    mutationFn: ({ itineraryId }) => customItineraryApi.deleteCustomItinerary(itineraryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.customDetail(variables.customPackageId) });
    },
    ...options,
  });
};

// Export types
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
} from './types';

// Export enums
export {
  PackageType,
  PackageStatus,
  PackageCategory,
  MealType,
  PackageRoomType,
  SeasonType,
  InclusionType,
  InclusionCategory,
  CustomPackageStatus,
} from './types';
