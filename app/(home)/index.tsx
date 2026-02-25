import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { SignedIn, SignedOut, useSSO, useUser } from '@clerk/clerk-expo'
import * as AuthSession from 'expo-auth-session'
import { Link, router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useCallback, useEffect } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'

const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  useWarmUpBrowser()
  const { user } = useUser()
  const { startSSOFlow } = useSSO()

  const onGooglePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'luminia' }),
      })

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId })
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }, [startSSOFlow])

  return (
    <>
      <SignedIn>
        <ThemedView style={styles.container}>
          <ThemedText type="title">Profile</ThemedText>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Name</ThemedText>
            <ThemedText style={styles.detailValue}>
              {user?.fullName ||
                user?.firstName ||
                user?.username ||
                user?.primaryEmailAddress?.emailAddress ||
                'Not set'}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Age</ThemedText>
            <ThemedText style={styles.detailValue}>
              {String((user?.unsafeMetadata as any)?.age ?? 'Not set')}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Weight</ThemedText>
            <ThemedText style={styles.detailValue}>
              {String((user?.unsafeMetadata as any)?.weight ?? 'Not set')}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Height</ThemedText>
            <ThemedText style={styles.detailValue}>
              {String((user?.unsafeMetadata as any)?.height ?? 'Not set')}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Gender</ThemedText>
            <ThemedText style={styles.detailValue}>
              {String((user?.unsafeMetadata as any)?.gender ?? 'Not set')}
            </ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
            onPress={() => router.replace('/(tabs)')}
          >
            <ThemedText style={styles.googleButtonText}>Continue</ThemedText>
          </Pressable>
        </ThemedView>
      </SignedIn>

      <SignedOut>
        <ThemedView style={styles.container}>
          <ThemedText type="title">Welcome!</ThemedText>
          <Link href="/(auth)/sign-in">
            <ThemedText>Sign in</ThemedText>
          </Link>
          <Link href="/(auth)/sign-up">
            <ThemedText>Sign up</ThemedText>
          </Link>
          <View style={styles.oneTapContainer}>
            <Pressable
              style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
              onPress={onGooglePress}
            >
              <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </SignedOut>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  detailRow: {
    gap: 6,
  },
  detailLabel: {
    fontWeight: '600',
  },
  detailValue: {
    opacity: 0.8,
  },
  oneTapContainer: {
    gap: 8,
  },
  continueButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  googleButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
})
