import { apiClient } from './api';

export interface ReviewSubmission {
    user_id?: string;
    booking_id?: string;
    rating: number;
    comment: string;
    full_name?: string;
    location?: string;
}

export interface PublicReview {
    id: string;
    full_name: string;
    location: string;
    comment: string;
    rating: number;
    created_at: string;
}

export const reviewsService = {
    async getPublishedReviews(): Promise<PublicReview[]> {
        const response = await apiClient.get<PublicReview[]>('/reviews/published');
        return response.data || [];
    },

    async submitReview(data: ReviewSubmission): Promise<void> {
        await apiClient.post('/reviews', data);
    }
};
