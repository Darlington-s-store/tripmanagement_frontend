
import { apiClient } from './api';

export interface Attraction {
    id: string;
    destination_id: string;
    name: string;
    category: string;
    description: string;
    entrance_fee: string;
    opening_hours: string;
    image_url: string;
    destination_name?: string;
}

export interface Destination {
    id: string;
    name: string;
    description: string;
    region: string;
    category: string;
    image_url: string;
    rating: number;
    attractions?: Attraction[];
}

export const destinationsService = {
    async getDestinations(params?: { category?: string; region?: string; search?: string }): Promise<Destination[]> {
        const response = await apiClient.get<{ success: boolean; data: Destination[] }>('/destinations', { params });
        return response.data?.data || [];
    },

    async getDestinationById(id: string): Promise<Destination> {
        const response = await apiClient.get<{ success: boolean; data: Destination }>(`/destinations/${id}`);
        return response.data?.data!;
    },

    async searchAttractions(params?: { search?: string; category?: string }): Promise<Attraction[]> {
        const response = await apiClient.get<{ success: boolean; data: Attraction[] }>('/destinations/attractions/search', { params });
        return response.data?.data || [];
    }
};
