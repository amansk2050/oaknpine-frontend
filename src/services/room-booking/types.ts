/* eslint-disable @typescript-eslint/no-explicit-any */
// Booking Enums
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

// Payment Enums
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online',
  CHEQUE = 'cheque',
  OTHER = 'other',
}

export enum PaymentType {
  ADVANCE = 'advance',
  PARTIAL = 'partial',
  FULL = 'full',
  REFUND = 'refund',
  CANCELLATION_CHARGE = 'cancellation_charge',
}

export enum RoomBookingStatus {
  RESERVED = 'reserved',
  OCCUPIED = 'occupied',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
}

// Booking Types
export interface BookingRoom {
  id: string;
  bookingId: string;
  roomId: string;
  numberOfGuests: number;
  ratePerNight: number;
  totalAmount: number;
  status: RoomBookingStatus;
  isFullyOccupied: boolean;
  notes?: string;
  room?: {
    id: string;
    roomNumber: string;
    roomName: string;
    roomType: string;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  paymentReference: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  status: PaymentStatus;
  transactionId?: string;
  paymentGateway?: string;
  paymentDate: string;
  notes?: string;
  recordedBy?: string;
  receiptUrl?: string;
  paymentDetails?: Record<string, any>;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  leadId: string;
  homestayId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfAdults: number;
  numberOfChildren: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalRooms: number;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  discountAmount: number;
  taxAmount: number;
  specialRequests?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  expectedArrivalTime?: string;
  isPaymentComplete: boolean;
  createdBy?: string;
  guestDetails?: Record<string, any>;
  rooms: BookingRoom[];
  payments: Payment[];
  homestay?: {
    id: string;
    name: string;
    city: string;
  };
  lead?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

// DTO Types
export interface BookingRoomDto {
  roomId: string;
  numberOfGuests: number;
  isFullyOccupied?: boolean;
  notes?: string;
}

export interface CreateBookingDto {
  leadId: string;
  homestayId: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: BookingRoomDto[];
  discountAmount?: number;
  taxPercentage?: number;
  specialRequests?: string;
  notes?: string;
  expectedArrivalTime?: string;
  guestDetails?: Record<string, any>;
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> {
  status?: BookingStatus;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
  reason?: string;
  bookingId?: string;
  cancellationReason?: string;
}

export interface CreatePaymentDto {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  transactionId?: string;
  paymentGateway?: string;
  paymentDate?: string;
  notes?: string;
  paymentDetails?: Record<string, any>;
}

export interface CheckInDto {
  actualCheckInTime?: string;
  notes?: string;
}

export interface CheckOutDto {
  actualCheckOutTime?: string;
  notes?: string;
}

// Filter Types
export interface FilterBookingDto {
  status?: BookingStatus;
  homestayId?: string;
  checkInAfter?: string;
  checkInBefore?: string;
}

// Statistics Types
export interface BookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  cancelledBookings: number;
  totalRevenue: number | string; // API might return string
  totalPaid: number | string; // API might return string
  pendingAmount: number | string; // API might return string
}
