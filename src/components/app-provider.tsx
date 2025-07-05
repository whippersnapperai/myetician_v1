'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { UserDataContext, type UserDataContextType } from '@/hooks/use-user-data';
import type { UserData, Meal, DailyLog } from '@/types';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mealLog, setMealLog] = useState<DailyLog>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isSupabaseConfigured && supabase) {
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user data:', error);
          return;
        }

        if (data) {
          setUserData(data as UserData);
        } else {
          setUserData(null);
        }
      };

      const fetchMealLog = async () => {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', dateKey)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching meals:', error);
          return;
        }

        const meals: Meal[] = data.map(meal => ({
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbohydrates: meal.carbohydrates,
          fat: meal.fat,
          mealType: meal.meal_type as any,
          date: meal.date,
          createdAt: meal.created_at,
        }));

        setMealLog(prevLog => ({
          ...prevLog,
          [dateKey]: meals,
        }));
      };
      
      setLoading(true);
      Promise.all([fetchUserData(), fetchMealLog()]).finally(() => setLoading(false));

    } else {
      setUserData(null);
      setMealLog({});
    }
  }, [user, selectedDate]);

  const saveUserData = useCallback(async (data: UserData, userOverride?: User) => {
    const userToSave = userOverride || user;
    if (!userToSave || !isSupabaseConfigured || !supabase) {
      toast({ variant: 'destructive', title: 'Offline Mode', description: 'Cannot save data. Please configure Supabase.' });
      setUserData(data);
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userToSave.id,
          ...data,
        });

      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error("Failed to save user data to Supabase", error);
      toast({ variant: 'destructive', title: 'Save Error', description: 'Could not save your profile data.' });
    }
  }, [user, toast]);

  const logMeal = useCallback(async (meal: Omit<Meal, 'id' | 'createdAt' | 'date'>) => {
    if (!user || !isSupabaseConfigured || !supabase) {
      toast({ variant: 'destructive', title: 'Offline Mode', description: 'Cannot log meal. Please configure Supabase.' });
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const newMealWithId: Meal = {
        ...meal,
        id: `offline-${Date.now()}`,
        createdAt: new Date().toISOString(),
        date: dateKey,
      };
      setMealLog(prevLog => {
        const updatedLog = { ...prevLog };
        const dateMeals = updatedLog[dateKey] ? [newMealWithId, ...updatedLog[dateKey]] : [newMealWithId];
        updatedLog[dateKey] = dateMeals;
        return updatedLog;
      });
      return;
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbohydrates: meal.carbohydrates,
          fat: meal.fat,
          meal_type: meal.mealType || null,
          date: dateKey,
        })
        .select()
        .single();

      if (error) throw error;

      const newMeal: Meal = {
        id: data.id,
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbohydrates: data.carbohydrates,
        fat: data.fat,
        mealType: data.meal_type as any,
        date: data.date,
        createdAt: data.created_at,
      };

      setMealLog(prevLog => {
        const updatedLog = { ...prevLog };
        const dateMeals = updatedLog[dateKey] ? [newMeal, ...updatedLog[dateKey]] : [newMeal];
        updatedLog[dateKey] = dateMeals;
        return updatedLog;
      });

    } catch (error) {
      console.error("Failed to save meal log to Supabase", error);
      toast({ variant: 'destructive', title: 'Log Error', description: 'Could not log your meal.' });
    }
  }, [user, selectedDate, toast]);
  
  const deleteMeal = useCallback(async (mealId: string, date: string) => {
    if (!user || !isSupabaseConfigured || !supabase) {
      toast({ variant: 'destructive', title: 'Offline Mode', description: 'Cannot delete meal.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;

      setMealLog(prevLog => {
        const updatedLog = { ...prevLog };
        const dateMeals = updatedLog[date] || [];
        updatedLog[date] = dateMeals.filter(meal => meal.id !== mealId);
        return updatedLog;
      });

      toast({ title: "Meal deleted!", description: "The meal has been removed from your log." });

    } catch (error) {
      console.error("Failed to delete meal log from Supabase", error);
      toast({ variant: 'destructive', title: 'Delete Error', description: 'Could not delete your meal.' });
    }
  }, [user, toast]);
  
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
    user,
    userData, 
    mealLog,
    loading, 
    saveUserData, 
    logMeal,
    deleteMeal,
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