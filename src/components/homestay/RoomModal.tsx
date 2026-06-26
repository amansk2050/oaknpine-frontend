'use client';

import React, { useEffect, useState } from 'react';
import { X, Plus, Copy } from 'lucide-react';
import { CreateRoomDto, Room, RoomType } from '@/services/homestay/types';
import ImageUploadZone from '../common/ImageUploadZone';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomDto) => void;
  room?: Room | null;
  isLoading?: boolean;
  existingRooms?: Room[];
}

export default function RoomModal({
  isOpen,
  onClose,
  onSubmit,
  room,
  isLoading,
  existingRooms = [],
}: RoomModalProps) {
  const [formData, setFormData] = useState<CreateRoomDto>({
    roomNumber: '',
    roomName: '',
    roomType: RoomType.NON_VIEW,
    capacity: 1,
    pricePerHead: 0,
    amenities: [],
    images: [],
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [showCopyOptions, setShowCopyOptions] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        roomName: room.roomName,
        roomType: room.roomType,
        capacity: room.capacity,
        pricePerHead: room.pricePerHead,
        basePrice: room.basePrice,
        description: room.description,
        amenities: room.amenities || [],
        images: room.images || [],
        floorNumber: room.floorNumber,
      });
    } else {
      setFormData({
        roomNumber: '',
        roomName: '',
        roomType: RoomType.NON_VIEW,
        capacity: 1,
        pricePerHead: 0,
        amenities: [],
        images: [],
      });
    }
  }, [room]);

  const handleCopyFromRoom = (sourceRoom: Room) => {
    setFormData({
      roomNumber: '', // Keep empty for user to fill
      roomName: sourceRoom.roomName,
      roomType: sourceRoom.roomType,
      capacity: sourceRoom.capacity,
      pricePerHead: sourceRoom.pricePerHead,
      basePrice: sourceRoom.basePrice,
      description: sourceRoom.description,
      amenities: [...(sourceRoom.amenities || [])],
      images: [...(sourceRoom.images || [])],
      floorNumber: sourceRoom.floorNumber,
    });
    setShowCopyOptions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({ ...formData, amenities: [...(formData.amenities || []), newAmenity.trim()] });
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities?.filter((_, i) => i !== index),
    });
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">
              {room ? 'Edit Room' : 'Add New Room'}
            </h2>
            {!room && existingRooms.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCopyOptions(!showCopyOptions)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Config
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Copy Options Dropdown */}
        {showCopyOptions && existingRooms.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Copy configuration from existing room:
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {existingRooms.map((existingRoom) => (
                <button
                  key={existingRoom.id}
                  type="button"
                  onClick={() => handleCopyFromRoom(existingRoom)}
                  className="px-3 py-2 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg text-left text-sm transition-colors"
                >
                  <p className="font-medium text-blue-900">{existingRoom.roomNumber}</p>
                  <p className="text-xs text-blue-700">{existingRoom.roomName}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Type *
                </label>
                <select
                  required
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  <option value={RoomType.VIEW}>View Room</option>
                  <option value={RoomType.NON_VIEW}>Non-View Room</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Deluxe Mountain View"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Floor Number
                </label>
                <input
                  type="number"
                  value={formData.floorNumber || 0}
                  onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price Per Head *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.pricePerHead}
                  onChange={(e) => setFormData({ ...formData, pricePerHead: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Base Price
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="3000"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Spacious room with king-size bed..."
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Amenities</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Add amenity (e.g., AC, TV)"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities?.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Images</h3>
              <ImageUploadZone
                multiple={true}
                currentImages={formData.images || []}
                onUploadSuccess={(urls) => {
                  setFormData((prev) => ({
                    ...prev,
                    images: [...(prev.images || []), ...urls],
                  }));
                }}
                onDeleteImage={(url) => {
                  setFormData((prev) => ({
                    ...prev,
                    images: prev.images?.filter((img) => img !== url) || [],
                  }));
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : room ? 'Update Room' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
