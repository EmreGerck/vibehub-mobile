import { Stack } from 'expo-router';

export default function ShopStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#7C3AED',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ title: 'My Cart', headerShown: true }} />
    </Stack>
  );
}
