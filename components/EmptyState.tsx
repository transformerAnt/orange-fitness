import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Design } from '@/constants/design';

type Props = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onPress: () => void;
};

export default function EmptyState({ title, subtitle, ctaLabel, onPress }: Props) {
  return (
    <View style={{ alignItems: 'center', padding: 32 }}>
      <View
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: Design.colors.accentSoft,
          marginBottom: 16,
        }}
      />
      <Text style={{ color: Design.colors.ink, fontSize: 18, fontFamily: Design.typography.fontBold }}>
        {title}
      </Text>
      <Text style={{ color: Design.colors.muted, fontSize: 13, textAlign: 'center', marginVertical: 10 }}>
        {subtitle}
      </Text>
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: Design.colors.ink,
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: Design.radius.pill,
        }}>
        <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
          {ctaLabel}
        </Text>
      </Pressable>
    </View>
  );
}
