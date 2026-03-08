import { apiClient } from './api';
import { Booking } from './bookings';

export interface Itinerary {
  id: string;
  trip_id: string;
  day_number: number;
  activities: string;
  notes?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  description?: string;
  start_date: string;
  end_date: string;
  budget?: number;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  itineraries?: Itinerary[];
  bookings?: Booking[];
}

export const tripsService = {
  async createTrip(destination: string, startDate: string, endDate: string, description?: string, budget?: number): Promise<Trip> {
    const response = await apiClient.post<Trip>('/trips', {
      destination,
      startDate,
      endDate,
      description,
      budget,
    });
    return response.data!;
  },

  async getTrips(): Promise<Trip[]> {
    const response = await apiClient.get<Trip[]>('/trips');
    return response.data || [];
  },

  // Alias for user-facing pages
  async getUserTrips(): Promise<Trip[]> {
    return this.getTrips();
  },

  async getTripById(id: string): Promise<Trip> {
    const response = await apiClient.get<Trip>(`/trips/${id}`);
    return response.data!;
  },

  async updateTrip(
    id: string,
    destination?: string,
    startDate?: string,
    endDate?: string,
    description?: string,
    budget?: number,
    status?: string
  ): Promise<Trip> {
    const response = await apiClient.put<Trip>(`/trips/${id}`, {
      destination,
      startDate,
      endDate,
      description,
      budget,
      status,
    });
    return response.data!;
  },

  async deleteTrip(id: string): Promise<void> {
    await apiClient.delete(`/trips/${id}`);
  },

  async addItinerary(tripId: string, dayNumber: number, activities?: string, notes?: string): Promise<Itinerary> {
    const response = await apiClient.post<Itinerary>(`/trips/${tripId}/itinerary`, {
      dayNumber,
      activities,
      notes,
    });
    return response.data!;
  },
};
