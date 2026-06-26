export interface B2bPartner {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  uniqueSlug: string;
  status: 'active' | 'suspended';
  totalRequestsSent: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface B2bBookingRequest {
  id: string;
  partnerId: string;
  homestayId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  roomPreferences?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
  partner?: B2bPartner;
}

export interface CreateB2bPartnerDto {
  businessName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface CreateB2bBookingRequestDto {
  homestayId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  roomPreferences?: string;
  message?: string;
}

export interface AcceptB2bBookingRequestDto {
  rooms: {
    roomId: string;
    numberOfGuests: number;
    isFullyOccupied?: boolean;
    notes?: string;
  }[];
  discountAmount?: number;
  taxPercentage?: number;
}
