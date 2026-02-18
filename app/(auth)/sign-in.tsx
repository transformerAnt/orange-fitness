import { Countries } from '@/constants/countries';
import { Design } from '@/constants/design';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';


export default function SignInScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState(Countries[0]); // Default to US
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sendOtp = async () => {
    setErrorMsg(null);

    const sanitizedPhone = phoneNumber.trim().replace(/[^0-9]/g, '');

    if (!sanitizedPhone) {
      setErrorMsg('Please enter your phone number.');
      return;
    }

    if (sanitizedPhone.length < 7) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    const fullPhone = `${countryCode.code}${sanitizedPhone.replace(/^0+/, '')}`;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) throw error;

      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: fullPhone },
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: Design.colors.background,
      }}
    >
      <View style={{ marginBottom: 32 }}>
        <Text style={{ 
          fontSize: 32, 
          fontFamily: Design.typography.fontBold,
          color: Design.colors.ink,
          marginBottom: 8
        }}>
          Get Started
        </Text>
        <Text style={{ 
          fontSize: 16, 
          fontFamily: Design.typography.fontRegular,
          color: Design.colors.muted 
        }}>
          Enter your phone number to sign in or create an account
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable 
          onPress={() => setIsModalVisible(true)}
          style={styles.countryPicker}
        >
          <Text style={styles.countryFlag}>{countryCode.flag}</Text>
          <Text style={styles.countryCode}>{countryCode.code}</Text>
        </Pressable>

        <TextInput
          placeholder="000 000 0000"
          placeholderTextColor={Design.colors.muted}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={[inputStyle, { flex: 1 }]}
        />
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <Text style={{ color: Design.colors.accent }}>Close</Text>
              </Pressable>
            </View>
            <FlatList
              data={Countries}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.countryItem}
                  onPress={() => {
                    setCountryCode(item);
                    setIsModalVisible(false);
                  }}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.name}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {errorMsg && (
        <Text style={{ color: 'red', marginBottom: 16 }}>{errorMsg}</Text>
      )}

      <Pressable 
        onPress={sendOtp} 
        style={[buttonStyle, loading && { opacity: 0.7 }]} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ 
            color: '#fff', 
            fontFamily: Design.typography.fontSemiBold,
            fontSize: 16 
          }}>
            Continue
          </Text>
        )}
      </Pressable>

      <Text style={{ 
        marginTop: 24, 
        textAlign: 'center',
        color: Design.colors.muted,
        fontSize: 12,
        lineHeight: 18,
        fontFamily: Design.typography.fontRegular
      }}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  backgroundColor: Design.colors.surface,
  borderWidth: 1,
  borderColor: Design.colors.line,
  borderRadius: Design.radius.md,
  padding: 16,
  marginBottom: 16,
  fontSize: 16,
  fontFamily: Design.typography.fontRegular,
  color: Design.colors.ink,
};

const styles = StyleSheet.create({
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Design.colors.surface,
    borderWidth: 1,
    borderColor: Design.colors.line,
    borderRadius: Design.radius.md,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: Design.typography.fontMedium,
    color: Design.colors.ink,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Design.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Design.typography.fontBold,
    color: Design.colors.ink,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Design.colors.line,
  },
  countryItemFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    fontFamily: Design.typography.fontRegular,
    color: Design.colors.ink,
  },
  countryItemCode: {
    fontSize: 16,
    fontFamily: Design.typography.fontMedium,
    color: Design.colors.muted,
  },
});


const buttonStyle = {
  backgroundColor: Design.colors.ink,
  padding: 18,
  borderRadius: Design.radius.md,
  alignItems: 'center' as const,
  ...Design.shadow.soft,
};
