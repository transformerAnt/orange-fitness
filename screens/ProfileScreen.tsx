import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Design } from '@/constants/design';

export default function ProfileScreen() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View style={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 40 }}>
          <Text style={{ color: Design.colors.ink, fontSize: 26, fontFamily: Design.typography.fontBold }}>
            Profile
          </Text>
          <Text style={{ color: Design.colors.muted, fontSize: 14, marginTop: 6 }}>
            Manage goals, preferences, and connected devices.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
