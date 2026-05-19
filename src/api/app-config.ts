import api from './client';

export async function getAppConfig(): Promise<Record<string, any>> {
  const { data } = await api.get('/app-config');
  return data.data;
}
