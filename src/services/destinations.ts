import { apiClient } from './api';

export interface Attraction {
    id: string;
    destination_id: string;
    destination_name?: string;
    name: string;
    category: string;
    description: string;
    full_description?: string;
    image_url: string;
    gallery?: string[];
    travel_tips?: string[];
    activities?: string[];
    best_time?: string;
    entrance_fee: string;
    opening_hours: string;
}

export interface Destination {
    id: string;
    name: string;
    description: string;
    full_description?: string;
    region: string;
    category: string;
    image_url: string;
    gallery?: string[];
    travel_tips?: string[];
    activities?: string[];
    best_time?: string;
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

    async getAttractionById(id: string): Promise<Attraction> {
        const response = await apiClient.get<{ success: boolean; data: Attraction }>(`/destinations/attractions/${id}`);
        return response.data?.data!;
    },

    async searchAttractions(params?: { search?: string; category?: string }): Promise<Attraction[]> {
        const response = await apiClient.get<{ success: boolean; data: Attraction[] }>('/destinations/attractions/search', { params });
        return response.data?.data || [];
    }
};
