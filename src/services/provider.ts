import { apiClient } from './api';

export interface ProviderDashboardStats {
    totalBookings: number;
    activeListings: number;
    avgRating: number;
    totalRevenue: number;
    listings: ProviderListing[];
    recentBookings: ProviderBooking[];
}

export interface ProviderListing {
    id: string;
    name: string;
    type: string;
    status: string;
    rating: number;
    booking_count: number | string;
    price?: number;
    location?: string;
}

export interface ProviderBooking {
    id: string;
    guest: string;
    service_name: string;
    booking_type: string;
    date?: string;
    check_in_date?: string;
    check_out_date?: string;
    amount: number | string;
    status: string;
    created_at: string;
}

export const providerService = {
    async getDashboard(): Promise<ProviderDashboardStats> {
        const response = await apiClient.get<ProviderDashboardStats>('/provider/dashboard');
        return response.data!;
    },

    async getListings(): Promise<ProviderListing[]> {
        const response = await apiClient.get<ProviderListing[]>('/provider/listings');
        return response.data || [];
    },

    async getBookings(): Promise<ProviderBooking[]> {
        const response = await apiClient.get<ProviderBooking[]>('/provider/bookings');
        return response.data || [];
    }
};
