export type Goal = 'Build muscle' | 'Maintain weight' | 'Lose weight' | '';
export type ActivityLevel = 'Sedentary' | 'Lightly active' | 'Moderately active' | 'Very active' | 'Extremely active' | '';
export type Gender = 'male' | 'female' | '';
export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lbs';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface UserData {
  user_first_name: string;
  user_goal: Goal;
  user_current_activity_level: ActivityLevel;
  user_activity_factor_value: number;
  user_gender: Gender;
  user_dob: string;
  user_age: number;
  user_height: number;
  user_height_unit: HeightUnit;
  user_current_weight: number;
  user_current_weight_unit: WeightUnit;
  user_goal_weight: number;
  user_goal_weight_unit: WeightUnit;
  user_caloric_goal_intensity_value: number;
  user_calculated_bmr: number;
  user_calculated_tdee: number;
  user_caloric_goal: number;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  createdAt: string; // ISO string
  date: string; // 'YYYY-MM-DD'
  mealType?: MealType;
}

export interface DailyLog {
  [date: string]: Meal[]; // date is 'YYYY-MM-DD'
}
