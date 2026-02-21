import React from 'react';
import { Text, View } from 'react-native';

import { Design } from '@/constants/design';

type Props = {
  protein: number;
  carbs: number;
  fat: number;
  other: number;
};

export default function MacroBreakdown({ protein, carbs, fat, other }: Props) {
  const items = [
    { label: 'Protein', value: protein, color: '#4F46E5', unit: 'g' },
    { label: 'Carbs', value: carbs, color: '#22C55E', unit: 'g' },
    { label: 'Fat', value: fat, color: '#F59E0B', unit: 'g' },
    { label: 'Other', value: other, color: '#94A3B8', unit: 'kcal' },
  ];

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
      {items.map((macro) => (
        <View key={macro.label} style={{ alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: macro.color,
              marginBottom: 6,
            }}
          />
          <Text style={{ color: Design.colors.ink, fontSize: 12 }}>{macro.label}</Text>
          <Text style={{ color: Design.colors.muted, fontSize: 11 }}>
            {Math.round(macro.value)} {macro.unit}
          </Text>
        </View>
      ))}
    </View>
  );
}
