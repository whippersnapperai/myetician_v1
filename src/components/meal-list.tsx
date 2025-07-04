'use client';
import type { Meal } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Flame } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface MealListProps {
  meals: Meal[];
}

export default function MealList({ meals }: MealListProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Today's Meals</CardTitle>
        <CardDescription>
          {meals.length > 0 ? `You've logged ${meals.length} meal(s) today.` : 'No meals logged yet today.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
            {meals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <UtensilsCrossed className="w-16 h-16 mb-4" />
                    <p>Your logged meals will appear here.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {meals.map(meal => (
                        <li key={meal.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                                <h4 className="font-semibold capitalize">{meal.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {`P: ${meal.protein}g, C: ${meal.carbohydrates}g, F: ${meal.fat}g`}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-primary flex items-center gap-1">
                                  <Flame className="w-4 h-4"/>
                                  {meal.calories}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
