import axiosInstance from '../axiosinstance';
import {
  B2bPartner,
  B2bBookingRequest,
  B2bInvitation,
  B2bPartnerMembership,
  B2bPartnerDashboard,
  CreateB2bPartnerDto,
  CreateB2bBookingRequestDto,
  AcceptB2bBookingRequestDto,
  CreateB2bInvitationDto,
  AcceptB2bInvitationDto,
  UpdateBookingTagDto,
  CreatePartnerBookingRequestDto,
  PublicInvitationInfo,
} from './types';

export const b2bApi = {
  /* ─── Legacy: Slug-based partner portal ─── */

  createPartner: async (data: CreateB2bPartnerDto): Promise<B2bPartner> => {
    const response = await axiosInstance.post<B2bPartner>('/b2b/partners', data);
    return response.data;
  },

  getAllPartners: async (): Promise<B2bPartner[]> => {
    const response = await axiosInstance.get<B2bPartner[]>('/b2b/partners');
    return response.data;
  },

  getBookingRequests: async (sortBy = 'checkInDate'): Promise<B2bBookingRequest[]> => {
    const response = await axiosInstance.get<B2bBookingRequest[]>(`/b2b/requests?sortBy=${sortBy}`);
    return response.data;
  },

  acceptRequest: async (id: string, data: AcceptB2bBookingRequestDto): Promise<any> => {
    const response = await axiosInstance.post(`/b2b/requests/${id}/accept`, data);
    return response.data;
  },

  rejectRequest: async (id: string, rejectionReason: string): Promise<B2bBookingRequest> => {
    const response = await axiosInstance.post<B2bBookingRequest>(`/b2b/requests/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  updateBookingTag: async (id: string, data: UpdateBookingTagDto): Promise<B2bBookingRequest> => {
    const response = await axiosInstance.patch<B2bBookingRequest>(`/b2b/requests/${id}/tag`, data);
    return response.data;
  },

  getPortalDetails: async (slug: string): Promise<{ partner: any; homestays: any[] }> => {
    const response = await axiosInstance.get(`/b2b/public/portal/${slug}`);
    return response.data;
  },

  submitBookingRequest: async (slug: string, data: CreateB2bBookingRequestDto): Promise<B2bBookingRequest> => {
    const response = await axiosInstance.post<B2bBookingRequest>(`/b2b/public/request/${slug}`, data);
    return response.data;
  },

  /* ─── New: Invitation system (business side) ─── */

  createInvitation: async (data: CreateB2bInvitationDto): Promise<B2bInvitation> => {
    const response = await axiosInstance.post<B2bInvitation>('/b2b/invitations', data);
    return response.data;
  },

  getInvitations: async (): Promise<B2bInvitation[]> => {
    const response = await axiosInstance.get<B2bInvitation[]>('/b2b/invitations');
    return response.data;
  },

  revokeInvitation: async (id: string): Promise<B2bInvitation> => {
    const response = await axiosInstance.delete<B2bInvitation>(`/b2b/invitations/${id}`);
    return response.data;
  },

  getOrganizationMemberships: async (): Promise<B2bPartnerMembership[]> => {
    const response = await axiosInstance.get<B2bPartnerMembership[]>('/b2b/memberships');
    return response.data;
  },

  /* ─── New: Partner-side API calls ─── */

  getPartnerDashboard: async (): Promise<B2bPartnerDashboard> => {
    const response = await axiosInstance.get<B2bPartnerDashboard>('/b2b/partner/dashboard');
    return response.data;
  },

  getPartnerMemberships: async (): Promise<B2bPartnerMembership[]> => {
    const response = await axiosInstance.get<B2bPartnerMembership[]>('/b2b/partner/memberships');
    return response.data;
  },

  getPartnerRequests: async (membershipId?: string): Promise<B2bBookingRequest[]> => {
    const url = membershipId
      ? `/b2b/partner/requests?membershipId=${membershipId}`
      : '/b2b/partner/requests';
    const response = await axiosInstance.get<B2bBookingRequest[]>(url);
    return response.data;
  },

  submitPartnerRequest: async (data: CreatePartnerBookingRequestDto): Promise<B2bBookingRequest> => {
    const response = await axiosInstance.post<B2bBookingRequest>('/b2b/partner/requests', data);
    return response.data;
  },

  getMembershipHomestays: async (membershipId: string): Promise<any[]> => {
    const response = await axiosInstance.get<any[]>(`/b2b/partner/memberships/${membershipId}/homestays`);
    return response.data;
  },

  acceptInvitation: async (token: string, data: AcceptB2bInvitationDto): Promise<any> => {
    const response = await axiosInstance.post(`/b2b/invitations/${token}/accept`, data);
    return response.data;
  },

  /* ─── New: Public invitation info ─── */

  getPublicInvitation: async (token: string): Promise<PublicInvitationInfo> => {
    // Use a plain fetch since this is a public endpoint (no auth needed)
    const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:4001/api/v1';
    const res = await fetch(`${BASE}/b2b/public/invitation/${token}`);
    if (!res.ok) throw new Error('Invalid or expired invitation');
    return res.json();
  },
};
