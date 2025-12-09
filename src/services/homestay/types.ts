// Homestay Types
export interface Homestay {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  email?: string;
  totalRooms: number;
  images?: string[];
  amenities?: string[];
  status: 'active' | 'inactive' | 'maintenance';
  ownerId?: string;
  rooms?: Room[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomestayDto {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactNumber: string;
  email?: string;
  images?: string[];
  amenities?: string[];
  ownerId?: string;
}

export interface UpdateHomestayDto extends Partial<CreateHomestayDto> {
  status?: 'active' | 'inactive' | 'maintenance';
}

// Room Types
export enum RoomType {
  VIEW = 'view',
  NON_VIEW = 'non_view',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  BLOCKED = 'blocked',
  MAINTENANCE = 'maintenance',
}

export interface Room {
  id: string;
  roomNumber: string;
  roomName: string;
  roomType: RoomType;
  capacity: number;
  pricePerHead: number;
  basePrice?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  status: RoomStatus;
  blockReason?: string;
  blockedFrom?: string;
  blockedUntil?: string;
  floorNumber: number;
  homestayId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  roomNumber: string;
  roomName: string;
  roomType: RoomType;
  capacity: number;
  pricePerHead: number;
  basePrice?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  floorNumber?: number;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  status?: RoomStatus;
}

export interface BlockRoomDto {
  reason: string;
  blockedFrom?: string;
  blockedUntil?: string;
}

export interface UpdateRoomPricingDto {
  pricePerHead: number;
}

export interface HomestayStatistics {
  homestay: {
    id: string;
    name: string;
  };
  totalRooms: number;
  viewRooms: number;
  nonViewRooms: number;
  availableRooms: number;
  blockedRooms: number;
  totalCapacity: number;
}
