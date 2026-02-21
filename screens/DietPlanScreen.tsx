import { Design } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEALS = [
  {
    id: 'breakfast',
    title: 'Breakfast',
    time: '7:00 – 9:00 AM',
    calories: 450,
    protein: 22,
    carbs: 52,
    fats: 16,
    examples: 'Oats, eggs, fruit, milk',
    color: '#FFE2D6',
    barColor: Design.colors.accent,
  },
  {
    id: 'lunch',
    title: 'Lunch',
    time: '12:00 – 2:00 PM',
    calories: 600,
    protein: 35,
    carbs: 65,
    fats: 18,
    examples: 'Rice, dal, veggies, chicken/fish',
    color: '#E0F7F4',
    barColor: Design.colors.success,
  },
  {
    id: 'dinner',
    title: 'Dinner',
    time: '7:00 – 9:00 PM',
    calories: 550,
    protein: 30,
    carbs: 58,
    fats: 20,
    examples: 'Roti, sabzi, salad, lean protein',
    color: '#FFF3D6',
    barColor: '#F59E0B',
  },
];

const TOTAL_CAL = MEALS.reduce((s, m) => s + m.calories, 0);
const TOTAL_PROTEIN = MEALS.reduce((s, m) => s + m.protein, 0);
const TOTAL_CARBS = MEALS.reduce((s, m) => s + m.carbs, 0);
const TOTAL_FATS = MEALS.reduce((s, m) => s + m.fats, 0);

export function DietPlanScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Design.colors.background }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Design.spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Design.colors.line, backgroundColor: Design.colors.surface }}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={Design.colors.ink} />
        </Pressable>
        <Text style={{ color: Design.colors.ink, fontSize: 18, fontFamily: Design.typography.fontSemiBold }}>
          Diet Plan
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: Design.spacing.lg, paddingBottom: Design.spacing.xl }}
        showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: Design.spacing.lg, marginBottom: Design.spacing.md }}>
          <Text style={{ color: Design.colors.ink, fontSize: 20, fontFamily: Design.typography.fontBold, marginBottom: 8 }}>
            What is a Diet Plan?
          </Text>
          <Text style={{ color: Design.colors.muted, fontSize: 14, lineHeight: 22, fontFamily: Design.typography.fontMedium }}>
            A diet plan is a structured guide for what and when you eat through the day. It helps you hit your calorie and nutrition goals by splitting intake across Breakfast, Lunch, and Dinner so you stay energized and support your fitness goals.
          </Text>
        </View>

        {/* Simple calorie split diagram */}
        <View style={{ marginBottom: Design.spacing.xl }}>
          <Text style={{ color: Design.colors.ink, fontSize: 16, fontFamily: Design.typography.fontSemiBold, marginBottom: 12 }}>
            Daily calorie split
          </Text>
          <View
            style={{
              flexDirection: 'row',
              height: 24,
              borderRadius: Design.radius.sm,
              overflow: 'hidden',
              backgroundColor: Design.colors.line,
            }}>
            {MEALS.map((m, i) => (
              <View
                key={m.id}
                style={{
                  flex: m.calories / TOTAL_CAL,
                  backgroundColor: m.barColor,
                }}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            {MEALS.map((m) => (
              <Text key={m.id} style={{ color: Design.colors.muted, fontSize: 11 }}>
                {m.title} {Math.round((m.calories / TOTAL_CAL) * 100)}%
              </Text>
            ))}
          </View>
        </View>

        {/* Total intake summary */}
        <View
          style={{
            backgroundColor: Design.colors.surface,
            borderRadius: Design.radius.md,
            borderWidth: 1,
            borderColor: Design.colors.line,
            padding: Design.spacing.md,
            marginBottom: Design.spacing.xl,
          }}>
          <Text style={{ color: Design.colors.ink, fontSize: 14, fontFamily: Design.typography.fontSemiBold, marginBottom: 10 }}>
            Total daily intake (example)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: Design.radius.pill, backgroundColor: Design.colors.accentSoft }}>
              <Text style={{ color: Design.colors.ink, fontSize: 12 }}>{TOTAL_CAL} kcal</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: Design.radius.pill, backgroundColor: '#E0F7F4' }}>
              <Text style={{ color: Design.colors.ink, fontSize: 12 }}>P {TOTAL_PROTEIN}g</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: Design.radius.pill, backgroundColor: '#FFF3D6' }}>
              <Text style={{ color: Design.colors.ink, fontSize: 12 }}>C {TOTAL_CARBS}g</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: Design.radius.pill, backgroundColor: '#FDE4EB' }}>
              <Text style={{ color: Design.colors.ink, fontSize: 12 }}>F {TOTAL_FATS}g</Text>
            </View>
          </View>
        </View>

        {/* Breakfast, Lunch, Dinner cards */}
        {MEALS.map((meal) => (
          <View
            key={meal.id}
            style={{
              backgroundColor: Design.colors.surface,
              borderRadius: Design.radius.md,
              borderWidth: 1,
              borderColor: Design.colors.line,
              padding: Design.spacing.md,
              marginBottom: Design.spacing.md,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 4, height: 24, borderRadius: 2, backgroundColor: meal.barColor, marginRight: 10 }} />
              <Text style={{ color: Design.colors.ink, fontSize: 16, fontFamily: Design.typography.fontSemiBold }}>
                {meal.title}
              </Text>
              <Text style={{ color: Design.colors.muted, fontSize: 12, marginLeft: 'auto' }}>{meal.time}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: Design.radius.pill, backgroundColor: meal.color }}>
                <Text style={{ color: Design.colors.ink, fontSize: 12 }}>{meal.calories} kcal</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: Design.radius.pill, backgroundColor: '#E0F7F4' }}>
                <Text style={{ color: Design.colors.ink, fontSize: 12 }}>P {meal.protein}g</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: Design.radius.pill, backgroundColor: '#FFF3D6' }}>
                <Text style={{ color: Design.colors.ink, fontSize: 12 }}>C {meal.carbs}g</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: Design.radius.pill, backgroundColor: '#FDE4EB' }}>
                <Text style={{ color: Design.colors.ink, fontSize: 12 }}>F {meal.fats}g</Text>
              </View>
            </View>
            <Text style={{ color: Design.colors.muted, fontSize: 12 }}>{meal.examples}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
