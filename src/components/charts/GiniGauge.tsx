'use client';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface GiniGaugeProps {
  value: number; // 0 to 1
  label?: string;
}

export function GiniGauge({ value, label = "Gini Coefficient" }: GiniGaugeProps) {
  // Threshold colours — kept for semantic meaning, only the gauge arc
  let fill = '#059669'; // emerald — equitable
  if (value > 0.2)  fill = '#eab308'; // yellow — moderate gap
  if (value > 0.35) fill = '#f97316'; // orange — concerning
  if (value > 0.45) fill = '#ef4444'; // red — critical

  const data = [{ name: 'Gini', value, fill }];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="90%"
          barSize={14}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 1]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#f3f4f6' }}
            dataKey="value"
            cornerRadius={8}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
        <span className="text-3xl font-mono tracking-tighter text-[#111111]">{value.toFixed(2)}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#6b7280] mt-1">{label}</span>
      </div>
    </div>
  );
}

