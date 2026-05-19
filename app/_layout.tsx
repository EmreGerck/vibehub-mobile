import '../global.css';
import { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import SplashOverlay from '@/components/SplashOverlay';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const MIN_SPLASH_MS = 1500;

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const [minElapsed, setMinElapsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    hydrate();
    registerForPushNotificationsAsync();
    timerRef.current = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showSplash = isAuthLoading || !minElapsed;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={showSplash ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} />
          <SplashOverlay visible={showSplash} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
