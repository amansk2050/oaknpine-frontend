'use client';

import React from 'react';
import { User, Phone, Mail, Calendar, MapPin, Tag, Clock, TrendingUp } from 'lucide-react';
import { Lead, LeadStatus, LeadPriority } from '@/services/lead/types';

interface LeadCardProps {
  lead: Lead;
  onView: (id: string) => void;
  onEdit: (lead: Lead) => void;
  onClick?: () => void;
}

export default function LeadCard({ lead,  onEdit, onClick }: LeadCardProps) {
  const getStatusConfig = (status: LeadStatus) => {
    const configs = {
      [LeadStatus.NEW]: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'New' },
      [LeadStatus.CONTACTED]: { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Contacted' },
      [LeadStatus.QUALIFIED]: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Qualified' },
      [LeadStatus.PROPOSAL_SENT]: { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'Proposal Sent' },
      [LeadStatus.NEGOTIATION]: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Negotiation' },
      [LeadStatus.CONVERTED]: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Converted' },
      [LeadStatus.LOST]: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Lost' },
      [LeadStatus.INACTIVE]: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Inactive' },
    };
    return configs[status] || configs[LeadStatus.NEW];
  };

  const getPriorityConfig = (priority: LeadPriority) => {
    const configs = {
      [LeadPriority.URGENT]: { color: 'bg-red-500', label: 'Urgent', pulse: true },
      [LeadPriority.HIGH]: { color: 'bg-orange-500', label: 'High', pulse: false },
      [LeadPriority.MEDIUM]: { color: 'bg-yellow-500', label: 'Medium', pulse: false },
      [LeadPriority.LOW]: { color: 'bg-slate-400', label: 'Low', pulse: false },
    };
    return configs[priority] || configs[LeadPriority.MEDIUM];
  };

  const statusConfig = getStatusConfig(lead.status);
  const priorityConfig = getPriorityConfig(lead.priority);

  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {/* Header with Priority Indicator */}
      <div className="relative h-2 bg-gradient-to-r from-slate-100 to-slate-200">
        <div className={`absolute inset-0 ${priorityConfig.color} ${priorityConfig.pulse ? 'animate-pulse' : ''}`} />
      </div>

      <div className="p-5">
        {/* Top Row - Name and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 mb-1 truncate group-hover:text-emerald-600 transition-colors">
              {lead.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Tag className="w-3.5 h-3.5" />
              <span className="capitalize">{lead.leadType.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            {lead.leadScore && lead.leadScore > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                {lead.leadScore}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <Phone className="w-4 h-4 mr-2 text-slate-400" />
            <span>{lead.phone}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Mail className="w-4 h-4 mr-2 text-slate-400" />
            <span className="truncate">{lead.email}</span>
          </div>
          {(lead.city || lead.state) && (
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              <span>{[lead.city, lead.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Travel Details */}
        {(lead.checkInDate || lead.numberOfRooms) && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
            {lead.checkInDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-slate-700">
                  {new Date(lead.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            {lead.numberOfRooms && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-slate-700">{lead.numberOfRooms} rooms</span>
              </div>
            )}
            {lead.budget && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-emerald-600">₹{lead.budget.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {lead.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {lead.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                +{lead.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{daysSinceCreated === 0 ? 'Today' : `${daysSinceCreated}d ago`}</span>
          </div>
          <div className="flex items-center gap-2">
            {lead.nextFollowUpAt && (
              <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium">
                Follow-up due
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lead);
              }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
