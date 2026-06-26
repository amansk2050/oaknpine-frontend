import { Lead } from '../lead';
import { Room } from '../homestay';
import { Booking } from '../room-booking';

// Enums
export enum PackageBookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum PackagePaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum PackagePaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online',
  CHEQUE = 'cheque',
  OTHER = 'other',
}

export enum PackagePaymentType {
  ADVANCE = 'advance',
  PARTIAL = 'partial',
  FULL = 'full',
  REFUND = 'refund',
}

// Interfaces
export interface PackageBookingRoom {
  id: string;
  packageBookingId: string;
  bookingId: string | null;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  nightNumber: number;
  pricePerNight: number;
  isConfirmed: boolean;
  room?: Room;
  booking?: Booking;
  createdAt: string;
  updatedAt: string;
}

export interface PackagePricingTier {
  id: string;
  packageId: string;
  numberOfPersons: number;
  roomType: string;
  seasonType: string;
  pricePerHead: string;
  totalPrice: string;
  costPricePerHead: string | null;
  minPricePerHead: string | null;
  maxDiscountPercent: string;
  transportCost: string | null;
  accommodationCost: string | null;
  mealCost: string | null;
  sightseeingCost: string | null;
  validFrom: string | null;
  validUntil: string | null;
  isDefault: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  packageCode: string;
  name: string;
  shortTitle: string;
  description: string;
  numberOfNights: number;
  numberOfDays: number;
  destination: string;
  basePricePerHead: number;
  minPricePerHead: number;
  status: string;
  images?: string[];
  thumbnailImage?: string;
  pricingTiers?: PackagePricingTier[];
}

export interface PackageBooking {
  id: string;
  bookingReference: string;
  leadId: string;
  packageId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfAdults: number;
  numberOfChildren: number;
  startDate: string;
  endDate: string;
  includesHomestay: boolean;
  homestayNights: number | null;
  status: PackageBookingStatus;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  discountAmount: number;
  taxAmount: number;
  paymentStatus: PackagePaymentStatus;
  isPaymentComplete: boolean;
  specialRequests: string | null;
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  expectedArrivalTime: string | null;
  createdBy: string | null;
  guestDetails: Record<string, unknown> | null;
  package?: Package;
  lead?: Lead;
  packageBookingRooms?: PackageBookingRoom[];
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface PackageHomestayDayDto {
  dayNumber: number;
  roomId: string;
  numberOfGuests: number;
  notes?: string;
}

export interface CreatePackageBookingDto {
  leadId: string;
  packageId: string;
  startDate: string;
  numberOfAdults: number;
  numberOfChildren?: number;
  includesHomestay?: boolean;
  homestayDays?: PackageHomestayDayDto[];
  discountAmount?: number;
  taxPercentage?: number;
  specialRequests?: string;
  notes?: string;
  expectedArrivalTime?: string;
  guestDetails?: Record<string, unknown>;
  createdBy?: string;
}

export interface UpdatePackageBookingDto {
  specialRequests?: string;
  notes?: string;
  expectedArrivalTime?: string;
  discountAmount?: number;
  guestDetails?: Record<string, unknown>;
}

export interface UpdatePackageBookingStatusDto {
  status: PackageBookingStatus;
  reason?: string;
  cancellationReason?: string;
}

export interface FilterPackageBookingDto {
  packageId?: string;
  status?: PackageBookingStatus;
  startDateAfter?: string;
  startDateBefore?: string;
  includesHomestay?: boolean;
}

export interface AddPackagePaymentDto {
  amount: number;
  paymentMethod: PackagePaymentMethod;
  paymentType: PackagePaymentType;
  transactionId?: string;
  paymentDate?: string;
  notes?: string;
  recordedBy?: string;
  settleRoomBookings?: boolean; // Whether to also settle room booking payments
}

export interface PackageBookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  homestayBookings: number;
  totalRevenue: number;
  totalPaid: number;
  pendingAmount: number;
}
