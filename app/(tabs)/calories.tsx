import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import EmptyState from '@/components/EmptyState';
import { Design } from '@/constants/design';
import { supabase } from '@/lib/supabase';

type MealStats = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  other: number;
};

type DayStats = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  other: number;
  meals: Record<string, MealStats>;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_LABELS = ['Breakfast', 'Lunch', 'Brunch', 'Dinner', 'Snacks'];
const MACRO_COLORS = {
  protein: '#4F46E5',
  carbs: '#22C55E',
  fat: '#F59E0B',
  other: '#94A3B8',
};

const toMondayIndex = (date: Date) => (date.getDay() + 6) % 7;

const emptyMealStats = (): MealStats => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  other: 0,
});

const emptyDayStats = (): DayStats => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  other: 0,
  meals: {
    Breakfast: emptyMealStats(),
    Lunch: emptyMealStats(),
    Brunch: emptyMealStats(),
    Dinner: emptyMealStats(),
    Snacks: emptyMealStats(),
  },
});

export default function CaloriesScreen() {
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [mealType, setMealType] = useState<string>('Breakfast');
  const [goal, setGoal] = useState<string>('Maintain');
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [macroGoals, setMacroGoals] = useState<{ protein: number; carbs: number; fat: number }>({
    protein: 150,
    carbs: 200,
    fat: 70,
  });
  const [weeklyStats, setWeeklyStats] = useState<DayStats[]>(() =>
    WEEK_DAYS.map(() => emptyDayStats())
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() =>
    toMondayIndex(new Date())
  );

  const pickFromCamera = async (type: string) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      router.push({
        pathname: '/meal-review',
        params: { imageUri: uri, mealType: type },
      });
    }
  };

  const loadWeeklyStats = useCallback(async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        setWeeklyStats(WEEK_DAYS.map(() => emptyDayStats()));
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('goal,calorie_goal,protein_goal,carbs_goal,fat_goal')
        .eq('id', user.id)
        .single();

      if (profile) {
        setGoal(profile.goal ?? 'Maintain');
        setCalorieGoal(profile.calorie_goal ?? 2000);
        setMacroGoals({
          protein: profile.protein_goal ?? 150,
          carbs: profile.carbs_goal ?? 200,
          fat: profile.fat_goal ?? 70,
        });
      }

      const now = new Date();
      const mondayIndex = toMondayIndex(now);
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - mondayIndex);

      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      const { data, error } = await supabase
        .from('food_logs')
        .select('created_at,total_calories,protein_g,carbs_g,fat_g,meal_type')
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      if (error || !data) {
        setWeeklyStats(WEEK_DAYS.map(() => emptyDayStats()));
        return;
      }

      const next = WEEK_DAYS.map(() => emptyDayStats());

      data.forEach((log: any) => {
        const createdAt = new Date(log.created_at);
        const dayIndex = toMondayIndex(createdAt);
        if (dayIndex < 0 || dayIndex > 6) return;

        const protein = Number(log.protein_g ?? 0);
        const carbs = Number(log.carbs_g ?? 0);
        const fat = Number(log.fat_g ?? 0);
        const macroCalories = protein * 4 + carbs * 4 + fat * 9;
        const totalCalories = Number(log.total_calories ?? macroCalories);
        const other = Math.max(0, totalCalories - macroCalories);

        const day = next[dayIndex];
        day.calories += totalCalories;
        day.protein += protein;
        day.carbs += carbs;
        day.fat += fat;
        day.other += other;

        const mealRaw = String(log.meal_type ?? '').trim().toLowerCase();
        const mealKey =
          mealRaw === 'breakfast'
            ? 'Breakfast'
            : mealRaw === 'lunch'
              ? 'Lunch'
              : mealRaw === 'brunch'
                ? 'Brunch'
                : mealRaw === 'dinner'
                  ? 'Dinner'
                  : mealRaw === 'snack' || mealRaw === 'snacks'
                    ? 'Snacks'
                    : 'Snacks';

        const meal = day.meals[mealKey] ?? emptyMealStats();
        meal.calories += totalCalories;
        meal.protein += protein;
        meal.carbs += carbs;
        meal.fat += fat;
        meal.other += other;
        day.meals[mealKey] = meal;
      });

      setWeeklyStats(next);
    }, []);

  useEffect(() => {
    loadWeeklyStats();
  }, [loadWeeklyStats]);

  const selectedDay = weeklyStats[selectedDayIndex] ?? emptyDayStats();
  const hasLogs = useMemo(() => weeklyStats.some((day) => day.calories > 0), [weeklyStats]);
  const remainingCalories = Math.max(0, calorieGoal - selectedDay.calories);
  const goalMessage =
    goal === 'Lose'
      ? 'Cut-focused plan: prioritize protein + fiber.'
      : goal === 'Gain'
        ? 'Surplus plan: add clean calories + strength meals.'
        : 'Maintain plan: keep steady intake and macros.';

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View style={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 40 }}>
    
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 26,
                fontFamily: Design.typography.fontBold,
                marginBottom: 6,
              }}>
              Calorie AI
            </Text>
    

          <View style={{ marginBottom: Design.spacing.lg }}>
            <Text
              style={{
                color: Design.colors.ink,
                fontSize: 14,
                fontFamily: Design.typography.fontSemiBold,
                marginBottom: 10,
              }}>
              Meal Type
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MEAL_LABELS.map((label) => {
                const active = mealType === label;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setMealType(label)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active ? Design.colors.ink : Design.colors.line,
                      backgroundColor: active ? Design.colors.ink : Design.colors.surface,
                    }}>
                    <Text
                      style={{
                        color: active ? '#FFFFFF' : Design.colors.ink,
                        fontSize: 12,
                        fontFamily: Design.typography.fontSemiBold,
                      }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ marginBottom: Design.spacing.lg }}>
            <Pressable
              onPress={() => setShowMealPicker((prev) => !prev)}
              style={{
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: Design.colors.ink,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                Add Meal
              </Text>
            </Pressable>

            {showMealPicker ? (
              <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {['Breakfast', 'Lunch', 'Dinner', 'Brunch'].map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setMealType(option);
                      setShowMealPicker(false);
                      pickFromCamera(option);
                    }}
                    style={{
                      width: '48%',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderStyle: 'dotted',
                      borderColor: 'rgba(16, 18, 20, 0.18)',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      padding: 12,
                    }}>
                    <Text style={{ color: Design.colors.ink, fontSize: 13, fontFamily: Design.typography.fontSemiBold }}>
                      {option}
                    </Text>
                    <Text style={{ color: Design.colors.muted, fontSize: 11, marginTop: 4 }}>
                      Tap to scan
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          {!hasLogs ? (
            <EmptyState
              title="Start Tracking Your Health"
              subtitle="No meals logged yet. Scan your first meal to unlock insights."
              ctaLabel="Use Camera"
              onPress={() => pickFromCamera(mealType)}
            />
          ) : (
            <View>
              <Text
                style={{
                  color: Design.colors.ink,
                  fontSize: 20,
                  fontFamily: Design.typography.fontSemiBold,
                  marginBottom: 12,
                }}>
                Weekly Calendar
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 10, paddingRight: 12 }}>
                  {weeklyStats.map((day, index) => {
                    const mealsLogged = ['Breakfast', 'Lunch', 'Dinner'].reduce(
                      (sum, meal) => sum + (day.meals[meal]?.calories > 0 ? 1 : 0),
                      0
                    );
                    const missed = Math.max(0, 3 - mealsLogged);
                    const active = index === selectedDayIndex;
                    return (
                      <Pressable
                        key={WEEK_DAYS[index]}
                        onPress={() => setSelectedDayIndex(index)}
                        style={{
                          width: 92,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: active ? Design.colors.accent : Design.colors.line,
                          backgroundColor: active ? Design.colors.accentSoft : Design.colors.surface,
                          padding: 10,
                        }}>
                        <Text style={{ color: Design.colors.ink, fontSize: 12, fontFamily: Design.typography.fontSemiBold }}>
                          {WEEK_DAYS[index]}
                        </Text>
                        <Text style={{ color: Design.colors.muted, fontSize: 10, marginTop: 4 }}>
                          {Math.round(day.calories)} kcal
                        </Text>
                        <View style={{ flexDirection: 'row', marginTop: 6, gap: 4 }}>
                          {Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <View
                                key={`${WEEK_DAYS[index]}-${i}`}
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: i < mealsLogged ? MACRO_COLORS.protein : Design.colors.line,
                                }}
                              />
                            ))}
                        </View>
                        <Text style={{ color: Design.colors.muted, fontSize: 9, marginTop: 4 }}>
                          Missed {missed}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    flex: 1,
                    borderColor: Design.colors.line,
                    borderRadius: 18,
                    borderWidth: 1,
                    padding: 12,
                    backgroundColor: Design.colors.surface,
                  }}>
                  <Text style={{ color: Design.colors.ink, fontSize: 14, fontFamily: Design.typography.fontSemiBold }}>
                    Macro Tracker
                  </Text>
                  <Text style={{ color: Design.colors.muted, fontSize: 11, marginBottom: 8 }}>
                    {WEEK_DAYS[selectedDayIndex]} breakdown
                  </Text>
                  <View style={{ marginBottom: 10 }}>
                    {[
                      { label: 'Protein', value: selectedDay.protein, color: MACRO_COLORS.protein, unit: 'g' },
                      { label: 'Carbs', value: selectedDay.carbs, color: MACRO_COLORS.carbs, unit: 'g' },
                      { label: 'Fat', value: selectedDay.fat, color: MACRO_COLORS.fat, unit: 'g' },
                      { label: 'Other', value: selectedDay.other, color: MACRO_COLORS.other, unit: 'kcal' },
                    ].map((macro) => (
                      <View key={macro.label} style={{ marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ color: Design.colors.ink, fontSize: 11 }}>{macro.label}</Text>
                          <Text style={{ color: Design.colors.muted, fontSize: 11 }}>
                            {Math.round(macro.value)} {macro.unit}
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 6,
                            borderRadius: 6,
                            backgroundColor: Design.colors.line,
                            overflow: 'hidden',
                          }}>
                          <View
                            style={{
                              height: 6,
                              width: `${Math.min(100, (macro.value / (selectedDay.calories || 1)) * 100)}%`,
                              backgroundColor: macro.color,
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                  <Text style={{ color: Design.colors.muted, fontSize: 11 }}>
                    Total {Math.round(selectedDay.calories)} kcal
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    borderColor: Design.colors.line,
                    borderRadius: 18,
                    borderWidth: 1,
                    padding: 12,
                    backgroundColor: Design.colors.surface,
                  }}>
                  <Text style={{ color: Design.colors.ink, fontSize: 14, fontFamily: Design.typography.fontSemiBold }}>
                    Your Plan
                  </Text>
                  <Text style={{ color: Design.colors.muted, fontSize: 11, marginBottom: 8 }}>{goalMessage}</Text>
                  <Text style={{ color: Design.colors.ink, fontSize: 13, fontFamily: Design.typography.fontSemiBold }}>
                    {Math.round(calorieGoal)} kcal goal
                  </Text>
                  <Text style={{ color: Design.colors.muted, fontSize: 11, marginTop: 6 }}>
                    Remaining {Math.round(remainingCalories)} kcal
                  </Text>
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ color: Design.colors.muted, fontSize: 11 }}>
                      P {macroGoals.protein}g · C {macroGoals.carbs}g · F {macroGoals.fat}g
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
