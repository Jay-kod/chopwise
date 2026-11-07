import { z } from 'zod';

export const CONDITIONS = [
  { id: 'hypertension', label: 'Hypertension (High Blood Pressure)', desc: 'Low sodium, minimal salt' },
  { id: 'diabetes', label: 'Diabetes', desc: 'Low sugar, controlled refined carbs' },
  { id: 'obesity', label: 'Obesity (Weight Management)', desc: 'Calorie-conscious portions' },
  { id: 'ulcer', label: 'Stomach Ulcer', desc: 'Avoid spicy, acidic, or fried dishes' },
];

export const PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'no-pork', label: 'No Pork' },
  { id: 'no-fish', label: 'No Fish' },
  { id: 'no-beef', label: 'No Beef' },
  { id: 'low-carb', label: 'Low Carb' },
  { id: 'high-protein', label: 'High Protein' },
];

export const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

// Step 1: Basic Information
export const step1Schema = z.object({
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(10, 'Age must be at least 10')
    .max(100, 'Age cannot exceed 100'),
  gender: z.enum(['female', 'male'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  weightKg: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .min(20, 'Weight must be at least 20 kg')
    .max(300, 'Weight cannot exceed 300 kg'),
});

// Step 2: Health Conditions
export const step2Schema = z.object({
  conditions: z.array(z.enum(['hypertension', 'diabetes', 'obesity', 'ulcer'])),
});

// Step 3: Preferences & Allergies / Avoid
export const step3Schema = z.object({
  preferences: z.array(
    z.enum([
      'vegetarian',
      'no-pork',
      'no-fish',
      'no-beef',
      'low-carb',
      'high-protein',
    ])
  ),
  avoidText: z
    .string()
    .max(100, 'Avoid list cannot exceed 100 characters')
    .default(''),
});

// Step 4: Budget
export const step4Schema = z.object({
  weeklyBudgetNGN: z
    .number({ invalid_type_error: 'Budget must be a number' })
    .int('Budget must be an integer')
    .min(1000, 'Budget must be at least ₦1,000')
    .max(500000, 'Budget cannot exceed ₦500,000'),
});

// Complete profile schema (matches DATABASE.md specification)
export const profileSchema = z.object({
  age: step1Schema.shape.age,
  gender: step1Schema.shape.gender,
  weightKg: step1Schema.shape.weightKg,
  conditions: step2Schema.shape.conditions,
  preferences: step3Schema.shape.preferences,
  avoidText: step3Schema.shape.avoidText,
  weeklyBudgetNGN: step4Schema.shape.weeklyBudgetNGN,
  updatedAt: z.string().optional(),
});
