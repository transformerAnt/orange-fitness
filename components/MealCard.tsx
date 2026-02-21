import React from 'react';
import { Text, View } from 'react-native';

import { Design } from '@/constants/design';

type Props = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  other: number;
};

export default function MealCard({ name, calories, protein, carbs, fat, other }: Props) {
  return (
    <View
      style={{
        borderColor: Design.colors.line,
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        marginBottom: 10,
        backgroundColor: Design.colors.background,
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: Design.colors.ink, fontSize: 14, fontFamily: Design.typography.fontSemiBold }}>
          {name}
        </Text>
        <Text style={{ color: Design.colors.muted, fontSize: 12 }}>{Math.round(calories)} kcal</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: Design.colors.muted, fontSize: 12 }}>P {Math.round(protein)}g</Text>
        <Text style={{ color: Design.colors.muted, fontSize: 12 }}>C {Math.round(carbs)}g</Text>
        <Text style={{ color: Design.colors.muted, fontSize: 12 }}>F {Math.round(fat)}g</Text>
        <Text style={{ color: Design.colors.muted, fontSize: 12 }}>O {Math.round(other)} kcal</Text>
      </View>
    </View>
  );
}
