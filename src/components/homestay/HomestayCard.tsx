'use client';

import React from 'react';
import { Building2, MapPin, Phone, Mail, Edit, Trash2, Eye } from 'lucide-react';
import { Homestay } from '@/services/homestay/types';

interface HomestayCardProps {
  homestay: Homestay;
  onEdit: (homestay: Homestay) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function HomestayCard({ homestay, onEdit, onDelete, onView }: HomestayCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'inactive':
        return 'bg-slate-100 text-slate-700';
      case 'maintenance':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {homestay.images && homestay.images.length > 0 ? (
          <img
            src={homestay.images[0]}
            alt={homestay.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(homestay.status)}`}>
            {homestay.status}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">
          {homestay.name}
        </h3>
        
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {homestay.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-start text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-slate-400" />
            <span className="line-clamp-1">{homestay.city}, {homestay.state}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-slate-400" />
            <span>{homestay.contactNumber}</span>
          </div>
          {homestay.email && (
            <div className="flex items-center text-sm text-slate-600">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-1">{homestay.email}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between py-3 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{homestay.totalRooms}</p>
            <p className="text-xs text-slate-500">Total Rooms</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {homestay.amenities?.length || 0}
            </p>
            <p className="text-xs text-slate-500">Amenities</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onView(homestay.id)}
            className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => onEdit(homestay)}
            className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(homestay.id)}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
