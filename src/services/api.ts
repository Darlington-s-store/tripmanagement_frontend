const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class ApiClient {
  private csrfToken: string | null = null;

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async fetchCsrfToken(force = false): Promise<string> {
    if (this.csrfToken && !force) return this.csrfToken;
    try {
      const response = await fetch(`${API_URL}/csrf-token`, {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent to generate the right token
      });
      if (!response.ok) throw new Error('CSRF response not OK');
      const data = await response.json();
      this.csrfToken = data.csrfToken;
      return this.csrfToken!;
    } catch (e) {
      console.error('Failed to fetch CSRF token', e);
      return '';
    }
  }

  private async getHeaders(isMutating = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (isMutating) {
      const csrf = await this.fetchCsrfToken();
      if (csrf) headers['x-csrf-token'] = csrf;
    }

    return headers;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const options: RequestInit = {
      method: 'GET',
      headers: await this.getHeaders(),
      credentials: 'include',
    };
    const response = await fetch(url.toString(), options);

    return this.handleResponse<T>(response, { ...options, url: url.toString() });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    const options: RequestInit = {
      method: 'POST',
      headers: await this.getHeaders(true),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    };
    const response = await fetch(url, options);

    return this.handleResponse<T>(response, { ...options, url });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    const options: RequestInit = {
      method: 'PUT',
      headers: await this.getHeaders(true),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    };
    const response = await fetch(url, options);

    return this.handleResponse<T>(response, { ...options, url });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    const options: RequestInit = {
      method: 'DELETE',
      headers: await this.getHeaders(true),
      credentials: 'include',
    };
    const response = await fetch(url, options);

    return this.handleResponse<T>(response, { ...options, url });
  }

  private isRefreshing = false;
  private refreshSubscribers: ((newToken: string) => void)[] = [];

  private onTokenRefreshed(newToken: string) {
    this.refreshSubscribers.forEach(cb => cb(newToken));
    this.refreshSubscribers = [];
  }

  private async handleResponse<T>(response: Response, requestOptions?: any): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // If it's a CSRF error, try to fetch a new token and retry once
      const isCsrfError = response.status === 403 && data?.message?.toLowerCase().includes('csrf');
      const isAuthError = response.status === 401;

      if (isCsrfError && requestOptions && !requestOptions._isRetry) {
        console.warn('CSRF Token invalid, retrying...');
        const newToken = await this.fetchCsrfToken(true);
        if (newToken) {
          const newHeaders = { ...requestOptions.headers, 'x-csrf-token': newToken };
          const retryResponse = await fetch(requestOptions.url, {
            ...requestOptions,
            headers: newHeaders,
            _isRetry: true
          } as any);
          return this.handleResponse<T>(retryResponse);
        }
      }

      if (isAuthError && requestOptions && !requestOptions._isRetry) {
        if (this.isRefreshing) {
          console.log('Refresh already in progress, queuing request...');
          return new Promise<ApiResponse<T>>((resolve) => {
            this.refreshSubscribers.push(async (newToken: string) => {
              const newHeaders = { ...requestOptions.headers, 'Authorization': `Bearer ${newToken}` };
              const retryResponse = await fetch(requestOptions.url, {
                ...requestOptions,
                headers: newHeaders,
                _isRetry: true
              } as any);
              resolve(this.handleResponse<T>(retryResponse));
            });
          });
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          this.isRefreshing = true;
          console.warn('Auth Token expired, attempting refresh...');
          try {
            const csrfToken = await this.fetchCsrfToken();
            const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken
              },
              body: JSON.stringify({ refreshToken }),
              credentials: 'include',
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.success && refreshData.data?.token) {
                const newToken = refreshData.data.token;
                const newRefreshToken = refreshData.data.refreshToken;

                localStorage.setItem('authToken', newToken);
                if (newRefreshToken) {
                  localStorage.setItem('refreshToken', newRefreshToken);
                }

                this.isRefreshing = false;
                this.onTokenRefreshed(newToken);

                const newHeaders = { ...requestOptions.headers, 'Authorization': `Bearer ${newToken}` };
                const retryResponse = await fetch(requestOptions.url, {
                  ...requestOptions,
                  headers: newHeaders,
                  _isRetry: true
                } as any);
                return this.handleResponse<T>(retryResponse);
              }
            }
          } catch (e) {
            console.error('Refresh token attempt failed', e);
          } finally {
            this.isRefreshing = false;
          }
        }
        // If we get here, refresh failed or was not possible
        localStorage.removeItem('authToken');
      }

      const error = new Error(data?.message || 'An error occurred');
      (error as any).statusCode = response.status;
      throw error;
    }

    return data;
  }
}

export const apiClient = new ApiClient();
