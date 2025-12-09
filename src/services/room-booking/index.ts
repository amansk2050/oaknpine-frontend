import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { bookingApi, paymentApi } from './queryFunction';
import {
  Booking,
  CreateBookingDto,
  UpdateBookingDto,
  UpdateBookingStatusDto,
  Payment,
  CreatePaymentDto,
  CheckInDto,
  CheckOutDto,
  FilterBookingDto,
  BookingStatistics,
} from './types';

// Query Keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters?: FilterBookingDto) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  byReference: (reference: string) => [...bookingKeys.all, 'reference', reference] as const,
  statistics: (homestayId?: string) => [...bookingKeys.all, 'statistics', homestayId] as const,
  todayCheckIns: (homestayId?: string) => [...bookingKeys.all, 'today-check-ins', homestayId] as const,
  todayCheckOuts: (homestayId?: string) => [...bookingKeys.all, 'today-check-outs', homestayId] as const,
  payments: (bookingId: string) => [...bookingKeys.all, 'payments', bookingId] as const,
};

// ===== BOOKING HOOKS =====

// Get all bookings
export const useBookings = (filters?: FilterBookingDto, options?: UseQueryOptions<Booking[]>) => {
  return useQuery<Booking[]>({
    queryKey: bookingKeys.list(filters),
    queryFn: () => bookingApi.getAllBookings(filters),
    ...options,
  });
};

// Get booking by ID
export const useBooking = (id: string, options?: UseQueryOptions<Booking>) => {
  return useQuery<Booking>({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingApi.getBookingById(id),
    enabled: !!id,
    ...options,
  });
};

// Get booking by reference
export const useBookingByReference = (reference: string, options?: UseQueryOptions<Booking>) => {
  return useQuery<Booking>({
    queryKey: bookingKeys.byReference(reference),
    queryFn: () => bookingApi.getBookingByReference(reference),
    enabled: !!reference,
    ...options,
  });
};

// Get booking statistics
export const useBookingStatistics = (homestayId?: string, options?: UseQueryOptions<BookingStatistics>) => {
  return useQuery<BookingStatistics>({
    queryKey: bookingKeys.statistics(homestayId),
    queryFn: () => bookingApi.getBookingStatistics(homestayId),
    ...options,
  });
};

// Get today's check-ins
export const useTodayCheckIns = (homestayId?: string, options?: UseQueryOptions<Booking[]>) => {
  return useQuery<Booking[]>({
    queryKey: bookingKeys.todayCheckIns(homestayId),
    queryFn: () => bookingApi.getTodayCheckIns(homestayId),
    ...options,
  });
};

// Get today's check-outs
export const useTodayCheckOuts = (homestayId?: string, options?: UseQueryOptions<Booking[]>) => {
  return useQuery<Booking[]>({
    queryKey: bookingKeys.todayCheckOuts(homestayId),
    queryFn: () => bookingApi.getTodayCheckOuts(homestayId),
    ...options,
  });
};

// Create booking
export const useCreateBooking = (options?: UseMutationOptions<Booking, Error, CreateBookingDto>) => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, CreateBookingDto>({
    mutationFn: bookingApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
    ...options,
  });
};

// Update booking
export const useUpdateBooking = (
  options?: UseMutationOptions<Booking, Error, { id: string; data: UpdateBookingDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, { id: string; data: UpdateBookingDto }>({
    mutationFn: ({ id, data }) => bookingApi.updateBooking(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
    ...options,
  });
};

// Update booking status
export const useUpdateBookingStatus = (
  options?: UseMutationOptions<Booking, Error, { id: string; data: UpdateBookingStatusDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, { id: string; data: UpdateBookingStatusDto }>({
    mutationFn: ({ id, data }) => bookingApi.updateBookingStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
    ...options,
  });
};

// Check-in
export const useCheckIn = (
  options?: UseMutationOptions<Booking, Error, { id: string; data: CheckInDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, { id: string; data: CheckInDto }>({
    mutationFn: ({ id, data }) => bookingApi.checkIn(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.todayCheckIns(data.homestayId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics(data.homestayId) });
    },
    ...options,
  });
};

// Check-out
export const useCheckOut = (
  options?: UseMutationOptions<Booking, Error, { id: string; data: CheckOutDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, { id: string; data: CheckOutDto }>({
    mutationFn: ({ id, data }) => bookingApi.checkOut(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.todayCheckOuts(data.homestayId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics(data.homestayId) });
    },
    ...options,
  });
};

// ===== PAYMENT HOOKS =====

// Get payments by booking
export const usePaymentsByBooking = (bookingId: string, options?: UseQueryOptions<Payment[]>) => {
  return useQuery<Payment[]>({
    queryKey: bookingKeys.payments(bookingId),
    queryFn: () => paymentApi.getPaymentsByBooking(bookingId),
    enabled: !!bookingId,
    ...options,
  });
};

// Add payment
export const useAddPayment = (
  options?: UseMutationOptions<Payment, Error, { bookingId: string; data: CreatePaymentDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Payment, Error, { bookingId: string; data: CreatePaymentDto }>({
    mutationFn: ({ bookingId, data }) => paymentApi.addPayment(bookingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.payments(variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
    },
    ...options,
  });
};

// Export types
export * from './types';
