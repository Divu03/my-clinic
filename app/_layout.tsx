import { QueueProvider } from "@/src/context/QueueContext";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import CustomSplashScreen from "../src/components/CustomSplashScreen";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { FilterProvider } from "../src/context/FilterContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const hasInitializedRef = React.useRef(false);
  const initialAuthCheckDoneRef = React.useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (isLoading) {
      initialAuthCheckDoneRef.current = false;
      return;
    }
    if (!initialAuthCheckDoneRef.current) {
      initialAuthCheckDoneRef.current = true;
    }

    if (user) {
      const inAuthGroup = segments[0] === "(public)";
      if (inAuthGroup) {
        router.replace("/(private)");
      }
    } else {
      const inAuthGroup = segments[0] === "(public)";
      if (!inAuthGroup) {
        router.replace("/(public)/login");
      }
    }

    hasInitializedRef.current = true;

    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, user, segments, router]);

  useEffect(() => {
    if (!hasInitializedRef.current || !isNavigationReady) return;

    const inAuthGroup = segments[0] === "(public)";

    if (user && inAuthGroup) {
      router.replace("/(private)");
    } else if (!user && !inAuthGroup) {
      router.replace("/(public)/login");
    }
  }, [user, segments, router, isNavigationReady]);

  const isInitialLoading = isLoading && !initialAuthCheckDoneRef.current;
  if (isInitialLoading || !isNavigationReady) {
    return <CustomSplashScreen />;
  }

  return (
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
          <Toaster position="top-center" richColors />
        </View>
      </QueueProvider>
    </FilterProvider>
  );
}

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

  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
