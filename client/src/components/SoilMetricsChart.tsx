import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Field } from '@shared/schemas';

interface SoilMetricsChartProps {
  field: Field;
}

export const SoilMetricsChart: React.FC<SoilMetricsChartProps> = ({ field }) => {
  const chartData = [
    {
      metric: 'Nitrogen (N)',
      Current: field.nitrogen_ppm ?? 0,
      OptimalTarget: 150, // Standard baseline target in ppm
      unit: 'ppm',
    },
    {
      metric: 'Phosphorus (P)',
      Current: field.phosphorus_ppm ?? 0,
      OptimalTarget: 60,
      unit: 'ppm',
    },
    {
      metric: 'Potassium (K)',
      Current: field.potassium_ppm ?? 0,
      OptimalTarget: 200,
      unit: 'ppm',
    },
    {
      metric: 'Organic Matter',
      Current: (field.organic_matter_pct ?? 0) * 10, // scaled x10 for clear visual comparison
      OptimalTarget: 35, // 3.5% * 10
      unit: '%',
    },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-white font-heading">Soil Nutrient Profile (N-P-K Breakdown)</h4>
          <p className="text-xs text-slate-400">Comparing current field soil metrics against baseline optimal ranges</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Current Field</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-600 inline-block"></span>
            <span className="text-slate-400">Optimal Benchmark</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any, item: any) => {
                const isOM = item.payload.metric === 'Organic Matter';
                const displayVal = isOM ? (Number(value) / 10).toFixed(1) + '%' : value + ' ppm';
                return [displayVal, name];
              }}
            />
            <Bar dataKey="Current" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
            <Bar dataKey="OptimalTarget" fill="#334155" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">SOIL pH</span>
          <span className="text-emerald-400 font-bold text-sm">{field.ph_level ?? 'Unmeasured'}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">NITROGEN (N)</span>
          <span className="text-emerald-400 font-bold text-sm">{field.nitrogen_ppm !== null ? `${field.nitrogen_ppm} ppm` : 'N/A'}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">PHOSPHORUS (P)</span>
          <span className="text-sky-400 font-bold text-sm">{field.phosphorus_ppm !== null ? `${field.phosphorus_ppm} ppm` : 'N/A'}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">POTASSIUM (K)</span>
          <span className="text-purple-400 font-bold text-sm">{field.potassium_ppm !== null ? `${field.potassium_ppm} ppm` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};
