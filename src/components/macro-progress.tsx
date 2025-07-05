'use client';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beef, Wheat, CookingPot } from 'lucide-react';

interface MacroProgressProps {
  consumed: { protein: number; carbohydrates: number; fat: number; };
  goal: { protein: number; carbohydrates: number; fat: number; };
}

interface MacroCardProps {
  name: string;
  consumed: number;
  goal: number;
  color: string;
  icon: React.ReactNode;
}

const MacroCard = ({ name, consumed, goal, color, icon }: MacroCardProps) => {
  const percentage = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  const data = [{ name: 'consumed', value: percentage }];
  
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{name}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-0 pb-4">
        <div className="relative w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                innerRadius="80%"
                outerRadius="100%"
                barSize={10}
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
                <span className="text-xl font-bold tracking-tighter" style={{ color: `hsl(${color})` }}>
                    {Math.round(consumed)}g
                </span>
                <span className="text-xs text-muted-foreground -mt-1">
                    Consumed
                </span>
            </div>
        </div>
        <div className="text-center mt-2 px-2">
          <p className="text-xs text-muted-foreground">
            Goal: {Math.round(goal)}g
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MacroProgress({ consumed, goal }: MacroProgressProps) {
  const macroData = [
    {
      name: 'Protein',
      consumed: consumed.protein,
      goal: goal.protein,
      color: 'var(--chart-1)',
      icon: <Beef className="w-5 h-5" style={{ color: 'hsl(var(--chart-1))' }} />
    },
    {
      name: 'Carbs',
      consumed: consumed.carbohydrates,
      goal: goal.carbohydrates,
      color: 'var(--chart-2)',
      icon: <Wheat className="w-5 h-5" style={{ color: 'hsl(var(--chart-2))' }} />
    },
    {
      name: 'Fat',
      consumed: consumed.fat,
      goal: goal.fat,
      color: 'var(--chart-3)',
      icon: <CookingPot className="w-5 h-5" style={{ color: 'hsl(var(--chart-3))' }} />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
      {macroData.map(macro => (
        <MacroCard 
            key={macro.name}
            name={macro.name}
            consumed={macro.consumed}
            goal={macro.goal}
            color={macro.color}
            icon={macro.icon}
        />
      ))}
    </div>
  );
}
