import { apiClient } from "./api";

export interface Destination {
  id: string;
  name: string;
  region: string;
  image_url: string;
  category_id?: string;
  category_name?: string;
  description: string;
  rating: number;
  reviews_count?: number;
  entrance_fee?: string;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Attraction {
  id: string;
  destination_id: string;
  name: string;
  description: string;
  image_url: string;
  entrance_fee: number;
}

export const destinationsService = {
  async getDestinations(params?: { category?: string; region?: string; search?: string }): Promise<Destination[]> {
    const response = await apiClient.get<Destination[]>('/destinations', params);
    return response.data || [];
  },

  async getPublishedDestinations(): Promise<Destination[]> {
    const response = await apiClient.get<Destination[]>('/destinations');
    return response.data || [];
  },

  async getDestinationById(id: string): Promise<Destination> {
    const response = await apiClient.get<Destination>(`/destinations/${id}`);
    return response.data!;
  },

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/destinations/categories');
    return response.data || [];
  },

  async getAttractionsByDestination(destinationId: string): Promise<Attraction[]> {
    const response = await apiClient.get<Attraction[]>(`/destinations/${destinationId}/attractions`);
    return response.data! || [];
  }
};
