'use client';

import React, { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { CreateLeadDto, Lead, LeadSource, LeadPriority, LeadType } from '@/services/lead/types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadDto) => void;
  lead?: Lead | null;
  isLoading?: boolean;
}

export default function LeadModal({ isOpen, onClose, onSubmit, lead, isLoading }: LeadModalProps) {
  const [formData, setFormData] = useState<CreateLeadDto>({
    name: '',
    email: '',
    phone: '',
    source: LeadSource.WEBSITE,
    priority: LeadPriority.MEDIUM,
    leadType: LeadType.INDIVIDUAL,
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        alternatePhone: lead.alternatePhone,
        source: lead.source,
        sourceDetails: lead.sourceDetails,
        priority: lead.priority,
        leadType: lead.leadType,
        city: lead.city,
        state: lead.state,
        country: lead.country,
        checkInDate: lead.checkInDate,
        checkOutDate: lead.checkOutDate,
        numberOfAdults: lead.numberOfAdults,
        numberOfChildren: lead.numberOfChildren,
        numberOfRooms: lead.numberOfRooms,
        budget: lead.budget,
        requirements: lead.requirements,
        notes: lead.notes,
        referredBy: lead.referredBy,
        companyName: lead.companyName,
        tags: lead.tags,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        leadType: LeadType.INDIVIDUAL,
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && (!formData.tags || !formData.tags.includes(newTag.trim()))) {
      setFormData({ ...formData, tags: [...(formData.tags || []), newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-blue-50">
          <h2 className="text-2xl font-bold text-slate-900">
            {lead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.alternatePhone || ''}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lead Source *
                  </label>
                  <select
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value={LeadSource.WEBSITE}>Website</option>
                    <option value={LeadSource.PHONE_CALL}>Phone Call</option>
                    <option value={LeadSource.EMAIL}>Email</option>
                    <option value={LeadSource.SOCIAL_MEDIA}>Social Media</option>
                    <option value={LeadSource.REFERRAL}>Referral</option>
                    <option value={LeadSource.WALK_IN}>Walk-in</option>
                    <option value={LeadSource.ONLINE_AD}>Online Ad</option>
                    <option value={LeadSource.BOOKING_PLATFORM}>Booking Platform</option>
                    <option value={LeadSource.AGENT}>Agent</option>
                    <option value={LeadSource.OTHER}>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as LeadPriority })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value={LeadPriority.LOW}>Low</option>
                    <option value={LeadPriority.MEDIUM}>Medium</option>
                    <option value={LeadPriority.HIGH}>High</option>
                    <option value={LeadPriority.URGENT}>Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lead Type
                  </label>
                  <select
                    value={formData.leadType}
                    onChange={(e) => setFormData({ ...formData, leadType: e.target.value as LeadType })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value={LeadType.INDIVIDUAL}>Individual</option>
                    <option value={LeadType.CORPORATE}>Corporate</option>
                    <option value={LeadType.GROUP}>Group</option>
                    <option value={LeadType.FAMILY}>Family</option>
                    <option value={LeadType.WEDDING}>Wedding</option>
                    <option value={LeadType.EVENT}>Event</option>
                  </select>
                </div>

                {formData.leadType === LeadType.CORPORATE && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="Company name"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Travel Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                Travel Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate || ''}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate || ''}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfAdults || ''}
                    onChange={(e) => setFormData({ ...formData, numberOfAdults: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.numberOfChildren || ''}
                    onChange={(e) => setFormData({ ...formData, numberOfChildren: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfRooms || ''}
                    onChange={(e) => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="15000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    rows={2}
                    value={formData.requirements || ''}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Any special requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                Tags
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Add tag (e.g., hot-lead, vip)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700 rounded-lg text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="hover:text-emerald-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Internal Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Add any internal notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : lead ? 'Update Lead' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
