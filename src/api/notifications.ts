import api from './client';
import type { AppNotification, ApiResponse } from '../types';

export async function getNotifications(page = 1, limit = 30): Promise<AppNotification[]> {
  const { data } = await api.get<ApiResponse<AppNotification[]>>('/notifications', {
    params: { page, limit },
  });
  return data.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}

export async function registerPushToken(
  token: string,
  platform: 'IOS' | 'ANDROID',
  appVersion: string,
): Promise<void> {
  await api.post('/devices', { token, platform, appVersion });
}
