import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import CustomSplashScreen from '../src/components/CustomSplashScreen';

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load APIs or fonts here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a 2-second load
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync(); // Hide the native splash
      }
    }

    prepare();
  }, []);

  // If app is not ready, show our custom "My Clinic" text screen
  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(public)" />
      <Stack.Screen name="(private)" />
    </Stack>
  );
}