'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DashboardCalendar() {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  const handleMonthChange = (month: Date) => {
    setDisplayMonth(month);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{format(displayMonth, 'MMMM yyyy')}</h3>
          </div>
        </div>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          month={displayMonth}
          onMonthChange={handleMonthChange}
          numberOfMonths={isMobile ? 1 : 2}
          pagedNavigation
          classNames={{
            caption_label: 'hidden',
            head_cell: 'w-10 font-normal text-sm text-muted-foreground',
            day: 'w-10 h-10',
            day_selected:
              'bg-primary text-primary-foreground rounded-full hover:bg-primary hover:text-primary-foreground',
            day_today: 'bg-accent text-accent-foreground rounded-full',
            day_outside: 'text-muted-foreground opacity-50',
          }}
        />
      </CardContent>
    </Card>
  );
}
