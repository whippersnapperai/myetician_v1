'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MacroProgressProps {
  consumed: { protein: number; carbohydrates: number; fat: number; };
  goal: { protein: number; carbohydrates: number; fat: number; };
}

const MacroBar = ({ name, consumed, goal }: { name: string; consumed: number; goal: number }) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  const remaining = Math.max(0, goal - consumed);
  let colorClass = 'bg-primary';
  if (percentage > 100) {
    colorClass = 'bg-destructive';
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span>{name}</span>
        <span className="text-muted-foreground">{Math.round(consumed)}g / {Math.round(goal)}g</span>
      </div>
      <Progress value={percentage} indicatorClassName={colorClass} />
      <p className="text-xs text-muted-foreground">{Math.round(remaining)}g remaining</p>
    </div>
  );
}

export default function MacroProgress({ consumed, goal }: MacroProgressProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Daily Macros</CardTitle>
        <CardDescription>Your macronutrient intake for today.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <MacroBar name="Protein" consumed={consumed.protein} goal={goal.protein} />
        <MacroBar name="Carbohydrates" consumed={consumed.carbohydrates} goal={goal.carbohydrates} />
        <MacroBar name="Fat" consumed={consumed.fat} goal={goal.fat} />
      </CardContent>
    </Card>
  );
}
