import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { b2bApi } from './queryFunction';
import {
  B2bPartner,
  B2bBookingRequest,
  CreateB2bPartnerDto,
  CreateB2bBookingRequestDto,
  AcceptB2bBookingRequestDto,
} from './types';

export const b2bKeys = {
  all: ['b2b'] as const,
  partners: () => [...b2bKeys.all, 'partners'] as const,
  requests: (sortBy: string) => [...b2bKeys.all, 'requests', sortBy] as const,
  portal: (slug: string) => [...b2bKeys.all, 'portal', slug] as const,
};

// 1. Get all B2B partners
export const useB2bPartners = (options?: UseQueryOptions<B2bPartner[]>) => {
  return useQuery<B2bPartner[]>({
    queryKey: b2bKeys.partners(),
    queryFn: b2bApi.getAllPartners,
    ...options,
  });
};

// 2. Create B2B Partner
export const useCreateB2bPartner = (options?: UseMutationOptions<B2bPartner, Error, CreateB2bPartnerDto>) => {
  const queryClient = useQueryClient();

  return useMutation<B2bPartner, Error, CreateB2bPartnerDto>({
    mutationFn: b2bApi.createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bKeys.partners() });
    },
    ...options,
  });
};

// 3. Get Booking Requests
export const useB2bRequests = (sortBy = 'checkInDate', options?: UseQueryOptions<B2bBookingRequest[]>) => {
  return useQuery<B2bBookingRequest[]>({
    queryKey: b2bKeys.requests(sortBy),
    queryFn: () => b2bApi.getBookingRequests(sortBy),
    ...options,
  });
};

// 4. Accept booking request
export const useAcceptB2bRequest = (
  options?: UseMutationOptions<any, Error, { id: string; data: AcceptB2bBookingRequestDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: AcceptB2bBookingRequestDto }>({
    mutationFn: ({ id, data }) => b2bApi.acceptRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bKeys.all });
    },
    ...options,
  });
};

// 5. Reject booking request
export const useRejectB2bRequest = (
  options?: UseMutationOptions<B2bBookingRequest, Error, { id: string; rejectionReason: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation<B2bBookingRequest, Error, { id: string; rejectionReason: string }>({
    mutationFn: ({ id, rejectionReason }) => b2bApi.rejectRequest(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bKeys.all });
    },
    ...options,
  });
};

// 6. Get Public Portal details (Public)
export const usePublicPortal = (slug: string, options?: UseQueryOptions<{ partner: any; homestays: any[] }>) => {
  return useQuery<{ partner: any; homestays: any[] }>({
    queryKey: b2bKeys.portal(slug),
    queryFn: () => b2bApi.getPortalDetails(slug),
    enabled: !!slug,
    ...options,
  });
};

// 7. Submit Public Booking Request (Public)
export const useSubmitPublicRequest = (
  options?: UseMutationOptions<B2bBookingRequest, Error, { slug: string; data: CreateB2bBookingRequestDto }>
) => {
  return useMutation<B2bBookingRequest, Error, { slug: string; data: CreateB2bBookingRequestDto }>({
    mutationFn: ({ slug, data }) => b2bApi.submitBookingRequest(slug, data),
    ...options,
  });
};

export * from './types';
