import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';
import { login, register, logout } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import type { LoginDto, RegisterDto } from '../types';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (dto: RegisterDto) => register(dto),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => clearAuth(),
  });
}
