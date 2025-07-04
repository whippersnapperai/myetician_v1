'use client';
import { useUserData } from '@/hooks/use-user-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Card } from './ui/card';

export default function WeeklySummary() {
  const { mealLog, userData } = useUserData();

  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const data = last7Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const meals = mealLog[dateStr] || [];
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    return {
      name: format(day, 'EEE'), // e.g., 'Mon'
      calories: totalCalories,
      goal: userData?.user_caloric_goal || 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 shadow-lg">
          <p className="font-bold">{label}</p>
          <p className="text-primary">{`Calories: ${payload[0].value}`}</p>
          <p className="text-accent">{`Goal: ${Math.round(payload[1].value as number)}`}</p>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 4 }} />
          <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Calories" />
          <Bar dataKey="goal" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Goal" barSize={1} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
