import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Design } from '@/constants/design';

type SnackItem = {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string;
  tag: string;
};

const SNACKS: SnackItem[] = [
  {
    id: '1',
    name: 'Lays Classic Salted',
    brand: 'PepsiCo',
    calories: 160,
    protein: 2,
    carbs: 15,
    fats: 10,
    serving: '1 oz (28g)',
    tag: 'Snack - Chips',
  },
  {
    id: '2',
    name: 'Cadbury Dairy Milk Chocolate',
    brand: 'Cadbury',
    calories: 235,
    protein: 3,
    carbs: 26,
    fats: 13,
    serving: '1 bar (45g)',
    tag: 'Sweet - Chocolate',
  },
  {
    id: '3',
    name: "Kellogg's Corn Flakes",
    brand: "Kellogg's",
    calories: 100,
    protein: 2,
    carbs: 22,
    fats: 0,
    serving: '1 cup (30g)',
    tag: 'Breakfast - Cereal',
  },
  {
    id: '4',
    name: 'Maggi 2-Minute Noodles',
    brand: 'Nestle',
    calories: 290,
    protein: 8,
    carbs: 42,
    fats: 11,
    serving: '1 pack (70g)',
    tag: 'Quick meal - Instant',
  },
  {
    id: '5',
    name: 'Amul Butter',
    brand: 'Amul',
    calories: 72,
    protein: 0,
    carbs: 0,
    fats: 8,
    serving: '1 tbsp (10g)',
    tag: 'Dairy - Spread',
  },
  {
    id: '6',
    name: 'Coca-Cola',
    brand: 'The Coca-Cola Company',
    calories: 140,
    protein: 0,
    carbs: 39,
    fats: 0,
    serving: '1 can (330ml)',
    tag: 'Beverage - Soft drink',
  },
  {
    id: '7',
    name: 'Parle-G Biscuits',
    brand: 'Parle',
    calories: 67,
    protein: 1,
    carbs: 11,
    fats: 2,
    serving: '2 biscuits (14g)',
    tag: 'Snack - Biscuit',
  },
  {
    id: '8',
    name: 'Britannia Good Day Butter',
    brand: 'Britannia',
    calories: 70,
    protein: 1,
    carbs: 9,
    fats: 4,
    serving: '2 biscuits (16g)',
    tag: 'Snack - Cookie',
  },
];

export default function SnacksScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: Design.colors.background }}
        contentContainerStyle={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 32 }}>
        <Text
          style={{
            color: Design.colors.ink,
            fontSize: 24,
            fontFamily: Design.typography.fontBold,
            marginBottom: 6,
          }}>
          Snacks
        </Text>
        <Text style={{ color: Design.colors.muted, fontSize: 14, marginBottom: 20 }}>
          Quick nutrition snapshots for popular snacks.
        </Text>

        {SNACKS.map((snack) => (
          <View
            key={snack.id}
            style={{
              borderColor: Design.colors.line,
              borderRadius: 20,
              borderWidth: 1,
              padding: 16,
              backgroundColor: Design.colors.surface,
              marginBottom: 16,
              ...Design.shadow.soft as any,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 12,
              }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text
                  style={{
                    color: Design.colors.ink,
                    fontSize: 16,
                    fontFamily: Design.typography.fontSemiBold,
                  }}>
                  {snack.name}
                </Text>
                {snack.brand ? (
                  <Text style={{ color: Design.colors.muted, fontSize: 13, marginTop: 4 }}>
                    {snack.brand}
                  </Text>
                ) : null}
                <Text style={{ color: Design.colors.muted, fontSize: 12, marginTop: 6 }}>
                  {snack.serving}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: Design.colors.lime,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: Design.colors.black,
                    fontSize: 14,
                    fontFamily: Design.typography.fontBold,
                  }}>
                  {snack.calories}
                </Text>
                <Text style={{ color: Design.colors.black, fontSize: 10 }}>kcal</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: Design.colors.accentSoft,
                  borderWidth: 1,
                  borderColor: Design.colors.violet,
                }}>
                <Text style={{ color: Design.colors.violet, fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                  P {snack.protein}g
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: 'rgba(198, 255, 51, 0.18)',
                  borderWidth: 1,
                  borderColor: Design.colors.lime,
                }}>
                <Text style={{ color: Design.colors.lime, fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                  C {snack.carbs}g
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: 'rgba(17, 24, 39, 0.08)',
                  borderWidth: 1,
                  borderColor: Design.colors.line,
                }}>
                <Text style={{ color: Design.colors.ink, fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                  F {snack.fats}g
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
