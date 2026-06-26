import axiosInstance from '../axiosinstance';
import {
  PackageBooking,
  CreatePackageBookingDto,
  UpdatePackageBookingDto,
  UpdatePackageBookingStatusDto,
  FilterPackageBookingDto,
  AddPackagePaymentDto,
  PackageBookingStatistics,
} from './types';

const BASE_URL = '/package-bookings';

// Create package booking
export const createPackageBooking = async (
  data: CreatePackageBookingDto
): Promise<PackageBooking> => {
  const response = await axiosInstance.post<PackageBooking>(BASE_URL, data);
  return response.data;
};

// Get all package bookings with optional filters
export const getPackageBookings = async (
  filters?: FilterPackageBookingDto
): Promise<PackageBooking[]> => {
  const params = new URLSearchParams();
  
  if (filters?.packageId) params.append('packageId', filters.packageId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDateAfter) params.append('startDateAfter', filters.startDateAfter);
  if (filters?.startDateBefore) params.append('startDateBefore', filters.startDateBefore);
  if (filters?.includesHomestay !== undefined) {
    params.append('includesHomestay', String(filters.includesHomestay));
  }

  const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
  const response = await axiosInstance.get<PackageBooking[]>(url);
  return response.data;
};

// Get package booking by ID
export const getPackageBookingById = async (id: string): Promise<PackageBooking> => {
  const response = await axiosInstance.get<PackageBooking>(`${BASE_URL}/${id}`);
  return response.data;
};

// Get package booking by reference
export const getPackageBookingByReference = async (
  reference: string
): Promise<PackageBooking> => {
  const response = await axiosInstance.get<PackageBooking>(
    `${BASE_URL}/reference/${reference}`
  );
  return response.data;
};

// Update package booking
export const updatePackageBooking = async (
  id: string,
  data: UpdatePackageBookingDto
): Promise<PackageBooking> => {
  const response = await axiosInstance.put<PackageBooking>(`${BASE_URL}/${id}`, data);
  return response.data;
};

// Update package booking status
export const updatePackageBookingStatus = async (
  id: string,
  data: UpdatePackageBookingStatusDto
): Promise<PackageBooking> => {
  const response = await axiosInstance.patch<PackageBooking>(
    `${BASE_URL}/${id}/status`,
    data
  );
  return response.data;
};

// Add payment to package booking
export const addPackagePayment = async (
  bookingId: string,
  data: AddPackagePaymentDto
): Promise<PackageBooking> => {
  const response = await axiosInstance.post<PackageBooking>(
    `${BASE_URL}/${bookingId}/payments`,
    data
  );
  return response.data;
};

// Get package booking statistics
export const getPackageBookingStatistics = async (
  packageId?: string
): Promise<PackageBookingStatistics> => {
  const url = packageId
    ? `${BASE_URL}/statistics?packageId=${packageId}`
    : `${BASE_URL}/statistics`;
  const response = await axiosInstance.get<PackageBookingStatistics>(url);
  return response.data;
};

// Get upcoming package bookings
export const getUpcomingPackageBookings = async (
  days?: number
): Promise<PackageBooking[]> => {
  const url = days ? `${BASE_URL}/upcoming?days=${days}` : `${BASE_URL}/upcoming`;
  const response = await axiosInstance.get<PackageBooking[]>(url);
  return response.data;
};
