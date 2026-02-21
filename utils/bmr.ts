type Gender = 'male' | 'female' | 'other';

export type BmrInput = {
  age: number;
  weightKg: number;
  heightCm: number;
  gender: Gender;
  activityLevel?: string | null;
};

const ACTIVITY_MULTIPLIER: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const calculateBmr = ({ age, weightKg, heightCm, gender }: BmrInput) => {
  const s = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
};

export const calculateTdee = (input: BmrInput) => {
  const bmr = calculateBmr(input);
  const multiplier = ACTIVITY_MULTIPLIER[input.activityLevel ?? 'sedentary'] ?? 1.2;
  return bmr * multiplier;
};
