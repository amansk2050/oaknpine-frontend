'use client';

import React, { useState } from 'react';
import { Plus, Search,  Users, Target, Zap, Sparkles, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useLeadStatistics,
  CreateLeadDto,
  Lead,
  LeadStatus,
  LeadPriority,
} from '@/services/lead';
import LeadCard from '@/components/lead/LeadCard';
import LeadModal from '@/components/lead/LeadModal';
import { useRouter } from 'next/navigation';

export default function LeadsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | ''>('');

  // React Query hooks
  const { data: leads, isLoading } = useLeads();
  const { data: statistics } = useLeadStatistics();
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleViewLead = (id: string) => {
    router.push(`/dashboard/leads/${id}`);
  };

  const handleSubmit = async (data: CreateLeadDto) => {
    try {
      if (selectedLead) {
        await updateMutation.mutateAsync({
          id: selectedLead.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
      setSelectedLead(null);
    } catch (error) {
      console.error('Failed to save lead:', error);
    }
  };

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesPriority = !priorityFilter || lead.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 rounded-2xl p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-blue-300 text-sm font-medium">Lead Management</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Lead Pipeline 🎯
            </h1>
            <p className="text-slate-300 text-lg">
              Track and convert your potential customers
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <p className="text-blue-300 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold text-white">{statistics?.conversionRate || '0%'}</p>
            </div>
            <button
              onClick={handleAddLead}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all font-medium flex items-center gap-2 border border-white/20"
            >
              <Plus className="w-5 h-5" />
              Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Leads</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.totalLeads || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">New Leads</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.newLeads || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Qualified</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.qualifiedLeads || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-green-500/10 hover:border-green-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/30">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Converted</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.convertedLeads || 0}</p>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-red-500/10 hover:border-red-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/30">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Lost</p>
            <p className="text-3xl font-bold text-slate-900">{statistics?.lostLeads || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Status</option>
              <option value={LeadStatus.NEW}>New</option>
              <option value={LeadStatus.CONTACTED}>Contacted</option>
              <option value={LeadStatus.QUALIFIED}>Qualified</option>
              <option value={LeadStatus.CONVERTED}>Converted</option>
              <option value={LeadStatus.LOST}>Lost</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as LeadPriority | '')}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Priority</option>
              <option value={LeadPriority.URGENT}>Urgent</option>
              <option value={LeadPriority.HIGH}>High</option>
              <option value={LeadPriority.MEDIUM}>Medium</option>
              <option value={LeadPriority.LOW}>Low</option>
            </select>

            <button
              onClick={handleAddLead}
              className="md:hidden px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredLeads && filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onView={handleViewLead}
              onEdit={handleEditLead}
              onClick={() => handleViewLead(lead.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No leads found</h3>
          <p className="text-slate-600 mb-6">Start tracking your potential customers</p>
          <button
            onClick={handleAddLead}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
          >
            Add Your First Lead
          </button>
        </div>
      )}

      {/* Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSubmit={handleSubmit}
        lead={selectedLead}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
