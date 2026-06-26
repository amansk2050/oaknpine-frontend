import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { expenseApi } from './queryFunction';
import {
  BookingExpense,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseStatistics,
} from './types';

// Query Keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  byBooking: (bookingId: string) => [...expenseKeys.lists(), 'booking', bookingId] as const,
  byPackageBooking: (packageBookingId: string) => [...expenseKeys.lists(), 'package-booking', packageBookingId] as const,
  statistics: () => [...expenseKeys.all, 'statistics'] as const,
};

// Hook to get expenses for a standard booking
export const useExpensesByBooking = (
  bookingId: string,
  options?: UseQueryOptions<BookingExpense[]>
) => {
  return useQuery<BookingExpense[]>({
    queryKey: expenseKeys.byBooking(bookingId),
    queryFn: () => expenseApi.getExpensesByBooking(bookingId),
    enabled: !!bookingId,
    ...options,
  });
};

// Hook to get expenses for a package booking
export const useExpensesByPackageBooking = (
  packageBookingId: string,
  options?: UseQueryOptions<BookingExpense[]>
) => {
  return useQuery<BookingExpense[]>({
    queryKey: expenseKeys.byPackageBooking(packageBookingId),
    queryFn: () => expenseApi.getExpensesByPackageBooking(packageBookingId),
    enabled: !!packageBookingId,
    ...options,
  });
};

// Hook to get overall profit statistics
export const useExpenseStatistics = (
  options?: UseQueryOptions<ExpenseStatistics>
) => {
  return useQuery<ExpenseStatistics>({
    queryKey: expenseKeys.statistics(),
    queryFn: () => expenseApi.getExpenseStatistics(),
    ...options,
  });
};

// Hook to create an expense
export const useCreateExpense = (
  options?: UseMutationOptions<BookingExpense, Error, CreateExpenseDto>
) => {
  const queryClient = useQueryClient();

  return useMutation<BookingExpense, Error, CreateExpenseDto>({
    mutationFn: expenseApi.createExpense,
    onSuccess: (data) => {
      // Invalidate specific expense queries
      if (data.bookingId) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byBooking(data.bookingId) });
        queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', data.bookingId] });
      }
      if (data.packageBookingId) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byPackageBooking(data.packageBookingId) });
        queryClient.invalidateQueries({ queryKey: ['package-bookings', 'detail', data.packageBookingId] });
      }
      queryClient.invalidateQueries({ queryKey: expenseKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'statistics'] });
      queryClient.invalidateQueries({ queryKey: ['package-bookings', 'statistics'] });
    },
    ...options,
  });
};

// Hook to update an expense
export const useUpdateExpense = (
  options?: UseMutationOptions<BookingExpense, Error, { id: string; data: UpdateExpenseDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<BookingExpense, Error, { id: string; data: UpdateExpenseDto }>({
    mutationFn: ({ id, data }) => expenseApi.updateExpense(id, data),
    onSuccess: (data) => {
      if (data.bookingId) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byBooking(data.bookingId) });
        queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', data.bookingId] });
      }
      if (data.packageBookingId) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byPackageBooking(data.packageBookingId) });
        queryClient.invalidateQueries({ queryKey: ['package-bookings', 'detail', data.packageBookingId] });
      }
      queryClient.invalidateQueries({ queryKey: expenseKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'statistics'] });
      queryClient.invalidateQueries({ queryKey: ['package-bookings', 'statistics'] });
    },
    ...options,
  });
};

// Hook to delete an expense
export const useDeleteExpense = (
  options?: UseMutationOptions<void, Error, { id: string; bookingId?: string; packageBookingId?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; bookingId?: string; packageBookingId?: string }>({
    mutationFn: ({ id }) => expenseApi.deleteExpense(id),
    onSuccess: (_, variables) => {
      if (variables.bookingId) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byBooking(variables.bookingId) });
        queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', variables.bookingId] });
      }
      if (variables.packageBookingId) {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byPackageBooking(variables.packageBookingId) });
        queryClient.invalidateQueries({ queryKey: ['package-bookings', 'detail', variables.packageBookingId] });
      }
      queryClient.invalidateQueries({ queryKey: expenseKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'statistics'] });
      queryClient.invalidateQueries({ queryKey: ['package-bookings', 'statistics'] });
    },
    ...options,
  });
};

export * from './types';
