'use client';
import type { Meal, MealType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UtensilsCrossed, Flame } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useUserData } from '@/hooks/use-user-data';
import { isToday, format } from 'date-fns';

interface MealListProps {
  meals: Meal[];
}

export default function MealList({ meals }: MealListProps) {
  const { selectedDate } = useUserData();

  const title = isToday(selectedDate)
    ? "Today's Meals"
    : `${format(selectedDate, 'eeee')}'s Meals`;

  const descriptionDate = isToday(selectedDate) ? 'today' : `on ${format(selectedDate, 'MMM d')}`;

  const groupedMeals = meals.reduce((acc, meal) => {
    const type = meal.mealType || 'General';
    if (!acc[type]) {
      acc[type] = { meals: [], totalCalories: 0 };
    }
    acc[type].meals.push(meal);
    acc[type].totalCalories += meal.calories;
    return acc;
  }, {} as Record<string, { meals: Meal[], totalCalories: number }>);

  const mealOrder: (MealType | 'General')[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'General'];
  const orderedGroups = mealOrder
    .map(type => ({ type, data: groupedMeals[type] }))
    .filter(group => group.data);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {meals.length > 0 ? `You've logged ${meals.length} item(s) ${descriptionDate}.` : `No meals logged yet ${descriptionDate}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          {meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <UtensilsCrossed className="w-16 h-16 mb-4" />
              <p>Your logged meals for this day will appear here.</p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={mealOrder} className="w-full">
              {orderedGroups.map(({ type, data }) => (
                <AccordionItem value={type} key={type}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-2">
                        <span className="font-semibold text-lg">{type}</span>
                        <span className="text-muted-foreground">{Math.round(data.totalCalories)} Cal</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pt-2">
                      {data.meals.map(meal => (
                        <li key={meal.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <h4 className="font-semibold capitalize">{meal.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {`P: ${Math.round(meal.protein)}g, C: ${Math.round(meal.carbohydrates)}g, F: ${Math.round(meal.fat)}g`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary flex items-center gap-1">
                              <Flame className="w-4 h-4" />
                              {Math.round(meal.calories)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
