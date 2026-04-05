import { apiClient } from './api';
import { Booking } from './bookings';
import { TripPlanningDetails } from '@/lib/trip-planning';

export interface Itinerary {
  id: string;
  trip_id: string;
  day_number: number;
  activities: string;
  notes?: string;
}

export interface TripItineraryPayload {
  dayNumber: number;
  activities?: string;
  notes?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  trip_name?: string;
  destination: string;
  description?: string;
  start_date: string;
  end_date: string;
  budget?: number;
  traveller_count?: number;
  planning_details?: TripPlanningDetails;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  itineraries?: Itinerary[];
  bookings?: Booking[];
}

export interface TripPayload {
  tripName?: string | null;
  destination?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  budget?: number | null;
  travellerCount?: number;
  planningDetails?: TripPlanningDetails | null;
  status?: string;
}

export const tripsService = {
  async createTrip(payload: TripPayload): Promise<Trip> {
    const response = await apiClient.post<Trip>('/trips', payload);
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

  async updateTrip(id: string, payload: TripPayload): Promise<Trip> {
    const response = await apiClient.put<Trip>(`/trips/${id}`, payload);
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

  async replaceItinerary(tripId: string, items: TripItineraryPayload[]): Promise<Itinerary[]> {
    const response = await apiClient.put<Itinerary[]>(`/trips/${tripId}/itinerary`, {
      items,
    });
    return response.data || [];
  },
};
