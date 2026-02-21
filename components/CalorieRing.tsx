import React from 'react';
import { Text, View } from 'react-native';

import { Design } from '@/constants/design';

type Props = {
  consumed: number;
  goal: number;
};

export default function CalorieRing({ consumed, goal }: Props) {
  const progress = Math.min(1, goal ? consumed / goal : 0);
  const ringColor = consumed > goal ? '#EF4444' : Design.colors.accent;

  return (
    <View
      style={{
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 12,
        borderColor: Design.colors.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: 80,
          borderWidth: 12,
          borderColor: ringColor,
          opacity: 0.4 + progress * 0.6,
        }}
      />
      <Text style={{ color: Design.colors.ink, fontSize: 20, fontFamily: Design.typography.fontBold }}>
        {Math.round(consumed)}
      </Text>
      <Text style={{ color: Design.colors.muted, fontSize: 12 }}>of {Math.round(goal)} kcal</Text>
    </View>
  );
}
