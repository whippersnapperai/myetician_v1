'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface CalorieDisplayProps {
  goal: number;
  consumed: number;
}

export default function CalorieDisplay({ goal, consumed }: CalorieDisplayProps) {
  const remaining = Math.max(0, goal - consumed);
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  
  const data = [
    { name: 'Consumed', value: consumed },
    { name: 'Remaining', value: remaining },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="w-52 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={450}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                  content={({ viewBox }) => {
                    if (viewBox) {
                      const { cx, cy } = viewBox;
                      return (
                        <g>
                          <text x={cx} y={cy ? cy - 5 : 0} textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-foreground">
                            {Math.round(remaining)}
                          </text>
                           <text x={cx} y={cy ? cy + 18 : 0} textAnchor="middle" dominantBaseline="middle" className="text-sm fill-muted-foreground">
                            Remaining
                          </text>
                        </g>
                      );
                    }
                    return null;
                  }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
         <p className="text-sm text-muted-foreground">Goal: {Math.round(goal)} Cal</p>
      </div>
    </div>
  );
}
