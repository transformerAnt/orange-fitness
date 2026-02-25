import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack, useSegments } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  const { isSignedIn } = useAuth()
  const segments = useSegments()

  const isOnboarding = segments[1] === 'onboarding'

  if (isSignedIn && !isOnboarding) {
    return <Redirect href={'/'} />
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
