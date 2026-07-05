import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { b2bApi } from './queryFunction';
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

export const b2bKeys = {
  all: ['b2b'] as const,
  partners: () => [...b2bKeys.all, 'partners'] as const,
  invitations: () => [...b2bKeys.all, 'invitations'] as const,
  requests: (sortBy: string) => [...b2bKeys.all, 'requests', sortBy] as const,
  portal: (slug: string) => [...b2bKeys.all, 'portal', slug] as const,
  publicInvitation: (token: string) => [...b2bKeys.all, 'public-invitation', token] as const,
  partnerDashboard: () => [...b2bKeys.all, 'partner-dashboard'] as const,
  partnerMemberships: () => [...b2bKeys.all, 'partner-memberships'] as const,
  partnerRequests: (membershipId?: string) => [...b2bKeys.all, 'partner-requests', membershipId] as const,
  organizationMemberships: () => [...b2bKeys.all, 'organization-memberships'] as const,
};

// ─── Business-side hooks ─────────────────────────────────────────────────

// 1. Get all B2B partners (legacy)
export const useB2bPartners = (options?: UseQueryOptions<B2bPartner[]>) => {
  return useQuery<B2bPartner[]>({
    queryKey: b2bKeys.partners(),
    queryFn: b2bApi.getAllPartners,
    ...options,
  });
};

// 2. Create B2B Partner (legacy)
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

// 3. Get Booking Requests (business sees all requests)
export const useB2bRequests = (sortBy = 'checkInDate', options?: UseQueryOptions<B2bBookingRequest[]>) => {
  return useQuery<B2bBookingRequest[]>({
    queryKey: b2bKeys.requests(sortBy),
    queryFn: () => b2bApi.getBookingRequests(sortBy),
    staleTime: 0,
    refetchOnWindowFocus: true,
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

// 6. Update booking tag
export const useUpdateBookingTag = (
  options?: UseMutationOptions<B2bBookingRequest, Error, { id: string; data: UpdateBookingTagDto }>
) => {
  const queryClient = useQueryClient();
  return useMutation<B2bBookingRequest, Error, { id: string; data: UpdateBookingTagDto }>({
    mutationFn: ({ id, data }) => b2bApi.updateBookingTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bKeys.all });
    },
    ...options,
  });
};

// 7. Get Public Portal details (Legacy)
export const usePublicPortal = (slug: string, options?: UseQueryOptions<{ partner: any; homestays: any[] }>) => {
  return useQuery<{ partner: any; homestays: any[] }>({
    queryKey: b2bKeys.portal(slug),
    queryFn: () => b2bApi.getPortalDetails(slug),
    enabled: !!slug,
    ...options,
  });
};

// 8. Submit Public Booking Request (Legacy)
export const useSubmitPublicRequest = (
  options?: UseMutationOptions<B2bBookingRequest, Error, { slug: string; data: CreateB2bBookingRequestDto }>
) => {
  return useMutation<B2bBookingRequest, Error, { slug: string; data: CreateB2bBookingRequestDto }>({
    mutationFn: ({ slug, data }) => b2bApi.submitBookingRequest(slug, data),
    ...options,
  });
};

// ─── New: Invitation hooks ───────────────────────────────────────────────

// 9. Get invitations for current org
export const useB2bInvitations = (options?: UseQueryOptions<B2bInvitation[]>) => {
  return useQuery<B2bInvitation[]>({
    queryKey: b2bKeys.invitations(),
    queryFn: b2bApi.getInvitations,
    ...options,
  });
};

// 10. Create invitation
export const useCreateB2bInvitation = (options?: UseMutationOptions<B2bInvitation, Error, CreateB2bInvitationDto>) => {
  const queryClient = useQueryClient();
  return useMutation<B2bInvitation, Error, CreateB2bInvitationDto>({
    mutationFn: b2bApi.createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bKeys.invitations() });
    },
    ...options,
  });
};

// 11. Revoke invitation
export const useRevokeInvitation = (options?: UseMutationOptions<B2bInvitation, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<B2bInvitation, Error, string>({
    mutationFn: (id) => b2bApi.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bKeys.invitations() });
    },
    ...options,
  });
};

// 11b. Get active memberships (connected partners) for current org
export const useOrganizationMemberships = (options?: UseQueryOptions<B2bPartnerMembership[]>) => {
  return useQuery<B2bPartnerMembership[]>({
    queryKey: b2bKeys.organizationMemberships(),
    queryFn: b2bApi.getOrganizationMemberships,
    ...options,
  });
};

// 12. Public: get invitation by token
export const usePublicInvitation = (token: string, options?: UseQueryOptions<PublicInvitationInfo>) => {
  return useQuery<PublicInvitationInfo>({
    queryKey: b2bKeys.publicInvitation(token),
    queryFn: () => b2bApi.getPublicInvitation(token),
    enabled: !!token,
    retry: false,
    ...options,
  });
};

// 13. Accept invitation (authenticated)
export const useAcceptInvitation = (
  options?: UseMutationOptions<any, Error, { token: string; data: AcceptB2bInvitationDto }>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { token: string; data: AcceptB2bInvitationDto }>({
    mutationFn: ({ token, data }) => b2bApi.acceptInvitation(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bKeys.all });
    },
    ...options,
  });
};

// ─── New: Partner-side hooks ─────────────────────────────────────────────

// 14. Get partner dashboard
export const usePartnerDashboard = (options?: UseQueryOptions<B2bPartnerDashboard>) => {
  return useQuery<B2bPartnerDashboard>({
    queryKey: b2bKeys.partnerDashboard(),
    queryFn: b2bApi.getPartnerDashboard,
    staleTime: 0,
    refetchOnWindowFocus: true,
    ...options,
  });
};

// 15. Get partner memberships
export const usePartnerMemberships = (options?: UseQueryOptions<B2bPartnerMembership[]>) => {
  return useQuery<B2bPartnerMembership[]>({
    queryKey: b2bKeys.partnerMemberships(),
    queryFn: b2bApi.getPartnerMemberships,
    ...options,
  });
};

// 16. Get partner booking requests
export const usePartnerRequests = (membershipId?: string, options?: UseQueryOptions<B2bBookingRequest[]>) => {
  return useQuery<B2bBookingRequest[]>({
    queryKey: b2bKeys.partnerRequests(membershipId),
    queryFn: () => b2bApi.getPartnerRequests(membershipId),
    staleTime: 0,
    refetchOnWindowFocus: true,
    ...options,
  });
};

// 17. Submit partner booking request
export const useSubmitPartnerRequest = (
  options?: UseMutationOptions<B2bBookingRequest, Error, CreatePartnerBookingRequestDto>
) => {
  const queryClient = useQueryClient();
  return useMutation<B2bBookingRequest, Error, CreatePartnerBookingRequestDto>({
    mutationFn: b2bApi.submitPartnerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bKeys.all });
    },
    ...options,
  });
};

export * from './types';
