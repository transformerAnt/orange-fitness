import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { calculateOtherCalories } from '@/utils/macroCalculations';

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

const toMondayIndex = (date: Date) => (date.getDay() + 6) % 7;

const emptyMeal = (): MealStats => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  other: 0,
});

const emptyDay = (): DayStats => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  other: 0,
  meals: {
    Breakfast: emptyMeal(),
    Lunch: emptyMeal(),
    Brunch: emptyMeal(),
    Dinner: emptyMeal(),
    Snacks: emptyMeal(),
  },
});

export const useWeeklyStats = () => {
  const [weeklyStats, setWeeklyStats] = useState<DayStats[]>(() => WEEK_DAYS.map(() => emptyDay()));
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => toMondayIndex(new Date()));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setWeeklyStats(WEEK_DAYS.map(() => emptyDay()));
      setLoading(false);
      return;
    }

    const now = new Date();
    const mondayIndex = toMondayIndex(now);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - mondayIndex);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const { data } = await supabase
      .from('food_logs')
      .select('created_at,total_calories,protein_g,carbs_g,fat_g,meal_type')
      .eq('user_id', user.id)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: true });

    const next = WEEK_DAYS.map(() => emptyDay());
    (data ?? []).forEach((log: any) => {
      const createdAt = new Date(log.created_at);
      const dayIndex = toMondayIndex(createdAt);
      if (dayIndex < 0 || dayIndex > 6) return;

      const protein = Number(log.protein_g ?? 0);
      const carbs = Number(log.carbs_g ?? 0);
      const fat = Number(log.fat_g ?? 0);
      const totalCalories = Number(log.total_calories ?? protein * 4 + carbs * 4 + fat * 9);
      const other = calculateOtherCalories(totalCalories, protein, carbs, fat);

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

      const meal = day.meals[mealKey] ?? emptyMeal();
      meal.calories += totalCalories;
      meal.protein += protein;
      meal.carbs += carbs;
      meal.fat += fat;
      meal.other += other;
      day.meals[mealKey] = meal;
    });

    setWeeklyStats(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasData = useMemo(() => weeklyStats.some((day) => day.calories > 0), [weeklyStats]);

  return {
    weeklyStats,
    selectedDayIndex,
    setSelectedDayIndex,
    loading,
    hasData,
    reload: load,
  };
};
