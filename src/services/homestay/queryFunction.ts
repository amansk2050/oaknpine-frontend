import axiosInstance from '../axiosinstance';
import {
  Homestay,
  CreateHomestayDto,
  UpdateHomestayDto,
  Room,
  CreateRoomDto,
  UpdateRoomDto,
  BlockRoomDto,
  UpdateRoomPricingDto,
  HomestayStatistics,
} from './types';

// Homestay API functions
export const homestayApi = {
  // Create homestay
  createHomestay: async (data: CreateHomestayDto): Promise<Homestay> => {
    const response = await axiosInstance.post<Homestay>('/homestay', data);
    return response.data;
  },

  // Get all homestays
  getAllHomestays: async (): Promise<Homestay[]> => {
    const response = await axiosInstance.get<Homestay[]>('/homestay');
    return response.data;
  },

  // Get homestay by ID
  getHomestayById: async (id: string): Promise<Homestay> => {
    const response = await axiosInstance.get<Homestay>(`/homestay/${id}`);
    return response.data;
  },

  // Update homestay
  updateHomestay: async (id: string, data: UpdateHomestayDto): Promise<Homestay> => {
    const response = await axiosInstance.put<Homestay>(`/homestay/${id}`, data);
    return response.data;
  },

  // Delete homestay
  deleteHomestay: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/homestay/${id}`);
  },

  // Get homestay statistics
  getHomestayStatistics: async (id: string): Promise<HomestayStatistics> => {
    const response = await axiosInstance.get<HomestayStatistics>(`/homestay/${id}/statistics`);
    return response.data;
  },
};

// Room API functions
export const roomApi = {
  // Add room to homestay
  addRoom: async (homestayId: string, data: CreateRoomDto): Promise<Room> => {
    const response = await axiosInstance.post<Room>(`/homestay/${homestayId}/rooms`, data);
    return response.data;
  },

  // Get all rooms by homestay
  getRoomsByHomestay: async (homestayId: string): Promise<Room[]> => {
    const response = await axiosInstance.get<Room[]>(`/homestay/${homestayId}/rooms`);
    return response.data;
  },

  // Get available rooms
  getAvailableRooms: async (homestayId: string): Promise<Room[]> => {
    const response = await axiosInstance.get<Room[]>(`/homestay/${homestayId}/rooms/available`);
    return response.data;
  },

  // Get room by ID
  getRoomById: async (roomId: string): Promise<Room> => {
    const response = await axiosInstance.get<Room>(`/homestay/rooms/${roomId}`);
    return response.data;
  },

  // Update room
  updateRoom: async (roomId: string, data: UpdateRoomDto): Promise<Room> => {
    const response = await axiosInstance.put<Room>(`/homestay/rooms/${roomId}`, data);
    return response.data;
  },

  // Delete room
  deleteRoom: async (roomId: string): Promise<void> => {
    await axiosInstance.delete(`/homestay/rooms/${roomId}`);
  },

  // Block room
  blockRoom: async (roomId: string, data: BlockRoomDto): Promise<Room> => {
    const response = await axiosInstance.patch<Room>(`/homestay/rooms/${roomId}/block`, data);
    return response.data;
  },

  // Unblock room
  unblockRoom: async (roomId: string): Promise<Room> => {
    const response = await axiosInstance.patch<Room>(`/homestay/rooms/${roomId}/unblock`);
    return response.data;
  },

  // Update room pricing
  updateRoomPricing: async (roomId: string, data: UpdateRoomPricingDto): Promise<Room> => {
    const response = await axiosInstance.patch<Room>(`/homestay/rooms/${roomId}/pricing`, data);
    return response.data;
  },
};
