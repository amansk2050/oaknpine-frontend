// ─── Legacy Types ─────────────────────────────────────────────────────────
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

// ─── Booking Tag Enum ──────────────────────────────────────────────────────
export enum BookingTag {
  SOFT_BLOCK = 'soft_block',       // Yellow — tentative hold
  BLOCKED_UNPAID = 'blocked_unpaid', // Blue — confirmed, payment pending
  BLOCKED_PAID = 'blocked_paid',   // Green — confirmed and paid
}

export interface B2bBookingRequest {
  id: string;
  partnerId?: string;
  partnerAccountId?: string;
  partnerMembershipId?: string;
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
  bookingTag?: BookingTag | null;
  createdAt: string;
  updatedAt: string;
  partner?: B2bPartner;
  _membership?: B2bPartnerMembership;
  partnerMembership?: B2bPartnerMembership;
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

// ─── New: Invitation Types ─────────────────────────────────────────────────
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface B2bInvitation {
  id: string;
  organizationId: string;
  businessName: string;
  invitedEmail: string;
  invitationToken: string;
  status: InvitationStatus;
  expiresAt: string;
  invitedByUserId?: string;
  partnerAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateB2bInvitationDto {
  invitedEmail: string;
  notes?: string;
}

export interface AcceptB2bInvitationDto {
  partnerBusinessName?: string;
}

export interface UpdateBookingTagDto {
  bookingTag: BookingTag;
}

// ─── New: Partner Account / Membership Types ───────────────────────────────
export interface B2bPartnerAccount {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type MembershipStatus = 'active' | 'suspended';

export interface B2bPartnerMembership {
  id: string;
  partnerAccountId: string;
  organizationId: string;
  invitationId?: string;
  businessName: string;
  partnerBusinessName?: string;
  status: MembershipStatus;
  totalBookingsSent: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  partnerAccount?: B2bPartnerAccount;
}

export interface B2bMembershipStats {
  membership: B2bPartnerMembership;
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  recentRequests: B2bBookingRequest[];
}

export interface B2bPartnerDashboard {
  partnerAccount: B2bPartnerAccount;
  businessCount: number;
  memberships: B2bMembershipStats[];
  totalRequestsAllTime: number;
  totalAccepted: number;
}

export interface CreatePartnerBookingRequestDto {
  partnerMembershipId: string;
  homestayId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  roomPreferences?: string;
  message?: string;
  bookingTag?: BookingTag | null;
}

// Public invitation info (safe subset)
export interface PublicInvitationInfo {
  id: string;
  businessName: string;
  invitedEmail: string;
  status: InvitationStatus;
  expiresAt: string;
}
