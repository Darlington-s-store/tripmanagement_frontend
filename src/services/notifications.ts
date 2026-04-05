import { apiClient } from './api';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export const notificationsService = {
    getUserNotifications: async (): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>('/notifications');
        return response.data || [];
    },

    markAsRead: async (id: string): Promise<void> => {
        await apiClient.patch(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await apiClient.patch('/notifications/read-all');
    },

    // Admin Methods
    getAllNotifications: async (): Promise<(Notification & { user_full_name: string; user_email: string })[]> => {
        const response = await apiClient.get<(Notification & { user_full_name: string; user_email: string })[]>('/notifications/admin');
        return response.data || [];
    },

    sendAnnouncement: async (title: string, message: string, type: string = 'announcement'): Promise<void> => {
        await apiClient.post('/notifications/admin/announcement', { title, message, type });
    },

    deleteNotification: async (id: string): Promise<void> => {
        await apiClient.delete(`/notifications/admin/${id}`);
    }
};
