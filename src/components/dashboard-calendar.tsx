'use client';

import { useUserData } from '@/hooks/use-user-data';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';

export default function DashboardCalendar() {
  const { selectedDate, setSelectedDate } = useUserData();

  const week = Array.from({ length: 7 }, (_, i) => addDays(subDays(selectedDate, 3), i));

  return (
    <Card className="shadow-lg">
      <CardContent className="p-3">
        <div className="flex justify-between items-center gap-1">
            {week.map((day) => (
            <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                'flex flex-col items-center justify-center w-full aspect-square rounded-lg transition-colors duration-200 focus:outline-none text-center p-1',
                {
                    'bg-primary text-primary-foreground shadow-md': isSameDay(day, selectedDate),
                    'hover:bg-accent/50': !isSameDay(day, selectedDate),
                }
                )}
            >
                <span className="text-xs uppercase opacity-75">{format(day, 'EEE')}</span>
                <span className="text-2xl font-bold">{format(day, 'd')}</span>
                 {isToday(day) && !isSameDay(day, selectedDate) && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1" />
                )}
            </button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
