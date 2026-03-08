import { apiClient, ApiResponse } from './api';

export interface TransportService {
    id: string;
    provider_id?: string;
    name: string;
    type: 'bus' | 'flight' | 'car';
    operator: string;
    from_location: string;
    to_location: string;
    departure_time?: string;
    arrival_time?: string;
    price: number;
    capacity?: number;
    image_url?: string;
    status: string;
}

export const transportService = {
    getTransportServices: async (params?: { type?: string; from?: string; to?: string; operator?: string }) => {
        const response = await apiClient.get<TransportService[]>('/transport', params);
        return response.data || [];
    },

    getTransportById: async (id: string) => {
        const response = await apiClient.get<TransportService>(`/transport/${id}`);
        return response.data;
    },
};
