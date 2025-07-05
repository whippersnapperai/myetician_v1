'use client';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CalorieDisplayProps {
  goal: number;
  consumed: number;
}

export default function CalorieDisplay({ goal, consumed }: CalorieDisplayProps) {
  const remaining = Math.max(0, goal - consumed);
  const percentage = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  const data = [{ name: 'consumed', value: percentage }];
  const color = 'var(--chart-5)';

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Calories</CardTitle>
        <Flame className="w-5 h-5" style={{ color: `hsl(${color})` }} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-0 pb-4">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="80%"
              outerRadius="100%"
              barSize={12}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: 'hsl(var(--muted))' }}
                dataKey="value"
                cornerRadius={10}
                style={{ fill: `hsl(${color})` }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold tracking-tighter" style={{ color: `hsl(${color})` }}>
              {Math.round(consumed)}
            </span>
            <span className="text-xs text-muted-foreground -mt-1">
              Consumed
            </span>
          </div>
        </div>
        <div className="text-center mt-2 px-2">
          <p className="text-sm font-medium">
            {Math.round(remaining)} <span className="text-muted-foreground">kcal left</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Goal: {Math.round(goal)} kcal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
