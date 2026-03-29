import { apiClient } from './api';

export interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  seats_available: number;
  status: string;
}

export const flightService = {
  getFlights: async (params?: { from?: string; to?: string; date?: string; status?: string }) => {
    const response = await apiClient.get<Flight[]>('/flights', params);
    return response.data || [];
  },
  getFlightById: async (id: string) => {
    const response = await apiClient.get<Flight>(`/flights/${id}`);
    return response.data;
  },
  createFlight: async (data: Partial<Flight>) => {
    const response = await apiClient.post<Flight>('/flights', data);
    return response.data;
  },
  updateFlight: async (id: string, data: Partial<Flight>) => {
    const response = await apiClient.put<Flight>(`/flights/${id}`, data);
    return response.data;
  },
  deleteFlight: async (id: string) => {
    await apiClient.delete(`/flights/${id}`);
  }
};
