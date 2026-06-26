import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPackageBooking,
  getPackageBookings,
  getPackageBookingById,
  getPackageBookingByReference,
  updatePackageBooking,
  updatePackageBookingStatus,
  addPackagePayment,
  getPackageBookingStatistics,
  getUpcomingPackageBookings,
} from './queryFunction';
import {
  CreatePackageBookingDto,
  UpdatePackageBookingDto,
  UpdatePackageBookingStatusDto,
  FilterPackageBookingDto,
  AddPackagePaymentDto,
  PackageBookingStatus,
} from './types';

// Export types
export * from './types';

// Query keys
export const packageBookingKeys = {
  all: ['package-bookings'] as const,
  lists: () => [...packageBookingKeys.all, 'list'] as const,
  list: (filters?: FilterPackageBookingDto) =>
    [...packageBookingKeys.lists(), filters] as const,
  details: () => [...packageBookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...packageBookingKeys.details(), id] as const,
  reference: (ref: string) => [...packageBookingKeys.all, 'reference', ref] as const,
  statistics: (packageId?: string) =>
    [...packageBookingKeys.all, 'statistics', packageId] as const,
  upcoming: (days?: number) => [...packageBookingKeys.all, 'upcoming', days] as const,
};

// Query Hooks

/**
 * Get all package bookings with optional filters
 */
export const usePackageBookings = (filters?: FilterPackageBookingDto) => {
  return useQuery({
    queryKey: packageBookingKeys.list(filters),
    queryFn: () => getPackageBookings(filters),
  });
};

/**
 * Get package booking by ID
 */
export const usePackageBooking = (id: string) => {
  return useQuery({
    queryKey: packageBookingKeys.detail(id),
    queryFn: () => getPackageBookingById(id),
    enabled: !!id,
  });
};

/**
 * Get package booking by reference
 */
export const usePackageBookingByReference = (reference: string) => {
  return useQuery({
    queryKey: packageBookingKeys.reference(reference),
    queryFn: () => getPackageBookingByReference(reference),
    enabled: !!reference,
  });
};

/**
 * Get package booking statistics
 */
export const usePackageBookingStatistics = (packageId?: string) => {
  return useQuery({
    queryKey: packageBookingKeys.statistics(packageId),
    queryFn: () => getPackageBookingStatistics(packageId),
  });
};

/**
 * Get upcoming package bookings
 */
export const useUpcomingPackageBookings = (days?: number) => {
  return useQuery({
    queryKey: packageBookingKeys.upcoming(days),
    queryFn: () => getUpcomingPackageBookings(days),
  });
};

// Mutation Hooks

/**
 * Create a new package booking
 */
export const useCreatePackageBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePackageBookingDto) => createPackageBooking(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: packageBookingKeys.all });
    },
  });
};

/**
 * Update package booking
 */
export const useUpdatePackageBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageBookingDto }) =>
      updatePackageBooking(id, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: packageBookingKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: packageBookingKeys.lists() });
    },
  });
};

/**
 * Update package booking status
 */
export const useUpdatePackageBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePackageBookingStatusDto;
    }) => updatePackageBookingStatus(id, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: packageBookingKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: packageBookingKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: packageBookingKeys.statistics(),
      });
    },
  });
};

/**
 * Add payment to package booking
 */
export const useAddPackagePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: AddPackagePaymentDto;
    }) => addPackagePayment(bookingId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: packageBookingKeys.detail(variables.bookingId),
      });
      void queryClient.invalidateQueries({ queryKey: packageBookingKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: packageBookingKeys.statistics(),
      });
    },
  });
};

/**
 * Confirm package booking (convenience hook)
 */
export const useConfirmPackageBooking = () => {
  const updateStatus = useUpdatePackageBookingStatus();

  return useMutation({
    mutationFn: (id: string) =>
      updateStatus.mutateAsync({
        id,
        data: { status: PackageBookingStatus.CONFIRMED },
      }),
  });
};

/**
 * Cancel package booking (convenience hook)
 */
export const useCancelPackageBooking = () => {
  const updateStatus = useUpdatePackageBookingStatus();

  return useMutation({
    mutationFn: ({
      id,
      cancellationReason,
    }: {
      id: string;
      cancellationReason?: string;
    }) =>
      updateStatus.mutateAsync({
        id,
        data: {
          status: PackageBookingStatus.CANCELLED,
          cancellationReason,
        },
      }),
  });
};

/**
 * Complete package booking (convenience hook)
 */
export const useCompletePackageBooking = () => {
  const updateStatus = useUpdatePackageBookingStatus();

  return useMutation({
    mutationFn: (id: string) =>
      updateStatus.mutateAsync({
        id,
        data: { status: PackageBookingStatus.COMPLETED },
      }),
  });
};
