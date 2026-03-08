import { apiClient } from './api';

export interface HotelRoom {
  id: string;
  hotel_id: string;
  room_type: string;
  price_per_night: number;
  capacity: number;
  available_count: number;
  amenities?: string;
  description?: string;
  images?: string[];
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  region?: string;
  description?: string;
  price_per_night: number;
  amenities?: string;
  rating: number;
  total_rooms?: number;
  available_rooms?: number;
  image_url?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  rooms?: HotelRoom[];
  avgReviewRating?: number;
  reviewCount?: number;
}

export interface HotelSearchParams {
  location?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: string;
  amenities?: string | string[];
  sortBy?: string;
  limit?: number;
  offset?: number;
}

export const hotelsService = {
  async searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
    const response = await apiClient.get<Hotel[]>('/hotels', params);
    return response.data || [];
  },

  async getHotelById(id: string): Promise<Hotel> {
    const response = await apiClient.get<Hotel>(`/hotels/${id}`);
    return response.data!;
  },

  async createHotel(
    name: string,
    location: string,
    pricePerNight: number,
    description?: string,
    amenities?: string,
    totalRooms?: number,
    imageUrl?: string
  ): Promise<Hotel> {
    const response = await apiClient.post<Hotel>('/hotels', {
      name,
      location,
      pricePerNight,
      description,
      amenities,
      totalRooms,
      imageUrl,
    });
    return response.data!;
  },

  async updateHotel(id: string, data: Partial<Hotel>): Promise<Hotel> {
    const response = await apiClient.put<Hotel>(`/hotels/${id}`, data);
    return response.data!;
  },

  async deleteHotel(id: string): Promise<void> {
    await apiClient.delete(`/hotels/${id}`);
  },

  // Room Management
  async createRoom(data: Partial<HotelRoom>): Promise<HotelRoom> {
    const response = await apiClient.post<HotelRoom>('/hotels/rooms', data);
    return response.data!;
  },

  async updateRoom(id: string, data: Partial<HotelRoom>): Promise<HotelRoom> {
    const response = await apiClient.put<HotelRoom>(`/hotels/rooms/${id}`, data);
    return response.data!;
  },

  async deleteRoom(id: string): Promise<void> {
    await apiClient.delete(`/hotels/rooms/${id}`);
  },
};
