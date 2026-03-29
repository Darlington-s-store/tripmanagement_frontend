import { apiClient } from './api';

export interface AdminDashboardStats {
    totalUsers: number;
    totalBookings: number;
    totalTrips: number;
    totalReviews: number;
    totalRevenue: number;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    role: string;
    status: string;
    created_at: string;
}

export interface Review {
    id: string;
    user_id: string;
    booking_id: string;
    rating: number;
    comment: string;
    created_at: string;

    // Optional / mock properties mapped after fetching
    user?: string;
    service?: string;
    type?: string;
    status?: string;
}

export interface Booking {
    id: string;
    user_id: string;
    trip_id?: string;
    booking_type: string;
    reference_id: string;
    check_in_date: string;
    check_out_date?: string;
    number_of_guests: number;
    total_price: number | string;
    status: string;
    created_at: string;
    customer_name?: string;
    email?: string;
    phone?: string;
    service_name?: string;
    special_requests?: string;

    // Visual fields mapped on frontend
    user?: string;
    service?: string;
    type?: string;
    date?: string;
    amount?: number;
    paymentMethod?: string;
}

export interface Refund {
    id: string;
    booking_id: string;
    amount: number | string;
    reason: string;
    status: string;
    created_at: string;
    // visual
    user?: string;
    date?: string;
}

export interface Dispute {
    id: string;
    booking_id: string;
    description: string;
    status: string;
    admin_notes?: string;
    created_at: string;
    // visual
    user?: string;
    date?: string;
}

export interface AnalyticsStats {
    monthlyBookings: any[];
    bookingsByType: any[];
}

export interface AdminTrip {
    id: string;
    user_id: string;
    user_name: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: string | number;
    is_public: boolean;
    is_featured: boolean;
    created_at: string;
}

