import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useThemeContext } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <ThemeProvider>
        <AppContent fontsLoaded={fontsLoaded} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}


function AppContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isDark, themeLoaded } = useThemeContext();

  useEffect(() => {
    if (fontsLoaded && themeLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, themeLoaded]);


  if (!fontsLoaded || !themeLoaded) {
    return null;
  }


  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="scanner/index"
          options={{
            animation: "slide_from_bottom",
          }}
        />

        <Stack.Screen
          name="scanner/cropscan"
          options={{
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="scanner/preview"
          options={{
            animation: "fade",
          }}
        />

        <Stack.Screen
          name="scanner/review"
          options={{
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}
