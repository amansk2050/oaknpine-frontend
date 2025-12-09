import axiosInstance from '../axiosinstance';
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

// Booking API functions
export const bookingApi = {
  // Create booking
  createBooking: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await axiosInstance.post<Booking>('/booking', data);
    return response.data;
  },

  // Get all bookings
  getAllBookings: async (filters?: FilterBookingDto): Promise<Booking[]> => {
    const response = await axiosInstance.get<Booking[]>('/booking', {
      params: filters,
    });
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.get<Booking>(`/booking/${id}`);
    return response.data;
  },

  // Get booking by reference
  getBookingByReference: async (reference: string): Promise<Booking> => {
    const response = await axiosInstance.get<Booking>(`/booking/reference/${reference}`);
    return response.data;
  },

  // Update booking
  updateBooking: async (id: string, data: UpdateBookingDto): Promise<Booking> => {
    const response = await axiosInstance.put<Booking>(`/booking/${id}`, data);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id: string, data: UpdateBookingStatusDto): Promise<Booking> => {
    const response = await axiosInstance.patch<Booking>(`/booking/${id}/status`, data);
    return response.data;
  },

  // Check-in
  checkIn: async (id: string, data: CheckInDto): Promise<Booking> => {
    const response = await axiosInstance.patch<Booking>(`/booking/${id}/check-in`, data);
    return response.data;
  },

  // Check-out
  checkOut: async (id: string, data: CheckOutDto): Promise<Booking> => {
    const response = await axiosInstance.patch<Booking>(`/booking/${id}/check-out`, data);
    return response.data;
  },

  // Get booking statistics
  getBookingStatistics: async (homestayId?: string): Promise<BookingStatistics> => {
    const response = await axiosInstance.get<BookingStatistics>('/booking/statistics', {
      params: { homestayId },
    });
    return response.data;
  },

  // Get today's check-ins
  getTodayCheckIns: async (homestayId?: string): Promise<Booking[]> => {
    const response = await axiosInstance.get<Booking[]>('/booking/check-ins/today', {
      params: { homestayId },
    });
    return response.data;
  },

  // Get today's check-outs
  getTodayCheckOuts: async (homestayId?: string): Promise<Booking[]> => {
    const response = await axiosInstance.get<Booking[]>('/booking/check-outs/today', {
      params: { homestayId },
    });
    return response.data;
  },
};

// Payment API functions
export const paymentApi = {
  // Add payment
  addPayment: async (bookingId: string, data: CreatePaymentDto): Promise<Payment> => {
    const response = await axiosInstance.post<Payment>(`/booking/${bookingId}/payments`, data);
    return response.data;
  },

  // Get payments by booking
  getPaymentsByBooking: async (bookingId: string): Promise<Payment[]> => {
    const response = await axiosInstance.get<Payment[]>(`/booking/${bookingId}/payments`);
    return response.data;
  },
};
