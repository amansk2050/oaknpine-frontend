/* eslint-disable @typescript-eslint/no-explicit-any */
// Lead Enums
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  CONVERTED = 'converted',
  LOST = 'lost',
  INACTIVE = 'inactive',
}

export enum LeadSource {
  WEBSITE = 'website',
  PHONE_CALL = 'phone_call',
  EMAIL = 'email',
  SOCIAL_MEDIA = 'social_media',
  REFERRAL = 'referral',
  WALK_IN = 'walk_in',
  ONLINE_AD = 'online_ad',
  BOOKING_PLATFORM = 'booking_platform',
  AGENT = 'agent',
  OTHER = 'other',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum LeadType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate',
  GROUP = 'group',
  FAMILY = 'family',
  WEDDING = 'wedding',
  EVENT = 'event',
}

// Lead Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  status: LeadStatus;
  source: LeadSource;
  sourceDetails?: string;
  priority: LeadPriority;
  leadType: LeadType;
  city?: string;
  state?: string;
  country?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfAdults?: number;
  numberOfChildren?: number;
  numberOfRooms?: number;
  budget?: number;
  interestedHomestayId?: string;
  requirements?: string;
  notes?: string;
  assignedTo?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  estimatedValue?: number;
  lostReason?: string;
  convertedAt?: string;
  bookingId?: string;
  referredBy?: string;
  companyName?: string;
  leadScore?: number;
  tags?: string[];
  customFields?: Record<string, any>;
  followUps?: LeadFollowUp[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  source: LeadSource;
  sourceDetails?: string;
  priority?: LeadPriority;
  leadType?: LeadType;
  city?: string;
  state?: string;
  country?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfAdults?: number;
  numberOfChildren?: number;
  numberOfRooms?: number;
  budget?: number;
  interestedHomestayId?: string;
  requirements?: string;
  notes?: string;
  assignedTo?: string;
  referredBy?: string;
  companyName?: string;
  tags?: string[];
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {
  status?: LeadStatus;
  nextFollowUpAt?: string;
  leadScore?: number;
}

export interface UpdateLeadStatusDto {
  status: LeadStatus;
  reason?: string;
  bookingId?: string;
  lostReason?: string;
}

// Follow-up Enums
export enum FollowUpType {
  CALL = 'call',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  MEETING = 'meeting',
  NOTE = 'note',
  OTHER = 'other',
}

export enum FollowUpOutcome {
  SUCCESSFUL = 'successful',
  NO_ANSWER = 'no_answer',
  BUSY = 'busy',
  CALLBACK_REQUESTED = 'callback_requested',
  NOT_INTERESTED = 'not_interested',
  INTERESTED = 'interested',
  BOOKING_CONFIRMED = 'booking_confirmed',
  NEED_MORE_INFO = 'need_more_info',
  OTHER = 'other',
}

// Follow-up Types
export interface LeadFollowUp {
  id: string;
  leadId: string;
  type: FollowUpType;
  outcome: FollowUpOutcome;
  notes: string;
  durationMinutes?: number;
  followUpDate: string;
  nextFollowUpDate?: string;
  performedBy?: string;
  createdAt: string;
}

export interface CreateFollowUpDto {
  type: FollowUpType;
  outcome: FollowUpOutcome;
  notes: string;
  durationMinutes?: number;
  followUpDate?: string;
  nextFollowUpDate?: string;
  performedBy?: string;
}

// Filter Types
export interface FilterLeadDto {
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  leadType?: LeadType;
  assignedTo?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// Statistics Types
export interface LeadStatistics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: string;
  activeLeads: number;
}

export interface LeadsBySource {
  source: string;
  count: string;
}
