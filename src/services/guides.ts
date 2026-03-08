import { apiClient } from './api';

export interface Guide {
  id: string;
  name: string;
  experience_years?: number;
  languages?: string;
  hourly_rate: number;
  bio?: string;
  rating: number;
  image_url?: string;
  reviews?: {
    average_rating: number;
    total_reviews: number;
  };
}

export interface GuideSearchParams {
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export const guidesService = {
  async searchGuides(params: GuideSearchParams): Promise<Guide[]> {
    const response = await apiClient.get<Guide[]>('/guides', params);
    return response.data || [];
  },

  async getGuideById(id: string): Promise<Guide> {
    const response = await apiClient.get<Guide>(`/guides/${id}`);
    return response.data!;
  },

  async createGuide(
    name: string,
    hourlyRate: number,
    experienceYears?: number,
    languages?: string,
    bio?: string,
    imageUrl?: string
  ): Promise<Guide> {
    const response = await apiClient.post<Guide>('/guides', {
      name,
      hourlyRate,
      experienceYears,
      languages,
      bio,
      imageUrl,
    });
    return response.data!;
  },

  async updateGuide(id: string, data: Partial<Guide>): Promise<Guide> {
    const response = await apiClient.put<Guide>(`/guides/${id}`, data);
    return response.data!;
  },

  async deleteGuide(id: string): Promise<void> {
    await apiClient.delete(`/guides/${id}`);
  },
};
