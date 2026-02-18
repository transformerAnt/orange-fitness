import { Design } from '@/constants/design';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); // Take only the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Attempt verification if all digits are entered
    if (newOtp.every(digit => digit !== '') && index === OTP_LENGTH - 1) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data: { session }, error } = await supabase.auth.verifyOtp({
        phone: phone!,
        token: code,
        type: 'sms',
      });

      if (error) throw error;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, age, gender')
          .eq('id', session.user.id)
          .single();

        if (profile?.display_name && profile?.age && profile?.gender) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/onboarding');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0 || resending) return;

    try {
      setResending(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithOtp({ phone: phone! });
      if (error) throw error;
      setTimer(RESEND_COOLDOWN);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={{ marginBottom: 32 }}>
        <Text style={styles.title}>Verify Number</Text>
        <Text style={styles.subtitle}>
          Enter the {OTP_LENGTH}-digit code sent to <Text style={styles.phoneText}>{phone}</Text>
        </Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              digit !== '' && { borderColor: Design.colors.ink }
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            editable={!loading}
          />
        ))}
      </View>

      {errorMsg && (
        <Text style={styles.errorText}>{errorMsg}</Text>
      )}

      <Pressable 
        onPress={() => verifyOtp(otp.join(''))} 
        style={[styles.verifyButton, (loading || otp.join('').length < OTP_LENGTH) && { opacity: 0.7 }]} 
        disabled={loading || otp.join('').length < OTP_LENGTH}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyButtonText}>Verify & Continue</Text>
        )}
      </Pressable>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive a code?</Text>
        <Pressable 
          onPress={resendOtp} 
          disabled={timer > 0 || resending}
        >
          {resending ? (
             <ActivityIndicator size="small" color={Design.colors.accent} />
          ) : (
            <Text style={[
              styles.resendLink,
              timer > 0 && { color: Design.colors.muted }
            ]}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </Text>
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={styles.changeNumberButton}
      >
        <Text style={styles.changeNumberText}>Change phone number</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24,
    backgroundColor: Design.colors.background 
  },
  title: { 
    fontSize: 32, 
    fontFamily: Design.typography.fontBold,
    color: Design.colors.ink,
    marginBottom: 12
  },
  subtitle: { 
    fontSize: 16, 
    fontFamily: Design.typography.fontRegular,
    color: Design.colors.muted,
    lineHeight: 24
  },
  phoneText: { 
    color: Design.colors.ink, 
    fontFamily: Design.typography.fontSemiBold 
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: Design.colors.surface,
    borderWidth: 1.5,
    borderColor: Design.colors.line,
    borderRadius: Design.radius.md,
    fontSize: 24,
    fontFamily: Design.typography.fontBold,
    color: Design.colors.ink,
    textAlign: 'center',
  },
  errorText: { 
    color: 'red', 
    marginBottom: 24,
    fontFamily: Design.typography.fontRegular 
  },
  verifyButton: {
    backgroundColor: Design.colors.ink,
    padding: 18,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    ...Design.shadow.soft as any,
  },
  verifyButtonText: { 
    color: '#fff', 
    fontFamily: Design.typography.fontSemiBold,
    fontSize: 16 
  },
  resendContainer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  resendText: {
    color: Design.colors.muted,
    fontFamily: Design.typography.fontRegular,
    fontSize: 15,
  },
  resendLink: {
    color: Design.colors.accent,
    fontFamily: Design.typography.fontSemiBold,
    fontSize: 15,
  },
  changeNumberButton: { 
    marginTop: 24, 
    alignItems: 'center' 
  },
  changeNumberText: { 
    color: Design.colors.muted,
    fontFamily: Design.typography.fontMedium,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
