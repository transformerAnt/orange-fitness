import { useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { calculateMacroGoals } from '@/utils/macroCalculations';
import { calculateTdee } from '@/utils/bmr';

type GoalState = {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  loading: boolean;
};

export const useCalorieGoal = () => {
  const [state, setState] = useState<GoalState>({
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 200,
    fatGoal: 70,
    loading: true,
  });

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('age,gender,height_cm,weight_kg,activity_level,calorie_goal,protein_goal,carbs_goal,fat_goal')
        .eq('id', user.id)
        .single();

      if (!data) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const calorieGoal =
        data.calorie_goal ||
        Math.round(
          calculateTdee({
            age: data.age ?? 26,
            weightKg: Number(data.weight_kg ?? 70),
            heightCm: Number(data.height_cm ?? 170),
            gender: (data.gender ?? 'other') as 'male' | 'female' | 'other',
            activityLevel: data.activity_level ?? 'moderate',
          })
        );

      const macroGoals = calculateMacroGoals(calorieGoal);
      setState({
        calorieGoal,
        proteinGoal: data.protein_goal ?? macroGoals.protein_g,
        carbsGoal: data.carbs_goal ?? macroGoals.carbs_g,
        fatGoal: data.fat_goal ?? macroGoals.fat_g,
        loading: false,
      });
    };

    load();
  }, []);

  return useMemo(() => state, [state]);
};
