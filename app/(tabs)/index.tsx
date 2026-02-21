import { Design } from '@/constants/design'
import { SignedIn, SignedOut, useSSO, useUser } from '@clerk/clerk-expo'
import * as AuthSession from 'expo-auth-session'
import { Link, router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useCallback, useEffect } from 'react'
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const CELEB_WORKOUTS = [
  {
    id: 'nba-power',
    title: 'NBA Power',
    subtitle: 'Explosive athleticism + vertical drive',
    tag: 'Basketball',
    tint: 'rgba(255, 107, 61, 0.14)',
  },
  {
    id: 'gridiron-strength',
    title: 'Gridiron Strength',
    subtitle: 'Football speed & contact readiness',
    tag: 'Football',
    tint: 'rgba(34, 197, 94, 0.14)',
  },
  {
    id: 'court-speed',
    title: 'Court Speed',
    subtitle: 'Tennis agility & reaction work',
    tag: 'Tennis',
    tint: 'rgba(79, 70, 229, 0.12)',
  },
  {
    id: 'olympian-engine',
    title: 'Olympian Engine',
    subtitle: 'Stamina, form, and full-body output',
    tag: 'Olympics',
    tint: 'rgba(245, 158, 11, 0.14)',
  },
  {
    id: 'aesthetic-stoic',
    title: 'Aesthetic Stoic',
    subtitle: 'Lean sculpt + mobility discipline',
    tag: 'Stoic',
    tint: 'rgba(148, 163, 184, 0.22)',
  },
]

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

