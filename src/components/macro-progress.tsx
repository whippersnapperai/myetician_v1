'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface MacroProgressProps {
  consumed: { protein: number; carbohydrates: number; fat: number; };
  goal: { protein: number; carbohydrates: number; fat: number; };
}

const MacroChart = ({ name, consumed, goal, color }: { name: string, consumed: number, goal: number, color: string }) => {
  const percentage = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  const data = [{ name, value: percentage }];

  return (
    <div className="flex flex-col items-center">
      <div className="w-28 h-28">
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
              background={{ fill: 'hsl(var(--muted))' }}
              dataKey="value"
              cornerRadius={5}
              fill={color}
            />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xl font-bold">
              {Math.round(consumed)}g
            </text>
            <text x="50%" y="68%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
              of {Math.round(goal)}g
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="font-semibold mt-2">{name}</p>
    </div>
  );
};


export default function MacroProgress({ consumed, goal }: MacroProgressProps) {
  const COLORS = {
    Protein: 'hsl(var(--chart-1))',
    Carbohydrates: 'hsl(var(--chart-2))',
    Fat: 'hsl(var(--chart-3))'
  };
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Daily Macros</CardTitle>
        <CardDescription>Your macronutrient intake for today.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center justify-center p-6">
        <MacroChart name="Protein" consumed={consumed.protein} goal={goal.protein} color={COLORS.Protein} />
        <MacroChart name="Carbohydrates" consumed={consumed.carbohydrates} goal={goal.carbohydrates} color={COLORS.Carbohydrates} />
        <MacroChart name="Fat" consumed={consumed.fat} goal={goal.fat} color={COLORS.Fat} />
      </CardContent>
    </Card>
  );
}
