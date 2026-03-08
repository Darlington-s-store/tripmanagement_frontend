import { apiClient } from './api';

export interface Review {
  id: string;
  booking_id: string;
  user_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  booking_type?: string;
  reference_id?: string;
}

export const reviewsService = {
  async createReview(bookingId: string, rating: number, title?: string, comment?: string): Promise<Review> {
    const response = await apiClient.post<Review>('/reviews', {
      bookingId,
      rating,
      title,
      comment,
    });
    return response.data!;
  },

  async getReviewsByBooking(bookingId: string): Promise<Review[]> {
    const response = await apiClient.get<Review[]>(`/reviews/booking/${bookingId}`);
    return response.data || [];
  },

  async getUserReviews(): Promise<Review[]> {
    const response = await apiClient.get<Review[]>('/reviews');
    return response.data || [];
  },

  async updateReview(id: string, rating?: number, title?: string, comment?: string): Promise<Review> {
    const response = await apiClient.put<Review>(`/reviews/${id}`, {
      rating,
      title,
      comment,
    });
    return response.data!;
  },

  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`);
  },
};
