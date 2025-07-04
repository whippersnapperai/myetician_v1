'use client';
import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CalorieDisplay from '@/components/calorie-display';
import MealLogger from '@/components/meal-logger';
import MealList from '@/components/meal-list';
import WeeklySummary from '@/components/weekly-summary';
import { Flame } from 'lucide-react';

export default function Dashboard() {
  const { userData, todaysMeals, caloriesConsumed, macrosConsumed } = useUserData();

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-headline font-bold">
            Welcome back, <span className="text-primary">{userData.user_first_name}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">Here's your summary for today.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <CalorieDisplay
                  goal={userData.user_caloric_goal}
                  consumed={caloriesConsumed}
                />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Calories Consumed</h3>
                    <p className="text-2xl font-bold text-primary flex items-center">
                      <Flame className="w-6 h-6 mr-2 text-primary" /> {Math.round(caloriesConsumed)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Macronutrients</h3>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Protein: <span className="font-bold">{Math.round(macrosConsumed.protein)}g</span></span>
                      <span>Carbs: <span className="font-bold">{Math.round(macrosConsumed.carbohydrates)}g</span></span>
                      <span>Fat: <span className="font-bold">{Math.round(macrosConsumed.fat)}g</span></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>Your calorie intake for the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklySummary />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <MealLogger />
            <MealList meals={todaysMeals} />
          </div>
        </main>
      </div>
    </div>
  );
}
