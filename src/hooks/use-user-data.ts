'use client';
import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import type { UserData, Meal, DailyLog } from '@/types';

export interface UserDataContextType {
  user: User | null;
  userData: UserData | null;
  mealLog: DailyLog;
  loading: boolean;
  saveUserData: (data: UserData, userOverride?: User) => Promise<void>;
  logMeal: (meal: Omit<Meal, 'id' | 'createdAt' | 'date'>) => Promise<void>;
  deleteMeal: (mealId: string, date: string) => Promise<void>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedDateMeals: Meal[];
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
