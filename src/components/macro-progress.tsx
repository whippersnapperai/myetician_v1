'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Zap, Flame, Leaf } from 'lucide-react';

interface MacroProgressProps {
  consumed: { protein: number; carbohydrates: number; fat: number; };
  goal: { protein: number; carbohydrates: number; fat: number; };
}

interface MacroCardProps {
  name: string;
  consumed: number;
  goal: number;
  colorClass: string;
  icon: React.ReactNode;
}

const MacroCard = ({ name, consumed, colorClass, icon }: MacroCardProps) => {
  return (
    <Card className={`shadow-lg ${colorClass} text-card-foreground dark:text-[hsl(222.2,47.4%,11.2%)]`}>
      <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
        <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold">{name}</h3>
            {icon}
        </div>
        <div>
            <span className="text-2xl font-bold">{Math.round(consumed)}</span>
            <span className="text-sm ml-1">gram</span>
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
      colorClass: 'bg-[hsl(var(--chart-1))]',
      icon: <Zap className="w-5 h-5" />
    },
    {
      name: 'Carbs',
      consumed: consumed.carbohydrates,
      goal: goal.carbohydrates,
      colorClass: 'bg-[hsl(var(--chart-2))]',
      icon: <Flame className="w-5 h-5" />
    },
    {
      name: 'Fat',
      consumed: consumed.fat,
      goal: goal.fat,
      colorClass: 'bg-[hsl(var(--chart-3))]',
      icon: <Leaf className="w-5 h-5" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {macroData.map(macro => (
        <MacroCard 
            key={macro.name}
            name={macro.name}
            consumed={macro.consumed}
            goal={macro.goal}
            colorClass={macro.colorClass}
            icon={macro.icon}
        />
      ))}
    </div>
  );
}