export default (props:any) => {
  useWarmUpBrowser()
  const { user } = useUser()
  const { startSSOFlow } = useSSO()

  const onGooglePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'fitnessapp' }),
      })

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId })
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }, [startSSOFlow])

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ''
  const beforeAt = email.split('@')[0] || ''
  const greetingName = beforeAt || 'there'

  return (
    <>
      <SignedOut>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome!</Text>
          <Link href="/sign-in">
            <Text style={styles.link}>Sign in</Text>
          </Link>
          <Link href="/sign-up">
            <Text style={styles.link}>Sign up</Text>
          </Link>
          <View style={styles.oneTapContainer}>
            <Pressable
              style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
              onPress={onGooglePress}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>
          </View>
        </View>
      </SignedOut>

      <SignedIn>
        <SafeAreaProvider 
          style={{
            flex: 1,
            backgroundColor: Design.colors.background,
          }}>
          <ScrollView  
            style={{
              flex: 1,
              backgroundColor: Design.colors.background,
              borderRadius: 40,
            }}>
            <View 
              style={{
                backgroundColor: Design.colors.background,
                paddingTop: 12,
              }}>
					<View 
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 35,
							marginLeft: 26,
							marginRight: 14,
						}}>
						<Text 
							style={{
								color: Design.colors.ink,
								fontSize: 15,
								fontFamily: Design.typography.fontSemiBold,
							}}>
							{"9:41"}
						</Text>
						<Image
							source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/qf48wcn1_expires_30_days.png"}} 
							resizeMode = {"stretch"}
							style={{
								width: 66,
								height: 11,
							}}
						/>
					</View>
					<View 
						style={{
							alignSelf: "flex-start",
							marginBottom: 36,
							marginLeft: 16,
						}}>
						<Text 
							style={{
								color: Design.colors.muted,
								fontSize: 12,
								fontFamily: Design.typography.fontMedium,
								marginBottom: 10,
								marginRight: 64,
							}}>
							{"EVERYDAY WE'RE MUSCLE'N"}
						</Text>
						<View 
							style={{
								alignSelf: "flex-start",
								flexDirection: "row",
								alignItems: "center",
							}}>
							<Text 
							style={{
								color: Design.colors.ink,
								fontSize: 26,
								fontFamily: Design.typography.fontBold,
								marginRight: 12,
							}}>
								{`Hello, ${greetingName}`}
							</Text>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/86ngt23u_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 24,
									height: 24,
								}}
							/>
						</View>
					</View>
					<View 
						style={{
							marginBottom: 36,
							marginHorizontal: 15,
						}}>
						<View 
							style={{
								marginBottom: 42,
							}}>
							<Text 
							style={{
								color: Design.colors.ink,
								fontSize: 20,
								fontFamily: Design.typography.fontSemiBold,
								marginBottom: 16,
							}}>
								{"My Plan"}
							</Text>
							<View 
								style={{
									flexDirection: "row",
									alignItems: "center",
									marginBottom: 16,
								}}>
								<TouchableOpacity 
									onPress={() => router.push("/workouts")}
									style={{
										flex: 1,
										backgroundColor: Design.colors.accentSoft,
										borderRadius: 16,
										paddingVertical: 12,
										paddingLeft: 12,
										marginRight: 16,
									}}>
									<Image
										source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/0qvrwlux_expires_30_days.png"}} 
										resizeMode = {"stretch"}
										style={{
											width: 40,
											height: 40,
											marginBottom: 13,
										}}
									/>
									<View 
										style={{
											alignSelf: "flex-start",
										}}>
										<Text 
											style={{
												color: Design.colors.ink,
												fontSize: 18,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 2,
											}}>
											{"Workout"}
										</Text>
										<Text 
											style={{
												color: Design.colors.muted,
												fontSize: 14,
												fontFamily: Design.typography.fontMedium,
												marginRight: 28,
											}}>
											{"2 hours"}
										</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => Alert.alert('Coming soon', 'Snacks section is under development.')}
									style={{
										borderColor: Design.colors.line,
										borderRadius: 16,
										borderWidth: 1,
										paddingVertical: 12,
										paddingLeft: 12,
										paddingRight: 30,
										backgroundColor: Design.colors.surface,
									}}>
									<Image
										source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/fo6dqfz4_expires_30_days.png"}} 
										resizeMode = {"stretch"}
										style={{
											width: 40,
											height: 40,
											marginBottom: 13,
										}}
									/>
									<View 
										style={{
											alignSelf: "flex-start",
										}}>
										<Text 
											style={{
												color: Design.colors.ink,
												fontSize: 18,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 2,
											}}>
											{"Snacks"}
										</Text>
										<Text 
											style={{
												color: Design.colors.muted,
												fontSize: 14,
												fontFamily: Design.typography.fontMedium,
												marginRight: 30,
											}}>
											{"2 hours"}
										</Text>
									</View>
								</TouchableOpacity>
							</View>
							<View 
								style={{
									flexDirection: "row",
									alignItems: "center",
								}}>
								<TouchableOpacity
									onPress={() => router.push('/diet-plan')}
									style={{
										flex: 1,
										flexDirection: "row",
										justifyContent: "space-between",
										alignItems: "center",
										borderColor: Design.colors.line,
										borderRadius: 16,
										borderWidth: 1,
										paddingVertical: 16,
										paddingHorizontal: 12,
										marginRight: 16,
										backgroundColor: Design.colors.surface,
									}}>
									<View >
										<Text 
											style={{
												color: Design.colors.ink,
												fontSize: 18,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 2,
											}}>
											{"Food"}
										</Text>
										<Text 
											style={{
												color: Design.colors.muted,
												fontSize: 14,
												fontFamily: Design.typography.fontMedium,
											}}>
											{"2 hours"}
										</Text>
									</View>
									<Image
										source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/4c1kElRr0g/qfyv6j71_expires_30_days.png"}} 
										resizeMode = {"stretch"}
										style={{
											width: 40,
											height: 40,
										}}
									/>
								</TouchableOpacity>
								<TouchableOpacity 
									style={{
										flex: 1,
										alignItems: "center",
										backgroundColor: Design.colors.ink,
										borderRadius: 16,
										paddingVertical: 21,
									}} onPress={() => router.push("/workouts")}>
									<View >
										<Text 
											style={{
												color: "#FFFFFF",
												fontSize: 18,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 4,
											}}>
											{"Let's Go"}
										</Text>
										<View 
											style={{
												width: 61,
												height: 4,
												backgroundColor: Design.colors.accent,
												borderRadius: 10,
											}}>
										</View>
									</View>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					<View
						style={{
							marginTop: 28,
							marginHorizontal: 15,
						}}>
						<Text
							style={{
								color: Design.colors.ink,
								fontSize: 20,
								fontFamily: Design.typography.fontSemiBold,
								marginBottom: 6,
							}}>
							{"Signature Programs"}
						</Text>
						<Text
							style={{
								color: Design.colors.muted,
								fontSize: 12,
								fontFamily: Design.typography.fontMedium,
								marginBottom: 14,
							}}>
							{"Light, athlete-inspired weekly plans"}
						</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<View style={{ flexDirection: "row", gap: 14, paddingRight: 18 }}>
								{CELEB_WORKOUTS.map((item) => (
									<Pressable
										key={item.id}
										onPress={() => router.push(`/celebrity/${item.id}`)}
										style={({ pressed }) => [
											{
												width: 190,
												borderRadius: 18,
												backgroundColor: item.tint,
												padding: 16,
												borderWidth: 1,
												borderStyle: "dotted",
												borderColor: "rgba(16, 18, 20, 0.18)",
											},
											pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
										]}>
										<Text
											style={{
												color: Design.colors.ink,
												fontSize: 16,
												fontFamily: Design.typography.fontSemiBold,
												marginBottom: 6,
											}}>
											{item.title}
										</Text>
										<Text
											style={{
												color: Design.colors.muted,
												fontSize: 12,
												fontFamily: Design.typography.fontMedium,
												marginBottom: 12,
											}}>
											{item.subtitle}
										</Text>
										<View
											style={{
												alignSelf: "flex-start",
												backgroundColor: "rgba(255,255,255,0.7)",
												paddingHorizontal: 10,
												paddingVertical: 4,
												borderRadius: 999,
												borderWidth: 1,
												borderColor: "rgba(16, 18, 20, 0.08)",
											}}>
											<Text
												style={{
													color: Design.colors.ink,
													fontSize: 11,
													fontFamily: Design.typography.fontSemiBold,
												}}>
												{item.tag}
											</Text>
										</View>
									</Pressable>
								))}
							</View>
						</ScrollView>
					</View>
              </View>
            </ScrollView>
        </SafeAreaProvider>
      </SignedIn>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Design.colors.ink,
  },
  link: {
    color: Design.colors.ink,
    fontSize: 16,
  },
  oneTapContainer: {
    gap: 8,
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



