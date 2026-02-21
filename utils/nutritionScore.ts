type ScoreInput = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ultraProcessed?: boolean;
};

export const calculateNutritionScore = (input: ScoreInput) => {
  const proteinRatio = input.calories ? (input.protein_g * 4) / input.calories : 0;
  const calorieDensityPenalty = input.calories > 900 ? 15 : input.calories > 700 ? 8 : 0;
  const proteinBonus = Math.min(20, Math.round(proteinRatio * 100));
  const ultraProcessedPenalty = input.ultraProcessed ? 15 : 0;
  const base = 70 + proteinBonus - calorieDensityPenalty - ultraProcessedPenalty;
  return Math.max(0, Math.min(100, base));
};
