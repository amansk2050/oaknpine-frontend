'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Building2, Phone, Mail, Edit, MapPin, Zap, Home, Users, Eye, EyeOff, CheckCircle2, AlertTriangle, Settings } from 'lucide-react';
import {
  useHomestay,
  useRoomsByHomestay,
  useAddRoom,
  useUpdateRoom,
  useDeleteRoom,
  useBlockRoom,
  useUnblockRoom,
  useUpdateRoomPricing,
  CreateRoomDto,
  Room,
} from '@/services/homestay';
import RoomCard from '@/components/homestay/RoomCard';
import RoomModal from '@/components/homestay/RoomModal';
import BlockRoomModal from '@/components/homestay/BlockRoomModal';

export default function HomestayDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedRoomForPricing, setSelectedRoomForPricing] = useState<string>('');
  const [newPrice, setNewPrice] = useState(0);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [roomToBlock, setRoomToBlock] = useState<Room | null>(null);

  const { data: homestay, isLoading: homestayLoading } = useHomestay(params.id);
  const { data: rooms, isLoading: roomsLoading } = useRoomsByHomestay(params.id);
  const addRoomMutation = useAddRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();
  const blockRoomMutation = useBlockRoom();
  const unblockRoomMutation = useUnblockRoom();
  const updatePricingMutation = useUpdateRoomPricing();

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleSubmitRoom = async (data: CreateRoomDto) => {
    try {
      if (selectedRoom) {
        await updateRoomMutation.mutateAsync({ roomId: selectedRoom.id, data });
      } else {
        await addRoomMutation.mutateAsync({ homestayId: params.id, data });
      }
      setIsRoomModalOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoomMutation.mutateAsync({ roomId, homestayId: params.id });
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  const handleBlockRoom = (roomId: string) => {
    const room = rooms?.find((r) => r.id === roomId);
    if (room) {
      setRoomToBlock(room);
      setIsBlockModalOpen(true);
    }
  };

  const handleSubmitBlock = async (data: { reason: string; blockedFrom?: string; blockedUntil?: string }) => {
    if (!roomToBlock) return;
    try {
      await blockRoomMutation.mutateAsync({ roomId: roomToBlock.id, data });
      setIsBlockModalOpen(false);
      setRoomToBlock(null);
    } catch (error) {
      console.error('Failed to block room:', error);
    }
  };

  const handleUnblockRoom = async (roomId: string) => {
    try {
      await unblockRoomMutation.mutateAsync(roomId);
    } catch (error) {
      console.error('Failed to unblock room:', error);
    }
  };

  const handleUpdatePricing = (roomId: string) => {
    const room = rooms?.find((r) => r.id === roomId);
    if (room) {
      setSelectedRoomForPricing(roomId);
      setNewPrice(room.pricePerHead);
      setIsPricingModalOpen(true);
    }
  };

  const handleSubmitPricing = async () => {
    try {
      await updatePricingMutation.mutateAsync({ roomId: selectedRoomForPricing, data: { pricePerHead: newPrice } });
      setIsPricingModalOpen(false);
      setSelectedRoomForPricing('');
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  };

  if (homestayLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!homestay) {
    return <div>Homestay not found</div>;
  }

  const viewRooms = rooms?.filter((r) => r.roomType === 'view').length || 0;
  const nonViewRooms = rooms?.filter((r) => r.roomType === 'non_view').length || 0;
  const availableRooms = rooms?.filter((r) => r.status === 'available').length || 0;
  const blockedRooms = rooms?.filter((r) => r.status === 'blocked').length || 0;
  const totalCapacity = rooms?.reduce((sum, r) => sum + r.capacity, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => router.push(`/dashboard/homestays`)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Homestay
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  homestay.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  homestay.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {homestay.status === 'active' ? '✅ Active' : homestay.status === 'maintenance' ? '🔧 Maintenance' : '⏸️ Inactive'}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{homestay.name}</h1>
              <p className="text-purple-200 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {homestay.city}, {homestay.state}
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-purple-200 text-sm">Total Rooms</p>
                <p className="text-4xl font-bold text-white">{rooms?.length || 0}</p>
                <p className="text-purple-200 text-sm mt-1">Capacity: {totalCapacity} guests</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info & Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Property Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Address</p>
                    <p className="text-sm text-slate-900">{homestay.address}</p>
                    <p className="text-sm text-slate-900">{homestay.city}, {homestay.state} - {homestay.pincode}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Contact</p>
                    <p className="text-sm font-semibold text-slate-900">{homestay.contactNumber}</p>
                  </div>
                </div>
              </div>
              
              {homestay.email && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Email</p>
                      <p className="text-sm font-semibold text-slate-900">{homestay.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-2">Description</p>
              <p className="text-sm text-slate-700 mb-4">{homestay.description}</p>
              
              {homestay.amenities && homestay.amenities.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {homestay.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Room Stats */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl border-2 border-purple-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Room Stats</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-slate-600">View Rooms</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{viewRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-100">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Non-View Rooms</span>
              </div>
              <span className="text-lg font-bold text-slate-600">{nonViewRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">Available</span>
              </div>
              <span className="text-lg font-bold text-emerald-600">{availableRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-700">Blocked</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{blockedRooms}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-100 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700">Total Capacity</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{totalCapacity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Rooms</h2>
              <p className="text-slate-600">Manage rooms for this homestay</p>
            </div>
          </div>
          <button
            onClick={handleAddRoom}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Room
          </button>
        </div>

        {roomsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                onBlock={handleBlockRoom}
                onUnblock={handleUnblockRoom}
                onUpdatePricing={handleUpdatePricing}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No rooms added yet</h3>
            <p className="text-slate-600 mb-6">Start by adding your first room to this homestay</p>
            <button
              onClick={handleAddRoom}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium"
            >
              Add Room
            </button>
          </div>
        )}
      </div>

      {/* Room Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => { setIsRoomModalOpen(false); setSelectedRoom(null); }}
        onSubmit={handleSubmitRoom}
        room={selectedRoom}
        existingRooms={rooms || []}
        isLoading={addRoomMutation.isPending || updateRoomMutation.isPending}
      />

      {/* Block Room Modal */}
      <BlockRoomModal
        isOpen={isBlockModalOpen}
        onClose={() => { setIsBlockModalOpen(false); setRoomToBlock(null); }}
        onSubmit={handleSubmitBlock}
        roomNumber={roomToBlock?.roomNumber || ''}
        isLoading={blockRoomMutation.isPending}
      />

      {/* Pricing Modal */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Update Room Pricing</h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price Per Head (per night)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsPricingModalOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPricing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-medium"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
