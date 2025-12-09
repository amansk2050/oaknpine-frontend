'use client';

import React from 'react';
import { Users, Edit, Trash2, Lock, Unlock, DollarSign } from 'lucide-react';
import { Room, RoomStatus, RoomType } from '@/services/homestay/types';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onUpdatePricing: (id: string) => void;
}

export default function RoomCard({
  room,
  onEdit,
  onDelete,
  onBlock,
  onUnblock,
  onUpdatePricing,
}: RoomCardProps) {
  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case RoomStatus.BLOCKED:
        return 'bg-red-100 text-red-700 border-red-200';
      case RoomStatus.MAINTENANCE:
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoomTypeColor = (type: RoomType) => {
    return type === RoomType.VIEW
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-slate-900">{room.roomNumber}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoomTypeColor(room.roomType)}`}>
              {room.roomType === RoomType.VIEW ? 'View' : 'Non-View'}
            </span>
          </div>
          <p className="text-sm text-slate-600">{room.roomName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
          {room.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">Capacity: <strong>{room.capacity}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">₹<strong>{room.pricePerHead}</strong>/head</span>
        </div>
      </div>

      {/* Description */}
      {room.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{room.description}</p>
      )}

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
            >
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onEdit(room)}
          className="flex-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={() => onUpdatePricing(room.id)}
          className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          <DollarSign className="w-3.5 h-3.5" />
          Price
        </button>
        {room.status === RoomStatus.AVAILABLE ? (
          <button
            onClick={() => onBlock(room.id)}
            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded text-sm font-medium transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onUnblock(room.id)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-sm font-medium transition-colors"
          >
            <Unlock className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(room.id)}
          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded text-sm font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
