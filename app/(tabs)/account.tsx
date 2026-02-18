import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Design } from '@/constants/design';
import { supabase } from '@/lib/supabase';

export default function AccountScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserPhone(user?.phone ?? null);
    
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    }
  };


  useEffect(() => {
    loadUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      alert(error.message);
    }
  };

  const signUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email to confirm your account.');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View style={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 40 }}>
          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 26,
              fontFamily: Design.typography.fontBold,
              marginBottom: 8,
            }}>
            Account
          </Text>
          <Text style={{ color: Design.colors.muted, fontSize: 14, marginBottom: 16 }}>
            Sign in to save plans, runs, and Calorie AI logs.
          </Text>

          <View
            style={{
              borderColor: Design.colors.line,
              borderRadius: Design.radius.lg,
              borderWidth: 1,
              padding: Design.spacing.lg,
              backgroundColor: Design.colors.surface,
              marginBottom: 16,
              ...Design.shadow.soft,
            }}>
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 14,
                fontFamily: Design.typography.fontSemiBold,
                marginBottom: 8,
              }}>
              {userPhone ? 'Profile' : 'Sign In'}
            </Text>
            {userPhone ? (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: Design.colors.ink, fontSize: 16, fontFamily: Design.typography.fontBold }}>
                    {profile?.display_name || 'User'}
                  </Text>
                  <Text style={{ color: Design.colors.muted, fontSize: 14 }}>
                    {userPhone}
                  </Text>
                  {profile && (
                    <Text style={{ color: Design.colors.muted, fontSize: 14, marginTop: 4 }}>
                      {profile.age} years old • {profile.gender}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={signOut}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: Design.colors.ink,
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                    Sign Out
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    borderColor: Design.colors.line,
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 10,
                    backgroundColor: Design.colors.surface,
                    fontFamily: Design.typography.fontMedium,
                  }}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry
                  style={{
                    borderColor: Design.colors.line,
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 12,
                    backgroundColor: Design.colors.surface,
                    fontFamily: Design.typography.fontMedium,
                  }}
                />
                <View style={{ flexDirection: 'row' }}>
                  <Pressable
                    onPress={signIn}
                    disabled={loading}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: Design.colors.ink,
                      alignItems: 'center',
                      marginRight: 10,
                    }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                      {loading ? 'Loading...' : 'Sign In'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={signUp}
                    disabled={loading}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: Design.colors.accentSoft,
                      alignItems: 'center',
                    }}>
                    <Text style={{ color: Design.colors.ink, fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                      Sign Up
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
