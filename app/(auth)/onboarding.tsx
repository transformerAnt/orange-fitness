import { Design } from '@/constants/design';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const completeOnboarding = async () => {
    setErrorMsg(null);

    if (!name || !age || !gender) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found.');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: name.trim(),
          age: parseInt(age),
          gender,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
        style={{ flex: 1, backgroundColor: Design.colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>Help us personalize your fitness journey</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor={Design.colors.muted}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholder="25"
            placeholderTextColor={Design.colors.muted}
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
            style={styles.input}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {GENDERS.map((g) => (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                style={[
                  styles.genderOption,
                  gender === g && styles.genderOptionSelected
                ]}
              >
                <Text style={[
                  styles.genderText,
                  gender === g && styles.genderTextSelected
                ]}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>

          {errorMsg && (
            <Text style={styles.errorText}>{errorMsg}</Text>
          )}

          <Pressable 
            onPress={completeOnboarding} 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Profile</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: Design.typography.fontBold,
    color: Design.colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Design.typography.fontRegular,
    color: Design.colors.muted,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontFamily: Design.typography.fontSemiBold,
    color: Design.colors.ink,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Design.colors.surface,
    borderWidth: 1,
    borderColor: Design.colors.line,
    borderRadius: Design.radius.md,
    padding: 16,
    fontSize: 16,
    fontFamily: Design.typography.fontRegular,
    color: Design.colors.ink,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Design.radius.pill,
    borderWidth: 1,
    borderColor: Design.colors.line,
    backgroundColor: Design.colors.surface,
  },
  genderOptionSelected: {
    backgroundColor: Design.colors.ink,
    borderColor: Design.colors.ink,
  },
  genderText: {
    fontSize: 14,
    fontFamily: Design.typography.fontMedium,
    color: Design.colors.ink,
  },
  genderTextSelected: {
    color: '#fff',
  },
  errorText: {
    color: 'red',
    marginTop: 16,
    fontFamily: Design.typography.fontRegular,
  },
  button: {
    backgroundColor: Design.colors.ink,
    padding: 18,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    marginTop: 32,
    ...Design.shadow.soft as any,
  },
  buttonText: {
    color: '#fff',
    fontFamily: Design.typography.fontSemiBold,
    fontSize: 16,
  },
});