export const adminService = {
    async getDashboardStats(): Promise<AdminDashboardStats> {
        const response = await apiClient.get<AdminDashboardStats>('/admin/dashboard');
        return response.data!;
    },

    async getAllUsers(filters?: { search?: string; role?: string; status?: string }): Promise<User[]> {
        const response = await apiClient.get<User[]>('/admin/users', filters);
        return response.data || [];
    },

    async createUser(data: Partial<User> & { password?: string }): Promise<User> {
        const response = await apiClient.post<User>('/admin/users', data);
        return response.data!;
    },

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        const response = await apiClient.put<User>(`/admin/users/${id}`, updates);
        return response.data!;
    },

    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(`/admin/users/${id}`);
    },

    async resetPassword(id: string, data: { password?: string }): Promise<void> {
        await apiClient.post(`/admin/users/${id}/reset-password`, data);
    },

    async getUserActivity(id: string): Promise<any> {
        const response = await apiClient.get<any>(`/admin/users/${id}/activity`);
        return response.data;
    },

    async getAllReviews(): Promise<Review[]> {
        const response = await apiClient.get<Review[]>('/admin/reviews');
        return response.data || [];
    },

    async deleteReview(id: string): Promise<void> {
        await apiClient.delete(`/admin/reviews/${id}`);
    },

    async getAllBookings(): Promise<Booking[]> {
        const response = await apiClient.get<Booking[]>('/admin/bookings');
        return response.data || [];
    },

    async updateBooking(id: string, updates: { status: string }): Promise<Booking> {
        const response = await apiClient.put<Booking>(`/admin/bookings/${id}`, updates);
        return response.data!;
    },

    async getAllTrips(): Promise<AdminTrip[]> {
        const response = await apiClient.get<AdminTrip[]>('/admin/trips');
        return response.data || [];
    },

    async getTripById(id: string): Promise<AdminTrip> {
        const response = await apiClient.get<AdminTrip>(`/admin/trips/${id}`);
        return response.data!;
    },

    async deleteTrip(id: string): Promise<void> {
        await apiClient.delete(`/admin/trips/${id}`);
    },

    async updateTrip(id: string, updates: Partial<AdminTrip>): Promise<AdminTrip> {
        const response = await apiClient.put<AdminTrip>(`/admin/trips/${id}`, updates);
        return response.data!;
    },

    async getRefunds(): Promise<Refund[]> {
        const response = await apiClient.get<Refund[]>('/admin/refunds');
        return response.data || [];
    },

    async updateRefund(id: string, updates: { status: string }): Promise<Refund> {
        const response = await apiClient.put<Refund>(`/admin/refunds/${id}`, updates);
        return response.data!;
    },

    async getDisputes(): Promise<Dispute[]> {
        const response = await apiClient.get<Dispute[]>('/admin/disputes');
        return response.data || [];
    },

    async updateDispute(id: string, updates: { status?: string, adminNotes?: string }): Promise<Dispute> {
        const response = await apiClient.put<Dispute>(`/admin/disputes/${id}`, updates);
        return response.data!;
    },

    async getAnalytics(): Promise<AnalyticsStats> {
        const response = await apiClient.get<AnalyticsStats>('/admin/analytics');
        return response.data!;
    },

    async updateSettings(key: string, value: any): Promise<any> {
        const response = await apiClient.put<any>('/admin/settings', { key, value });
        return response.data;
    },

    async getListings(): Promise<Listing[]> {
        const response = await apiClient.get<Listing[]>('/admin/listings');
        return response.data || [];
    },

    async updateListing(id: string, updates: { status: string }): Promise<Listing> {
        const response = await apiClient.put<Listing>(`/admin/listings/${id}`, updates);
        return response.data!;
    },

    // Destinations
    async getAllDestinations(): Promise<Destination[]> {
        const response = await apiClient.get<Destination[]>('/admin/destinations');
        return response.data || [];
    },

    async createDestination(data: Partial<Destination>): Promise<Destination> {
        const response = await apiClient.post<Destination>('/admin/destinations', data);
        return response.data!;
    },

    async updateDestination(id: string, updates: Partial<Destination>): Promise<Destination> {
        const response = await apiClient.put<Destination>(`/admin/destinations/${id}`, updates);
        return response.data!;
    },

    async deleteDestination(id: string): Promise<void> {
        await apiClient.delete(`/admin/destinations/${id}`);
    },

    // Attractions
    async getAllAttractions(): Promise<Attraction[]> {
        const response = await apiClient.get<Attraction[]>('/admin/attractions');
        return response.data || [];
    },

    async createAttraction(data: Partial<Attraction>): Promise<Attraction> {
        const response = await apiClient.post<Attraction>('/admin/attractions', data);
        return response.data!;
    },

    async updateAttraction(id: string, updates: Partial<Attraction>): Promise<Attraction> {
        const response = await apiClient.put<Attraction>(`/admin/attractions/${id}`, updates);
        return response.data!;
    },

    async deleteAttraction(id: string): Promise<void> {
        await apiClient.delete(`/admin/attractions/${id}`);
    },

    // Suggested Itineraries
    async getSuggestedItineraries(): Promise<SuggestedItinerary[]> {
        const response = await apiClient.get<SuggestedItinerary[]>('/admin/itineraries/suggested');
        return response.data || [];
    },

    async createSuggestedItinerary(data: Partial<SuggestedItinerary>): Promise<SuggestedItinerary> {
        const response = await apiClient.post<SuggestedItinerary>('/admin/itineraries/suggested', data);
        return response.data!;
    },

    async updateSuggestedItinerary(id: string, updates: Partial<SuggestedItinerary>): Promise<SuggestedItinerary> {
        const response = await apiClient.put<SuggestedItinerary>(`/admin/itineraries/suggested/${id}`, updates);
        return response.data!;
    },

    async deleteSuggestedItinerary(id: string): Promise<void> {
        await apiClient.delete(`/admin/itineraries/suggested/${id}`);
    },

    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await apiClient.get<Category[]>('/admin/categories');
        return response.data || [];
    },

    async createCategory(data: Partial<Category>): Promise<Category> {
        const response = await apiClient.post<Category>('/admin/categories', data);
        return response.data!;
    },

    async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
        const response = await apiClient.put<Category>(`/admin/categories/${id}`, updates);
        return response.data!;
    },

    async deleteCategory(id: string): Promise<void> {
        await apiClient.delete(`/admin/categories/${id}`);
    },

    // Travel Info
    async getAllTravelInfo(): Promise<TravelInfo[]> {
        const response = await apiClient.get<TravelInfo[]>('/admin/travel-info');
        return response.data || [];
    },

    async createTravelInfo(data: Partial<TravelInfo>): Promise<TravelInfo> {
        const response = await apiClient.post<TravelInfo>('/admin/travel-info', data);
        return response.data!;
    },

    async updateTravelInfo(id: string, updates: Partial<TravelInfo>): Promise<TravelInfo> {
        const response = await apiClient.put<TravelInfo>(`/admin/travel-info/${id}`, updates);
        return response.data!;
    },

    async deleteTravelInfo(id: string): Promise<void> {
        await apiClient.delete(`/admin/travel-info/${id}`);
    }
};

export interface Destination {
    id: string;
    name: string;
    region: string;
    category_id: string;
    category_name?: string;
    description: string;
    full_description?: string;
    image_url: string;
    gallery?: string[];
    travel_tips?: string[];
    activities?: string[];
    best_time?: string;
    entrance_fee: string;
    opening_hours: string;
    rating: number;
    reviews_count: number;
    location_data?: {
        lat: number;
        lng: number;
    };
    location_map?: string;
    status: string;
    tags?: string[];
    created_at: string;
}

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
    location_map?: string;
    status: string;
}

export interface SuggestedItinerary {
    id: string;
    destination_id: string;
    destination_name?: string;
    title: string;
    description: string;
    duration_days: number;
    image_url: string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface TravelInfo {
    id: string;
    title: string;
    category: string;
    content: string;
    icon?: string;
    is_featured: boolean;
    last_updated: string;
    created_at: string;
}

export interface Listing {
    id: string; // Keep as string for uuids
    name: string;
    type: string;
    provider: string;
    location: string;
    status: string;
    submitted?: string;
    date?: string;
    bookings?: number;
    rating?: number;
}
