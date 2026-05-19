import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './client';
import type { LoginDto, RegisterDto, User, ApiResponse } from '../types';

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Login uses the dedicated mobile endpoint that returns both tokens as JSON
// (the web login sets httpOnly cookies which React Native can't use)
export async function login(dto: LoginDto): Promise<AuthResult> {
  const { data } = await axios.post<ApiResponse<AuthResult>>(
    `${API_BASE_URL}/auth/login`,
    dto,
  );
  const result = data.data;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, result.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.refreshToken);
  return result;
}

export async function register(dto: RegisterDto): Promise<User> {
  const { data } = await axios.post<ApiResponse<User>>(
    `${API_BASE_URL}/auth/register`,
    dto,
  );
  return data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, password });
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
