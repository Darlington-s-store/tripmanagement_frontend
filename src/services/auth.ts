import { apiClient, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  role: 'user' | 'admin' | 'provider';
  preferences?: any;
  created_at?: string;
  requires_password_change?: boolean;
  two_factor_enabled?: boolean;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  email?: string;
}

export const authService = {
  async register(email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      fullName,
      phone,
    });
    const { user, token, refreshToken } = response.data!;
    this.setToken(token);
    this.setRefreshToken(refreshToken);
    return response.data!;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    const { token, refreshToken, mfaRequired } = response.data!;
    if (!mfaRequired && token && refreshToken) {
      this.setToken(token);
      this.setRefreshToken(refreshToken);
    }
    return response.data!;
  },

  async adminLogin(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/admin-login', {
      email,
      password,
    });
    const { token, refreshToken, mfaRequired } = response.data!;
    if (!mfaRequired && token && refreshToken) {
      this.setToken(token);
      this.setRefreshToken(refreshToken);
    }
    return response.data!;
  },

  async verifyMFA(email: string, code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/verify-mfa', {
      email,
      code,
    });
    const { token, refreshToken } = response.data!;
    if (token && refreshToken) {
      this.setToken(token);
      this.setRefreshToken(refreshToken);
    }
    return response.data!;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data!;
  },

  async updateProfile(fullName?: string, phone?: string, bio?: string, avatarUrl?: string): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', {
      fullName,
      phone,
      bio,
      avatarUrl,
    });
    return response.data!;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  async updatePreferences(preferences: any): Promise<any> {
    const response = await apiClient.put<any>('/auth/preferences', {
      preferences,
    });
    return response.data!;
  },

  async toggleMFA(enabled: boolean): Promise<any> {
    const response = await apiClient.put<any>('/auth/toggle-mfa', {
      enabled,
    });
    return response.data!;
  },

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  clearToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
