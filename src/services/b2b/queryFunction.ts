import axiosInstance from '../axiosinstance';
import {
  B2bPartner,
  B2bBookingRequest,
  CreateB2bPartnerDto,
  CreateB2bBookingRequestDto,
  AcceptB2bBookingRequestDto,
} from './types';

export const b2bApi = {
  // Generate a new B2B Partner link
  createPartner: async (data: CreateB2bPartnerDto): Promise<B2bPartner> => {
    const response = await axiosInstance.post<B2bPartner>('/b2b/partners', data);
    return response.data;
  },

  // List all B2B partners
  getAllPartners: async (): Promise<B2bPartner[]> => {
    const response = await axiosInstance.get<B2bPartner[]>('/b2b/partners');
    return response.data;
  },

  // List pending/chronological requests queue
  getBookingRequests: async (sortBy = 'checkInDate'): Promise<B2bBookingRequest[]> => {
    const response = await axiosInstance.get<B2bBookingRequest[]>(`/b2b/requests?sortBy=${sortBy}`);
    return response.data;
  },

  // Accept a B2B booking request and create room booking
  acceptRequest: async (id: string, data: AcceptB2bBookingRequestDto): Promise<any> => {
    const response = await axiosInstance.post(`/b2b/requests/${id}/accept`, data);
    return response.data;
  },

  // Reject a B2B booking request
  rejectRequest: async (id: string, rejectionReason: string): Promise<B2bBookingRequest> => {
    const response = await axiosInstance.post<B2bBookingRequest>(`/b2b/requests/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  // Get B2B Partner Portal details by unique slug (Public)
  getPortalDetails: async (slug: string): Promise<{ partner: any; homestays: any[] }> => {
    const response = await axiosInstance.get(`/b2b/public/portal/${slug}`);
    return response.data;
  },

  // Submit a booking request via public partner portal (Public)
  submitBookingRequest: async (slug: string, data: CreateB2bBookingRequestDto): Promise<B2bBookingRequest> => {
    const response = await axiosInstance.post<B2bBookingRequest>(`/b2b/public/request/${slug}`, data);
    return response.data;
  },
};
