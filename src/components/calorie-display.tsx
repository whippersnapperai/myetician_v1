'use client';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CalorieDisplayProps {
  goal: number;
  consumed: number;
}

export default function CalorieDisplay({ goal, consumed }: CalorieDisplayProps) {
  const remaining = Math.max(0, goal - consumed);
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  const data = [{ name: 'consumed', value: percentage }];

  return (
    <Card className="shadow-lg bg-[hsl(var(--chart-4))] text-foreground dark:text-[hsl(222.2,47.4%,11.2%)] h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Calories</CardTitle>
        <Dumbbell className="w-5 h-5" />
      </CardHeader>
      <CardContent className="flex justify-center items-center p-0 flex-grow">
        <div className="relative w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="85%"
              barSize={10}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: 'hsla(var(--foreground), 0.1)' }}
                dataKey="value"
                cornerRadius={10}
                fill="hsl(var(--foreground))"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
             <span className="text-3xl font-bold tracking-tighter">
              {Math.round(remaining)}
            </span>
            <span className="text-xs text-muted-foreground -mt-1 dark:text-[hsl(215.4,16.3%,46.9%)]">kcal left</span>
            <span className="text-xs text-muted-foreground mt-2 dark:text-[hsl(215.4,16.3%,46.9%)]">Goal: {Math.round(goal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
