import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { leadApi, followUpApi } from './queryFunction';
import {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  UpdateLeadStatusDto,
  LeadFollowUp,
  CreateFollowUpDto,
  FilterLeadDto,
  LeadStatistics,
  LeadsBySource,
} from './types';

// Query Keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters?: FilterLeadDto) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  statistics: () => [...leadKeys.all, 'statistics'] as const,
  bySource: () => [...leadKeys.all, 'by-source'] as const,
  upcomingFollowUps: () => [...leadKeys.all, 'upcoming-follow-ups'] as const,
  overdueFollowUps: () => [...leadKeys.all, 'overdue-follow-ups'] as const,
  followUps: (leadId: string) => [...leadKeys.all, 'follow-ups', leadId] as const,
  followUpDetail: (followUpId: string) => [...leadKeys.all, 'follow-up', followUpId] as const,
};

// ===== LEAD HOOKS =====

// Get all leads
export const useLeads = (filters?: FilterLeadDto, options?: UseQueryOptions<Lead[]>) => {
  return useQuery<Lead[]>({
    queryKey: leadKeys.list(filters),
    queryFn: () => leadApi.getAllLeads(filters),
    ...options,
  });
};

// Get lead by ID
export const useLead = (id: string, options?: UseQueryOptions<Lead>) => {
  return useQuery<Lead>({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadApi.getLeadById(id),
    enabled: !!id,
    ...options,
  });
};

// Get lead statistics
export const useLeadStatistics = (options?: UseQueryOptions<LeadStatistics>) => {
  return useQuery<LeadStatistics>({
    queryKey: leadKeys.statistics(),
    queryFn: leadApi.getLeadStatistics,
    ...options,
  });
};

// Get leads by source
export const useLeadsBySource = (options?: UseQueryOptions<LeadsBySource[]>) => {
  return useQuery<LeadsBySource[]>({
    queryKey: leadKeys.bySource(),
    queryFn: leadApi.getLeadsBySource,
    ...options,
  });
};

// Get upcoming follow-ups
export const useUpcomingFollowUps = (options?: UseQueryOptions<Lead[]>) => {
  return useQuery<Lead[]>({
    queryKey: leadKeys.upcomingFollowUps(),
    queryFn: leadApi.getUpcomingFollowUps,
    ...options,
  });
};

// Get overdue follow-ups
export const useOverdueFollowUps = (options?: UseQueryOptions<Lead[]>) => {
  return useQuery<Lead[]>({
    queryKey: leadKeys.overdueFollowUps(),
    queryFn: leadApi.getOverdueFollowUps,
    ...options,
  });
};

// Create lead
export const useCreateLead = (options?: UseMutationOptions<Lead, Error, CreateLeadDto>) => {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, CreateLeadDto>({
    mutationFn: leadApi.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: leadKeys.bySource() });
    },
    ...options,
  });
};

// Update lead
export const useUpdateLead = (
  options?: UseMutationOptions<Lead, Error, { id: string; data: UpdateLeadDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, { id: string; data: UpdateLeadDto }>({
    mutationFn: ({ id, data }) => leadApi.updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
    },
    ...options,
  });
};

// Update lead status
export const useUpdateLeadStatus = (
  options?: UseMutationOptions<Lead, Error, { id: string; data: UpdateLeadStatusDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, { id: string; data: UpdateLeadStatusDto }>({
    mutationFn: ({ id, data }) => leadApi.updateLeadStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.statistics() });
    },
    ...options,
  });
};

// Assign lead
export const useAssignLead = (
  options?: UseMutationOptions<Lead, Error, { id: string; assignedTo: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Lead, Error, { id: string; assignedTo: string }>({
    mutationFn: ({ id, assignedTo }) => leadApi.assignLead(id, assignedTo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
    },
    ...options,
  });
};

// Delete lead
export const useDeleteLead = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: leadApi.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.statistics() });
    },
    ...options,
  });
};

// ===== FOLLOW-UP HOOKS =====

// Get follow-ups by lead
export const useFollowUpsByLead = (leadId: string, options?: UseQueryOptions<LeadFollowUp[]>) => {
  return useQuery<LeadFollowUp[]>({
    queryKey: leadKeys.followUps(leadId),
    queryFn: () => followUpApi.getFollowUpsByLead(leadId),
    enabled: !!leadId,
    ...options,
  });
};

// Get follow-up by ID
export const useFollowUp = (followUpId: string, options?: UseQueryOptions<LeadFollowUp>) => {
  return useQuery<LeadFollowUp>({
    queryKey: leadKeys.followUpDetail(followUpId),
    queryFn: () => followUpApi.getFollowUpById(followUpId),
    enabled: !!followUpId,
    ...options,
  });
};

// Create follow-up
export const useCreateFollowUp = (
  options?: UseMutationOptions<LeadFollowUp, Error, { leadId: string; data: CreateFollowUpDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<LeadFollowUp, Error, { leadId: string; data: CreateFollowUpDto }>({
    mutationFn: ({ leadId, data }) => followUpApi.createFollowUp(leadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.followUps(variables.leadId) });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.leadId) });
      queryClient.invalidateQueries({ queryKey: leadKeys.upcomingFollowUps() });
      queryClient.invalidateQueries({ queryKey: leadKeys.overdueFollowUps() });
    },
    ...options,
  });
};

// Export types
export * from './types';
