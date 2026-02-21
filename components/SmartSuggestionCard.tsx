import React from 'react';
import { Text, View } from 'react-native';

import { Design } from '@/constants/design';

type Props = {
  remainingCalories: number;
  proteinDeficit: number;
};

export default function SmartSuggestionCard({ remainingCalories, proteinDeficit }: Props) {
  const suggestion =
    remainingCalories > 250
      ? proteinDeficit > 20
        ? 'You have calories left and are low on protein. Try Greek yogurt + almonds.'
        : 'You have room left. A balanced snack like hummus + veggies works well.'
      : 'Great job staying close to your goal today.';

  return (
    <View
      style={{
        borderColor: Design.colors.line,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        backgroundColor: Design.colors.surface,
      }}>
      <Text style={{ color: Design.colors.ink, fontSize: 14, fontFamily: Design.typography.fontSemiBold }}>
        Smart Suggestion
      </Text>
      <Text style={{ color: Design.colors.muted, fontSize: 12, marginTop: 6 }}>{suggestion}</Text>
    </View>
  );
}
