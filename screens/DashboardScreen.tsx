import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CalorieRing from '@/components/CalorieRing';
import EmptyState from '@/components/EmptyState';
import MacroBreakdown from '@/components/MacroBreakdown';
import MealCard from '@/components/MealCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import SmartSuggestionCard from '@/components/SmartSuggestionCard';
import WeeklyMacroChart from '@/components/WeeklyMacroChart';
import { Design } from '@/constants/design';
import { useCalorieGoal } from '@/hooks/useCalorieGoal';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';

const MEAL_LABELS = ['Breakfast', 'Lunch', 'Brunch', 'Dinner', 'Snacks'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DashboardScreen() {
  const { weeklyStats, selectedDayIndex, setSelectedDayIndex, loading, hasData } = useWeeklyStats();
  const { calorieGoal, proteinGoal, carbsGoal, fatGoal } = useCalorieGoal();

  const selectedDay = weeklyStats[selectedDayIndex];
  const consumedCalories = selectedDay?.calories ?? 0;
  const remainingCalories = Math.max(0, calorieGoal - consumedCalories);
  const proteinDeficit = Math.max(0, proteinGoal - (selectedDay?.protein ?? 0));

  const streak = useMemo(() => {
    const todayIndex = (new Date().getDay() + 6) % 7;
    let count = 0;
    for (let i = 0; i < 7; i += 1) {
      const idx = (todayIndex - i + 7) % 7;
      if (weeklyStats[idx]?.calories > 0) {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [weeklyStats]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Design.colors.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: Design.colors.background }}>
        <View style={{ paddingHorizontal: Design.spacing.lg, paddingTop: 20, paddingBottom: 40 }}>
          <Text
            style={{
              color: Design.colors.ink,
              fontSize: 26,
              fontFamily: Design.typography.fontBold,
              marginBottom: 6,
            }}>
            Dashboard
          </Text>
          <Text style={{ color: Design.colors.muted, fontSize: 14, marginBottom: 16 }}>
            AI-first calorie tracking with macro-level clarity.
          </Text>

          {loading ? (
            <SkeletonLoader />
          ) : !hasData ? (
            <EmptyState
              title="Start Tracking Your Health"
              subtitle="Unlock insights once you log your first meal."
              ctaLabel="Scan Your First Meal"
              onPress={() => {}}
            />
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                <CalorieRing consumed={consumedCalories} goal={calorieGoal} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Design.colors.muted, fontSize: 12 }}>Daily goal</Text>
                  <Text style={{ color: Design.colors.ink, fontSize: 18, fontFamily: Design.typography.fontBold }}>
                    {Math.round(calorieGoal)} kcal
                  </Text>
                  <Text style={{ color: Design.colors.muted, fontSize: 12, marginTop: 8 }}>Remaining</Text>
                  <Text style={{ color: Design.colors.ink, fontSize: 16, fontFamily: Design.typography.fontSemiBold }}>
                    {Math.round(remainingCalories)} kcal
                  </Text>
                  <Text style={{ color: Design.colors.muted, fontSize: 12, marginTop: 12 }}>
                    Streak: {streak} days
                  </Text>
                </View>
              </View>

              <SmartSuggestionCard remainingCalories={remainingCalories} proteinDeficit={proteinDeficit} />

              <View
                style={{
                  borderColor: Design.colors.line,
                  borderRadius: 20,
                  borderWidth: 1,
                  padding: 16,
                  backgroundColor: Design.colors.surface,
                  marginTop: 16,
                }}>
                <Text
                  style={{
                    color: Design.colors.ink,
                    fontSize: 16,
                    fontFamily: Design.typography.fontSemiBold,
                    marginBottom: 8,
                  }}>
                  Weekly Chart
                </Text>
                <WeeklyMacroChart
                  days={weeklyStats}
                  labels={WEEK_DAYS}
                  selectedIndex={selectedDayIndex}
                  onSelect={setSelectedDayIndex}
                />
              </View>

              <View
                style={{
                  borderColor: Design.colors.line,
                  borderRadius: 20,
                  borderWidth: 1,
                  padding: 16,
                  backgroundColor: Design.colors.surface,
                  marginTop: 16,
                }}>
                <Text
                  style={{
                    color: Design.colors.ink,
                    fontSize: 16,
                    fontFamily: Design.typography.fontSemiBold,
                    marginBottom: 8,
                  }}>
                  Daily Breakdown • {WEEK_DAYS[selectedDayIndex]}
                </Text>
                <MacroBreakdown
                  protein={selectedDay?.protein ?? 0}
                  carbs={selectedDay?.carbs ?? 0}
                  fat={selectedDay?.fat ?? 0}
                  other={selectedDay?.other ?? 0}
                />
                {MEAL_LABELS.map((meal) => {
                  const data = selectedDay?.meals?.[meal];
                  return (
                    <MealCard
                      key={meal}
                      name={meal}
                      calories={data?.calories ?? 0}
                      protein={data?.protein ?? 0}
                      carbs={data?.carbs ?? 0}
                      fat={data?.fat ?? 0}
                      other={data?.other ?? 0}
                    />
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
