import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Design } from '@/constants/design';

const MACRO_COLORS = {
  protein: '#4F46E5',
  carbs: '#22C55E',
  fat: '#F59E0B',
  other: '#94A3B8',
};

type DayStats = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  other: number;
};

type Props = {
  days: DayStats[];
  labels: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export default function WeeklyMacroChart({ days, labels, selectedIndex, onSelect }: Props) {
  const maxCalories = Math.max(400, ...days.map((day) => day.calories));
  const heightScale = 120 / maxCalories;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140 }}>
        {days.map((day, index) => {
          const proteinCals = day.protein * 4;
          const carbCals = day.carbs * 4;
          const fatCals = day.fat * 9;
          const otherCals = day.other;
          const total = Math.max(1, day.calories);

          return (
            <Pressable
              key={labels[index]}
              onPress={() => onSelect(index)}
              style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 26,
                  height: total * heightScale,
                  borderRadius: 10,
                  overflow: 'hidden',
                  borderWidth: index === selectedIndex ? 1 : 0,
                  borderColor: Design.colors.ink,
                  justifyContent: 'flex-end',
                  backgroundColor: Design.colors.accentSoft,
                }}>
                <View style={{ height: otherCals * heightScale, backgroundColor: MACRO_COLORS.other }} />
                <View style={{ height: fatCals * heightScale, backgroundColor: MACRO_COLORS.fat }} />
                <View style={{ height: carbCals * heightScale, backgroundColor: MACRO_COLORS.carbs }} />
                <View style={{ height: proteinCals * heightScale, backgroundColor: MACRO_COLORS.protein }} />
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: Design.colors.line, marginTop: 10 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        {labels.map((day, index) => (
          <Text
            key={day}
            style={{
              color: index === selectedIndex ? Design.colors.ink : Design.colors.muted,
              fontSize: 12,
              textAlign: 'center',
              flex: 1,
              fontFamily: Design.typography.fontSemiBold,
            }}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
}
