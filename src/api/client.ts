import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import storage from '../utils/storage';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export const REFRESH_TOKEN_KEY = 'vw_refresh_token';
export const ACCESS_TOKEN_KEY  = 'vw_access_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach bearer token from secure store on every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = await storage.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${API_BASE_URL}/auth/refresh-mobile`,
          { refreshToken },
        );

        const newToken = data.data.accessToken;
        await storage.setItemAsync(ACCESS_TOKEN_KEY, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;

        return api(original);
      } catch {
        // Wipe tokens — RootNavigator re-checks authStore and redirects to login
        await storage.deleteItemAsync(ACCESS_TOKEN_KEY);
        await storage.deleteItemAsync(REFRESH_TOKEN_KEY);

        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
