import axiosInstance from '../axiosinstance';
import {
  BookingExpense,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseStatistics,
} from './types';

export const expenseApi = {
  createExpense: async (data: CreateExpenseDto): Promise<BookingExpense> => {
    const response = await axiosInstance.post<BookingExpense>('/expense', data);
    return response.data;
  },

  getExpensesByBooking: async (bookingId: string): Promise<BookingExpense[]> => {
    const response = await axiosInstance.get<BookingExpense[]>(`/expense/booking/${bookingId}`);
    return response.data;
  },

  getExpensesByPackageBooking: async (packageBookingId: string): Promise<BookingExpense[]> => {
    const response = await axiosInstance.get<BookingExpense[]>(`/expense/package-booking/${packageBookingId}`);
    return response.data;
  },

  updateExpense: async (id: string, data: UpdateExpenseDto): Promise<BookingExpense> => {
    const response = await axiosInstance.patch<BookingExpense>(`/expense/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/expense/${id}`);
  },

  getExpenseStatistics: async (): Promise<ExpenseStatistics> => {
    const response = await axiosInstance.get<ExpenseStatistics>('/expense/statistics');
    return response.data;
  },
};
