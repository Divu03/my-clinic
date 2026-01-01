import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import CustomSplashScreen from "../src/components/CustomSplashScreen";
import { AuthProvider } from "../src/context/AuthContext";
import { FilterProvider } from "../src/context/FilterContext";
import { QueueProvider } from "../src/context/QueueContext";

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any resources here (fonts, initial data, etc.)
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Show custom splash while loading
  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  return (
    <AuthProvider>
      <FilterProvider>
        <QueueProvider>
          <View style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="(public)" />
              <Stack.Screen name="(private)" />
              <Stack.Screen
                name="clinic-details/[id]"
                options={{
                  presentation: "card",
                }}
              />
            </Stack>
          </View>
        </QueueProvider>
      </FilterProvider>
    </AuthProvider>
  );
}
