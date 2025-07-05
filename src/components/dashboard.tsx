'use client';
import { useUserData } from '@/hooks/use-user-data';
import CalorieDisplay from '@/components/calorie-display';
import MealLogger from '@/components/meal-logger';
import MealList from '@/components/meal-list';
import MacroProgress from '@/components/macro-progress';
import Header from '@/components/header';
import DashboardCalendar from './dashboard-calendar';

export default function Dashboard() {
  const { userData, selectedDateMeals, caloriesConsumed, macrosConsumed, macrosGoal } = useUserData();

  if (!userData) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <DashboardCalendar />
              <CalorieDisplay
                goal={userData.user_caloric_goal}
                consumed={caloriesConsumed}
              />
              <MacroProgress consumed={macrosConsumed} goal={macrosGoal} />
            </div>

            <div className="space-y-8">
              <MealLogger />
              <MealList meals={selectedDateMeals} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
