'use client';
import { createContext, useContext } from 'react';
import type { UserData, Meal, DailyLog } from '@/types';

export interface UserDataContextType {
  userData: UserData | null;
  mealLog: DailyLog;
  loading: boolean;
  saveUserData: (data: UserData) => void;
  logMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => void;
  todaysMeals: Meal[];
  caloriesConsumed: number;
  macrosConsumed: { protein: number; carbohydrates: number; fat: number; };
  macrosGoal: { protein: number; carbohydrates: number; fat: number; };
}

export const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
