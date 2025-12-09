import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { homestayApi, roomApi } from './queryFunction';
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

// Query Keys
export const homestayKeys = {
  all: ['homestays'] as const,
  lists: () => [...homestayKeys.all, 'list'] as const,
  list: () => [...homestayKeys.lists()] as const,
  details: () => [...homestayKeys.all, 'detail'] as const,
  detail: (id: string) => [...homestayKeys.details(), id] as const,
  statistics: (id: string) => [...homestayKeys.all, 'statistics', id] as const,
  rooms: (homestayId: string) => [...homestayKeys.all, 'rooms', homestayId] as const,
  availableRooms: (homestayId: string) => [...homestayKeys.all, 'available-rooms', homestayId] as const,
  roomDetail: (roomId: string) => [...homestayKeys.all, 'room', roomId] as const,
};

// ===== HOMESTAY HOOKS =====

// Get all homestays
export const useHomestays = (options?: UseQueryOptions<Homestay[]>) => {
  return useQuery<Homestay[]>({
    queryKey: homestayKeys.list(),
    queryFn: homestayApi.getAllHomestays,
    ...options,
  });
};

// Get homestay by ID
export const useHomestay = (id: string, options?: UseQueryOptions<Homestay>) => {
  return useQuery<Homestay>({
    queryKey: homestayKeys.detail(id),
    queryFn: () => homestayApi.getHomestayById(id),
    enabled: !!id,
    ...options,
  });
};

// Get homestay statistics
export const useHomestayStatistics = (id: string, options?: UseQueryOptions<HomestayStatistics>) => {
  return useQuery<HomestayStatistics>({
    queryKey: homestayKeys.statistics(id),
    queryFn: () => homestayApi.getHomestayStatistics(id),
    enabled: !!id,
    ...options,
  });
};

// Create homestay
export const useCreateHomestay = (options?: UseMutationOptions<Homestay, Error, CreateHomestayDto>) => {
  const queryClient = useQueryClient();

  return useMutation<Homestay, Error, CreateHomestayDto>({
    mutationFn: homestayApi.createHomestay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.lists() });
    },
    ...options,
  });
};

// Update homestay
export const useUpdateHomestay = (
  options?: UseMutationOptions<Homestay, Error, { id: string; data: UpdateHomestayDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Homestay, Error, { id: string; data: UpdateHomestayDto }>({
    mutationFn: ({ id, data }) => homestayApi.updateHomestay(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.lists() });
      queryClient.invalidateQueries({ queryKey: homestayKeys.detail(variables.id) });
    },
    ...options,
  });
};

// Delete homestay
export const useDeleteHomestay = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: homestayApi.deleteHomestay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.lists() });
    },
    ...options,
  });
};

// ===== ROOM HOOKS =====

// Get rooms by homestay
export const useRoomsByHomestay = (homestayId: string, options?: UseQueryOptions<Room[]>) => {
  return useQuery<Room[]>({
    queryKey: homestayKeys.rooms(homestayId),
    queryFn: () => roomApi.getRoomsByHomestay(homestayId),
    enabled: !!homestayId,
    ...options,
  });
};

// Get available rooms
export const useAvailableRooms = (homestayId: string, options?: UseQueryOptions<Room[]>) => {
  return useQuery<Room[]>({
    queryKey: homestayKeys.availableRooms(homestayId),
    queryFn: () => roomApi.getAvailableRooms(homestayId),
    enabled: !!homestayId,
    ...options,
  });
};

// Get room by ID
export const useRoom = (roomId: string, options?: UseQueryOptions<Room>) => {
  return useQuery<Room>({
    queryKey: homestayKeys.roomDetail(roomId),
    queryFn: () => roomApi.getRoomById(roomId),
    enabled: !!roomId,
    ...options,
  });
};

// Add room
export const useAddRoom = (
  options?: UseMutationOptions<Room, Error, { homestayId: string; data: CreateRoomDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Room, Error, { homestayId: string; data: CreateRoomDto }>({
    mutationFn: ({ homestayId, data }) => roomApi.addRoom(homestayId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.rooms(variables.homestayId) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.detail(variables.homestayId) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.statistics(variables.homestayId) });
    },
    ...options,
  });
};

// Update room
export const useUpdateRoom = (
  options?: UseMutationOptions<Room, Error, { roomId: string; data: UpdateRoomDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Room, Error, { roomId: string; data: UpdateRoomDto }>({
    mutationFn: ({ roomId, data }) => roomApi.updateRoom(roomId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.rooms(data.homestayId) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.roomDetail(data.id) });
    },
    ...options,
  });
};

// Delete room
export const useDeleteRoom = (options?: UseMutationOptions<void, Error, { roomId: string; homestayId: string }>) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { roomId: string; homestayId: string }>({
    mutationFn: ({ roomId }) => roomApi.deleteRoom(roomId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.rooms(variables.homestayId) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.detail(variables.homestayId) });
    },
    ...options,
  });
};

// Block room
export const useBlockRoom = (
  options?: UseMutationOptions<Room, Error, { roomId: string; data: BlockRoomDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Room, Error, { roomId: string; data: BlockRoomDto }>({
    mutationFn: ({ roomId, data }) => roomApi.blockRoom(roomId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.rooms(data.homestayId) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.roomDetail(data.id) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.availableRooms(data.homestayId) });
    },
    ...options,
  });
};

// Unblock room
export const useUnblockRoom = (options?: UseMutationOptions<Room, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation<Room, Error, string>({
    mutationFn: roomApi.unblockRoom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.rooms(data.homestayId) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.roomDetail(data.id) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.availableRooms(data.homestayId) });
    },
    ...options,
  });
};

// Update room pricing
export const useUpdateRoomPricing = (
  options?: UseMutationOptions<Room, Error, { roomId: string; data: UpdateRoomPricingDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Room, Error, { roomId: string; data: UpdateRoomPricingDto }>({
    mutationFn: ({ roomId, data }) => roomApi.updateRoomPricing(roomId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homestayKeys.rooms(data.homestayId) });
      queryClient.invalidateQueries({ queryKey: homestayKeys.roomDetail(data.id) });
    },
    ...options,
  });
};

// Export types
export * from './types';
