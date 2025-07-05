'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { UserDataContext, type UserDataContextType } from '@/hooks/use-user-data';
import type { UserData, Meal, DailyLog } from '@/types';
import { format } from 'date-fns';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mealLog, setMealLog] = useState<DailyLog>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isFirebaseConfigured && db) {
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        } else {
          setUserData(null);
        }
      };

      const fetchMealLog = async () => {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const mealLogQuery = query(
          collection(db, `users/${user.uid}/mealLog`),
          where('date', '==', dateKey),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(mealLogQuery);
        const meals: Meal[] = [];
        querySnapshot.forEach((doc) => {
          meals.push({ id: doc.id, ...doc.data() } as Meal);
        });

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
    if (!userToSave || !isFirebaseConfigured || !db) {
      toast({ variant: 'destructive', title: 'Offline Mode', description: 'Cannot save data. Please configure Firebase.' });
      setUserData(data);
      return;
    }
    try {
      await setDoc(doc(db, 'users', userToSave.uid), data);
      setUserData(data);
    } catch (error) {
      console.error("Failed to save user data to Firestore", error);
      toast({ variant: 'destructive', title: 'Save Error', description: 'Could not save your profile data.' });
    }
  }, [user, toast]);

  const logMeal = useCallback(async (meal: Omit<Meal, 'id' | 'createdAt' | 'date'>) => {
    if (!user || !isFirebaseConfigured || !db) {
      toast({ variant: 'destructive', title: 'Offline Mode', description: 'Cannot log meal. Please configure Firebase.' });
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
    const newMeal: Omit<Meal, 'id'> = {
      ...meal,
      createdAt: new Date().toISOString(),
      date: dateKey,
    };
    
    try {
      const docRef = await addDoc(collection(db, `users/${user.uid}/mealLog`), newMeal);
      const newMealWithId: Meal = { ...newMeal, id: docRef.id };

      setMealLog(prevLog => {
        const updatedLog = { ...prevLog };
        const dateMeals = updatedLog[dateKey] ? [newMealWithId, ...updatedLog[dateKey]] : [newMealWithId];
        updatedLog[dateKey] = dateMeals;
        return updatedLog;
      });

    } catch (error) {
      console.error("Failed to save meal log to Firestore", error);
      toast({ variant: 'destructive', title: 'Log Error', description: 'Could not log your meal.' });
    }
  }, [user, selectedDate, toast]);
  
  const deleteMeal = useCallback(async (mealId: string, date: string) => {
    if (!user || !isFirebaseConfigured || !db) {
      toast({ variant: 'destructive', title: 'Offline Mode', description: 'Cannot delete meal.' });
      return;
    }

    try {
      await deleteDoc(doc(db, `users/${user.uid}/mealLog`, mealId));

      setMealLog(prevLog => {
        const updatedLog = { ...prevLog };
        const dateMeals = updatedLog[date] || [];
        updatedLog[date] = dateMeals.filter(meal => meal.id !== mealId);
        return updatedLog;
      });

      toast({ title: "Meal deleted!", description: "The meal has been removed from your log." });

    } catch (error) {
      console.error("Failed to delete meal log from Firestore", error);
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
