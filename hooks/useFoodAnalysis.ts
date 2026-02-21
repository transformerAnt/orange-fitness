import { useState } from 'react';

import { apiPost } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { calculateNutritionScore } from '@/utils/nutritionScore';

type FoodItem = { name: string; calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number };
export type FoodAnalysis = {
  items: FoodItem[];
  totalCalories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
};

export const useFoodAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);

  const analyze = async (imageUrl: string) => {
    setLoading(true);
    const response = await apiPost<FoodAnalysis>('/food/analyze', { imageUrl });
    setLoading(false);
    if (response.error) {
      throw new Error(response.error);
    }
    setAnalysis(response.data);
    return response.data;
  };

  const save = async (payload: {
    imageUrl: string;
    items: FoodItem[];
    totalCalories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    mealType: string;
    corrected: boolean;
  }) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) throw new Error('Not signed in');

    const healthScore = calculateNutritionScore({
      calories: payload.totalCalories,
      protein_g: payload.protein_g,
      carbs_g: payload.carbs_g,
      fat_g: payload.fat_g,
    });

    await supabase.from('food_logs').insert({
      user_id: user.id,
      image_url: payload.imageUrl,
      source: 'mistral',
      items: payload.items ?? [],
      total_calories: payload.totalCalories,
      protein_g: payload.protein_g,
      carbs_g: payload.carbs_g,
      fat_g: payload.fat_g,
      meal_type: payload.mealType,
      corrected: payload.corrected,
      health_score: healthScore,
    });
  };

  return { loading, analysis, analyze, save };
};
