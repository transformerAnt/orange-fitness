export type MacroSplit = {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
};

export const defaultMacroSplit: MacroSplit = {
  proteinPct: 0.3,
  carbsPct: 0.4,
  fatPct: 0.3,
};

export const calculateMacroGoals = (calories: number, split: MacroSplit = defaultMacroSplit) => {
  const proteinCalories = calories * split.proteinPct;
  const carbsCalories = calories * split.carbsPct;
  const fatCalories = calories * split.fatPct;
  return {
    protein_g: Math.round(proteinCalories / 4),
    carbs_g: Math.round(carbsCalories / 4),
    fat_g: Math.round(fatCalories / 9),
  };
};

export const calculateOtherCalories = (totalCalories: number, protein: number, carbs: number, fat: number) => {
  const macroCalories = protein * 4 + carbs * 4 + fat * 9;
  return Math.max(0, totalCalories - macroCalories);
};
