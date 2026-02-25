import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
  useFonts
} from '@expo-google-fonts/inter';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useEffect } from 'react';
import { setSupabaseAccessToken } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const devBypassAuth = process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <RootNavigation devBypassAuth={devBypassAuth} />
          <StatusBar style="dark" />
        </ClerkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigation({ devBypassAuth }: { devBypassAuth: boolean }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded && !devBypassAuth) return;
    const inAuthGroup = segments[0] === '(auth)';
    const signedIn = devBypassAuth ? true : isSignedIn;

    if (!signedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (signedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, segments, router, devBypassAuth]);

  useEffect(() => {
    let active = true;
    const syncToken = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        if (active) setSupabaseAccessToken(null);
        return;
      }
      const token = await getToken();
      if (active) setSupabaseAccessToken(token ?? null);
    };
    syncToken();
    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn, getToken]);
  if (!isLoaded && !devBypassAuth) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
