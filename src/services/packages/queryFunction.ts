import axiosInstance from '../axiosinstance';
import {
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
  PackageStatus,
  CustomPackageStatus,
  SendQuoteDto,
  ConfirmPackageDto,
} from './types';

// ==================== PREDEFINED PACKAGES API ====================

export const packageApi = {
  // Create package
  createPackage: async (data: CreatePackageDto): Promise<Package> => {
    const response = await axiosInstance.post<Package>('/packages', data);
    return response.data;
  },

  // Get all packages
  getAllPackages: async (filters?: FilterPackageDto): Promise<Package[]> => {
    const response = await axiosInstance.get<Package[]>('/packages', { params: filters });
    return response.data;
  },

  // Get package by ID
  getPackageById: async (id: string, shareToken?: string): Promise<Package> => {
    if (shareToken) {
      // Use the token-aware public endpoint
      const response = await axiosInstance.get<Package>(`/packages/public/${id}`, {
        params: { st: shareToken },
      });
      return response.data;
    }
    const response = await axiosInstance.get<Package>(`/packages/${id}`);
    return response.data;
  },

  // Generate a secure HMAC-signed share token
  generateShareToken: async (
    packageId: string,
    showPricing: boolean,
  ): Promise<{ token: string }> => {
    const response = await axiosInstance.post<{ token: string }>(
      `/packages/${packageId}/share-token`,
      { showPricing },
    );
    return response.data;
  },

  // Get package by code
  getPackageByCode: async (code: string): Promise<Package> => {
    const response = await axiosInstance.get<Package>(`/packages/code/${code}`);
    return response.data;
  },

  // Update package
  updatePackage: async (id: string, data: UpdatePackageDto): Promise<Package> => {
    const response = await axiosInstance.put<Package>(`/packages/${id}`, data);
    return response.data;
  },

  // Update package status
  updatePackageStatus: async (id: string, status: PackageStatus): Promise<Package> => {
    const response = await axiosInstance.patch<Package>(`/packages/${id}/status`, { status });
    return response.data;
  },

  // Delete package
  deletePackage: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/packages/${id}`);
  },

  // Get package statistics
  getPackageStatistics: async (): Promise<PackageStatistics> => {
    const response = await axiosInstance.get<PackageStatistics>('/packages/statistics');
    return response.data;
  },

  // Get popular packages
  getPopularPackages: async (limit?: number): Promise<Package[]> => {
    const response = await axiosInstance.get<Package[]>('/packages/popular', { params: { limit } });
    return response.data;
  },

  // Get featured packages
  getFeaturedPackages: async (): Promise<Package[]> => {
    const response = await axiosInstance.get<Package[]>('/packages/featured');
    return response.data;
  },
};

// ==================== ITINERARY API ====================

export const itineraryApi = {
  // Add itinerary to package
  addItinerary: async (packageId: string, data: CreatePackageItineraryDto): Promise<PackageItinerary> => {
    const response = await axiosInstance.post<PackageItinerary>(`/packages/${packageId}/itineraries`, data);
    return response.data;
  },

  // Update itinerary
  updateItinerary: async (itineraryId: string, data: Partial<CreatePackageItineraryDto>): Promise<PackageItinerary> => {
    const response = await axiosInstance.put<PackageItinerary>(`/packages/itineraries/${itineraryId}`, data);
    return response.data;
  },

  // Delete itinerary
  deleteItinerary: async (itineraryId: string): Promise<void> => {
    await axiosInstance.delete(`/packages/itineraries/${itineraryId}`);
  },
};

// ==================== PRICING API ====================

export const pricingApi = {
  // Add pricing tier
  addPricing: async (packageId: string, data: CreatePackagePricingDto): Promise<PackagePricing> => {
    const response = await axiosInstance.post<PackagePricing>(`/packages/${packageId}/pricing`, data);
    return response.data;
  },

  // Update pricing tier
  updatePricing: async (pricingId: string, data: UpdatePackagePricingDto): Promise<PackagePricing> => {
    const response = await axiosInstance.put<PackagePricing>(`/packages/pricing/${pricingId}`, data);
    return response.data;
  },

  // Delete pricing tier
  deletePricing: async (pricingId: string): Promise<void> => {
    await axiosInstance.delete(`/packages/pricing/${pricingId}`);
  },

  // Bulk update pricing
  bulkUpdatePricing: async (packageId: string, pricingTiers: CreatePackagePricingDto[]): Promise<PackagePricing[]> => {
    const response = await axiosInstance.put<PackagePricing[]>(`/packages/${packageId}/pricing/bulk`, pricingTiers);
    return response.data;
  },

  // Get pricing for number of persons
  getPricingForPersons: async (packageId: string, numberOfPersons: number): Promise<PackagePricing> => {
    const response = await axiosInstance.get<PackagePricing>(`/packages/${packageId}/pricing/${numberOfPersons}`);
    return response.data;
  },
};

// ==================== INCLUSION API ====================

export const inclusionApi = {
  // Add inclusion
  addInclusion: async (packageId: string, data: CreatePackageInclusionDto): Promise<PackageInclusion> => {
    const response = await axiosInstance.post<PackageInclusion>(`/packages/${packageId}/inclusions`, data);
    return response.data;
  },

  // Update inclusion
  updateInclusion: async (inclusionId: string, data: Partial<CreatePackageInclusionDto>): Promise<PackageInclusion> => {
    const response = await axiosInstance.put<PackageInclusion>(`/packages/inclusions/${inclusionId}`, data);
    return response.data;
  },

  // Delete inclusion
  deleteInclusion: async (inclusionId: string): Promise<void> => {
    await axiosInstance.delete(`/packages/inclusions/${inclusionId}`);
  },
};

// ==================== CUSTOM PACKAGES API ====================

export const customPackageApi = {
  // Create custom package
  createCustomPackage: async (data: CreateCustomPackageDto): Promise<CustomPackage> => {
    const response = await axiosInstance.post<CustomPackage>('/packages/custom', data);
    return response.data;
  },

  // Get all custom packages
  getAllCustomPackages: async (filters?: FilterCustomPackageDto): Promise<CustomPackage[]> => {
    const response = await axiosInstance.get<CustomPackage[]>('/packages/custom', { params: filters });
    return response.data;
  },

  // Get custom package by ID
  getCustomPackageById: async (id: string): Promise<CustomPackage> => {
    const response = await axiosInstance.get<CustomPackage>(`/packages/custom/${id}`);
    return response.data;
  },

  // Get custom package by reference
  getCustomPackageByReference: async (reference: string): Promise<CustomPackage> => {
    const response = await axiosInstance.get<CustomPackage>(`/packages/custom/reference/${reference}`);
    return response.data;
  },

  // Update custom package
  updateCustomPackage: async (id: string, data: UpdateCustomPackageDto): Promise<CustomPackage> => {
    const response = await axiosInstance.put<CustomPackage>(`/packages/custom/${id}`, data);
    return response.data;
  },

  // Update custom package status
  updateCustomPackageStatus: async (id: string, status: CustomPackageStatus): Promise<CustomPackage> => {
    const response = await axiosInstance.patch<CustomPackage>(`/packages/custom/${id}/status`, { status });
    return response.data;
  },

  // Send quote
  sendQuote: async (id: string, data: SendQuoteDto): Promise<CustomPackage> => {
    const response = await axiosInstance.patch<CustomPackage>(`/packages/custom/${id}/send-quote`, data);
    return response.data;
  },

  // Confirm custom package
  confirmCustomPackage: async (id: string, data: ConfirmPackageDto): Promise<CustomPackage> => {
    const response = await axiosInstance.patch<CustomPackage>(`/packages/custom/${id}/confirm`, data);
    return response.data;
  },

  // Delete custom package
  deleteCustomPackage: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/packages/custom/${id}`);
  },
};

// ==================== CUSTOM ITINERARY API ====================

export const customItineraryApi = {
  // Add custom itinerary
  addCustomItinerary: async (customPackageId: string, data: CreateCustomPackageItineraryDto): Promise<CustomPackageItinerary> => {
    const response = await axiosInstance.post<CustomPackageItinerary>(`/packages/custom/${customPackageId}/itineraries`, data);
    return response.data;
  },

  // Update custom itinerary
  updateCustomItinerary: async (itineraryId: string, data: UpdateCustomPackageItineraryDto): Promise<CustomPackageItinerary> => {
    const response = await axiosInstance.put<CustomPackageItinerary>(`/packages/custom/itineraries/${itineraryId}`, data);
    return response.data;
  },

  // Delete custom itinerary
  deleteCustomItinerary: async (itineraryId: string): Promise<void> => {
    await axiosInstance.delete(`/packages/custom/itineraries/${itineraryId}`);
  },
};
