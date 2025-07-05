'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { UserDataContext, type UserDataContextType } from '@/hooks/use-user-data';
import type { UserData, Meal, DailyLog } from '@/types';
import { format } from 'date-fns';

const USER_DATA_KEY = 'myetician_user_data';
const MEAL_LOG_KEY = 'myetician_meal_log';

export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mealLog, setMealLog] = useState<DailyLog>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem(USER_DATA_KEY);
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }

      const storedMealLog = localStorage.getItem(MEAL_LOG_KEY);
      if (storedMealLog) {
        setMealLog(JSON.parse(storedMealLog));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUserData = useCallback((data: UserData) => {
    setUserData(data);
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save user data to localStorage", error);
    }
  }, []);

  const logMeal = useCallback((meal: Omit<Meal, 'id' | 'createdAt'>) => {
    const newMeal: Meal = {
      ...meal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    setMealLog(prevLog => {
      const updatedLog = { ...prevLog };
      const dateMeals = updatedLog[dateKey] ? [...updatedLog[dateKey], newMeal] : [newMeal];
      updatedLog[dateKey] = dateMeals;

      try {
        localStorage.setItem(MEAL_LOG_KEY, JSON.stringify(updatedLog));
      } catch (error) {
        console.error("Failed to save meal log to localStorage", error);
      }

      return updatedLog;
    });
  }, [selectedDate]);

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateMeals = mealLog[selectedDateString] || [];

  const caloriesConsumed = selectedDateMeals.reduce((sum, meal) => sum + meal.calories, 0);

  const macrosConsumed = selectedDateMeals.reduce(
    (totals, meal) => {
      totals.protein += meal.protein;
      totals.carbohydrates += meal.carbohydrates;
      totals.fat += meal.fat;
      return totals;
    },
    { protein: 0, carbohydrates: 0, fat: 0 }
  );
  
  const macrosGoal = {
    protein: userData ? (userData.user_caloric_goal * 0.30) / 4 : 0,
    carbohydrates: userData ? (userData.user_caloric_goal * 0.40) / 4 : 0,
    fat: userData ? (userData.user_caloric_goal * 0.30) / 9 : 0,
  };


  const value: UserDataContextType = { 
    userData, 
    mealLog,
    loading, 
    saveUserData, 
    logMeal,
    selectedDate,
    setSelectedDate,
    selectedDateMeals,
    caloriesConsumed,
    macrosConsumed,
    macrosGoal,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}
