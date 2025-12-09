'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Clock,
  TrendingUp,
  Edit,
  CheckCircle,
  XCircle,
  Plus,
  ExternalLink,
  Lock,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';
import {
  useLead,
  useUpdateLeadStatus,
  useFollowUpsByLead,
  useCreateFollowUp,
  LeadStatus,
  LeadPriority,
  FollowUpType,
  FollowUpOutcome,
  CreateFollowUpDto,
} from '@/services/lead';

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpData, setFollowUpData] = useState<CreateFollowUpDto>({
    type: FollowUpType.CALL,
    outcome: FollowUpOutcome.SUCCESSFUL,
    notes: '',
  });

  const { data: lead, isLoading } = useLead(params.id);
  const { data: followUps } = useFollowUpsByLead(params.id);
  const updateStatusMutation = useUpdateLeadStatus();
  const createFollowUpMutation = useCreateFollowUp();

  // Check if lead is converted (has booking)
  const isConverted = lead?.status === LeadStatus.CONVERTED || !!lead?.bookingId;
  const isLost = lead?.status === LeadStatus.LOST;
  const isLocked = isConverted || isLost;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (isLocked) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: params.id,
        data: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCreateFollowUp = async () => {
    if (isLocked) return;
    try {
      await createFollowUpMutation.mutateAsync({
        leadId: params.id,
        data: followUpData,
      });
      setIsFollowUpModalOpen(false);
      setFollowUpData({
        type: FollowUpType.CALL,
        outcome: FollowUpOutcome.SUCCESSFUL,
        notes: '',
      });
      
      if (followUpData.outcome === FollowUpOutcome.BOOKING_CONFIRMED) {
        router.push(`/dashboard/bookings/create?leadId=${params.id}`);
      }
    } catch (error) {
      console.error('Failed to create follow-up:', error);
    }
  };

  const getStatusConfig = (status: LeadStatus) => {
    const configs = {
      [LeadStatus.NEW]: { color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-700', icon: Sparkles, label: 'New Lead' },
      [LeadStatus.CONTACTED]: { color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50', textColor: 'text-purple-700', icon: MessageSquare, label: 'Contacted' },
      [LeadStatus.QUALIFIED]: { color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', icon: Target, label: 'Qualified' },
      [LeadStatus.CONVERTED]: { color: 'from-green-500 to-green-600', bgLight: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle, label: 'Converted' },
      [LeadStatus.LOST]: { color: 'from-red-500 to-red-600', bgLight: 'bg-red-50', textColor: 'text-red-700', icon: XCircle, label: 'Lost' },
      [LeadStatus.PROPOSAL_SENT]: { color: 'from-cyan-500 to-cyan-600', bgLight: 'bg-cyan-50', textColor: 'text-cyan-700', icon: MessageSquare, label: 'Proposal Sent' },
      [LeadStatus.NEGOTIATION]: { color: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50', textColor: 'text-orange-700', icon: TrendingUp, label: 'Negotiation' },
      [LeadStatus.INACTIVE]: { color: 'from-slate-500 to-slate-600', bgLight: 'bg-slate-50', textColor: 'text-slate-700', icon: XCircle, label: 'Inactive' },
    };
    return configs[status] || configs[LeadStatus.NEW];
  };

  const getPriorityConfig = (priority: LeadPriority) => {
    const configs = {
      [LeadPriority.URGENT]: { color: 'from-red-500 to-red-600', bg: 'bg-red-100', text: 'text-red-700', label: '🔥 URGENT' },
      [LeadPriority.HIGH]: { color: 'from-orange-500 to-orange-600', bg: 'bg-orange-100', text: 'text-orange-700', label: '⚡ HIGH' },
      [LeadPriority.MEDIUM]: { color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-100', text: 'text-yellow-700', label: '📌 MEDIUM' },
      [LeadPriority.LOW]: { color: 'from-slate-500 to-slate-600', bg: 'bg-slate-100', text: 'text-slate-700', label: '📋 LOW' },
    };
    return configs[priority] || configs[LeadPriority.MEDIUM];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lead) {
    return <div>Lead not found</div>;
  }

  const statusConfig = getStatusConfig(lead.status);
  const priorityConfig = getPriorityConfig(lead.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 rounded-2xl p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            {!isLocked && (
              <button
                onClick={() => router.push(`/dashboard/leads`)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Lead
              </button>
            )}
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 bg-gradient-to-br ${statusConfig.color} rounded-xl shadow-lg`}>
                  <StatusIcon className="w-6 h-6 text-white" />
                </div>
                <span className={`px-3 py-1 ${priorityConfig.bg} ${priorityConfig.text} text-sm font-bold rounded-full`}>
                  {priorityConfig.label}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{lead.name}</h1>
              <p className="text-blue-200 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                {statusConfig.label} • Created {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="hidden md:block text-right">
              {lead.leadScore && lead.leadScore > 0 && (
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-blue-200 text-sm">Lead Score</p>
                  <p className="text-4xl font-bold text-white">{lead.leadScore}</p>
                  <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-emerald-400 rounded-full"
                      style={{ width: `${lead.leadScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Converted/Lost Banner */}
      {isConverted && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">🎉 Lead Successfully Converted!</h3>
              <p className="text-green-100">This lead has been converted to a booking and is now read-only.</p>
            </div>
          </div>
          {lead.bookingId && (
            <button
              onClick={() => router.push(`/dashboard/bookings/${lead.bookingId}`)}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors font-medium flex items-center gap-2"
            >
              View Booking
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {isLost && !isConverted && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-5 text-white flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Lead Marked as Lost</h3>
            <p className="text-red-100">{lead.lostReason || 'This lead has been marked as lost and is now read-only.'}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Contact Info</h3>
            </div>
            <div className="space-y-4">
              <div className="group p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Phone</p>
                    <p className="text-sm font-semibold text-slate-900">{lead.phone}</p>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Email</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{lead.email}</p>
                  </div>
                </div>
              </div>

              {(lead.city || lead.state) && (
                <div className="group p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Location</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {[lead.city, lead.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Travel Details */}
          {(lead.checkInDate || lead.numberOfRooms || lead.budget) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Travel Details</h3>
              </div>
              <div className="space-y-3">
                {lead.checkInDate && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Check-in</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {new Date(lead.checkInDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {lead.checkOutDate && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Check-out</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {new Date(lead.checkOutDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {lead.numberOfRooms && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Rooms</span>
                    <span className="text-sm font-semibold text-slate-900">{lead.numberOfRooms}</span>
                  </div>
                )}
                {lead.budget && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-sm text-emerald-700">Budget</span>
                    <span className="text-lg font-bold text-emerald-700">₹{lead.budget.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!isLocked ? (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Plus className="w-5 h-5" />
                  Add Follow-up
                </button>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value={LeadStatus.NEW}>🆕 New</option>
                  <option value={LeadStatus.CONTACTED}>📞 Contacted</option>
                  <option value={LeadStatus.QUALIFIED}>✅ Qualified</option>
                  <option value={LeadStatus.PROPOSAL_SENT}>📄 Proposal Sent</option>
                  <option value={LeadStatus.NEGOTIATION}>🤝 Negotiation</option>
                  <option value={LeadStatus.CONVERTED}>🎉 Converted</option>
                  <option value={LeadStatus.LOST}>❌ Lost</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 text-slate-600 mb-3">
                <Lock className="w-5 h-5" />
                <h3 className="text-lg font-bold">Actions Disabled</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                {isConverted 
                  ? 'This lead has been converted. No further actions can be taken.'
                  : 'This lead has been marked as lost. No further actions can be taken.'}
              </p>
              {isConverted && lead.bookingId && (
                <button
                  onClick={() => router.push(`/dashboard/bookings/${lead.bookingId}`)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Booking
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Journey Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Lead Journey</h3>
            </div>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500" />

              <div className="space-y-6">
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-emerald-500/30">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-bold text-slate-900">Lead Created</h4>
                    <p className="text-sm text-slate-600">{new Date(lead.createdAt).toLocaleString()}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      Source: {lead.source.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {lead.lastContactedAt && (
                  <div className="relative flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-blue-500/30">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-bold text-slate-900">Last Contact</h4>
                      <p className="text-sm text-slate-600">{new Date(lead.lastContactedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {lead.convertedAt && (
                  <div className="relative flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-green-500/30">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-bold text-slate-900">🎉 Converted to Booking</h4>
                      <p className="text-sm text-slate-600">{new Date(lead.convertedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Follow-up History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Follow-up History</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {followUps?.length || 0}
                </span>
              </div>
              {!isLocked && (
                <button
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>
            {followUps && followUps.length > 0 ? (
              <div className="space-y-4">
                {followUps.map((followUp) => (
                  <div key={followUp.id} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {followUp.type.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {followUp.outcome.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(followUp.followUpDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{followUp.notes}</p>
                    {followUp.durationMinutes && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {followUp.durationMinutes} minutes
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-slate-500">No follow-ups recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up Modal */}
      {isFollowUpModalOpen && !isLocked && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Add Follow-up</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                <select
                  value={followUpData.type}
                  onChange={(e) => setFollowUpData({ ...followUpData, type: e.target.value as FollowUpType })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={FollowUpType.CALL}>📞 Call</option>
                  <option value={FollowUpType.EMAIL}>📧 Email</option>
                  <option value={FollowUpType.SMS}>💬 SMS</option>
                  <option value={FollowUpType.WHATSAPP}>💚 WhatsApp</option>
                  <option value={FollowUpType.MEETING}>🤝 Meeting</option>
                  <option value={FollowUpType.NOTE}>📝 Note</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Outcome</label>
                <select
                  value={followUpData.outcome}
                  onChange={(e) => setFollowUpData({ ...followUpData, outcome: e.target.value as FollowUpOutcome })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={FollowUpOutcome.SUCCESSFUL}>✅ Successful</option>
                  <option value={FollowUpOutcome.NO_ANSWER}>📵 No Answer</option>
                  <option value={FollowUpOutcome.BUSY}>⏰ Busy</option>
                  <option value={FollowUpOutcome.CALLBACK_REQUESTED}>🔄 Callback Requested</option>
                  <option value={FollowUpOutcome.INTERESTED}>⭐ Interested</option>
                  <option value={FollowUpOutcome.NOT_INTERESTED}>❌ Not Interested</option>
                  <option value={FollowUpOutcome.BOOKING_CONFIRMED}>🎉 Booking Confirmed</option>
                  <option value={FollowUpOutcome.NEED_MORE_INFO}>❓ Need More Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes *</label>
                <textarea
                  rows={3}
                  value={followUpData.notes}
                  onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Enter follow-up details..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsFollowUpModalOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFollowUp}
                disabled={!followUpData.notes}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50"
              >
                Add Follow-up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
