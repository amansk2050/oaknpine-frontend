import axiosInstance from '../axiosinstance';
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

// Lead API functions
export const leadApi = {
  // Create lead
  createLead: async (data: CreateLeadDto): Promise<Lead> => {
    const response = await axiosInstance.post<Lead>('/lead', data);
    return response.data;
  },

  // Get all leads
  getAllLeads: async (filters?: FilterLeadDto): Promise<Lead[]> => {
    const response = await axiosInstance.get<Lead[]>('/lead', {
      params: filters,
    });
    return response.data;
  },

  // Get lead by ID
  getLeadById: async (id: string): Promise<Lead> => {
    const response = await axiosInstance.get<Lead>(`/lead/${id}`);
    return response.data;
  },

  // Update lead
  updateLead: async (id: string, data: UpdateLeadDto): Promise<Lead> => {
    const response = await axiosInstance.put<Lead>(`/lead/${id}`, data);
    return response.data;
  },

  // Update lead status
  updateLeadStatus: async (id: string, data: UpdateLeadStatusDto): Promise<Lead> => {
    const response = await axiosInstance.patch<Lead>(`/lead/${id}/status`, data);
    return response.data;
  },

  // Assign lead
  assignLead: async (id: string, assignedTo: string): Promise<Lead> => {
    const response = await axiosInstance.patch<Lead>(`/lead/${id}/assign`, {
      assignedTo,
    });
    return response.data;
  },

  // Delete lead
  deleteLead: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/lead/${id}`);
  },

  // Get lead statistics
  getLeadStatistics: async (): Promise<LeadStatistics> => {
    const response = await axiosInstance.get<LeadStatistics>('/lead/statistics');
    return response.data;
  },

  // Get leads by source
  getLeadsBySource: async (): Promise<LeadsBySource[]> => {
    const response = await axiosInstance.get<LeadsBySource[]>('/lead/statistics/by-source');
    return response.data;
  },

  // Get upcoming follow-ups
  getUpcomingFollowUps: async (): Promise<Lead[]> => {
    const response = await axiosInstance.get<Lead[]>('/lead/follow-ups/upcoming');
    return response.data;
  },

  // Get overdue follow-ups
  getOverdueFollowUps: async (): Promise<Lead[]> => {
    const response = await axiosInstance.get<Lead[]>('/lead/follow-ups/overdue');
    return response.data;
  },
};

// Follow-up API functions
export const followUpApi = {
  // Create follow-up
  createFollowUp: async (leadId: string, data: CreateFollowUpDto): Promise<LeadFollowUp> => {
    const response = await axiosInstance.post<LeadFollowUp>(`/lead/${leadId}/follow-ups`, data);
    return response.data;
  },

  // Get follow-ups by lead
  getFollowUpsByLead: async (leadId: string): Promise<LeadFollowUp[]> => {
    const response = await axiosInstance.get<LeadFollowUp[]>(`/lead/${leadId}/follow-ups`);
    return response.data;
  },

  // Get follow-up by ID
  getFollowUpById: async (followUpId: string): Promise<LeadFollowUp> => {
    const response = await axiosInstance.get<LeadFollowUp>(`/lead/follow-ups/${followUpId}`);
    return response.data;
  },
};
