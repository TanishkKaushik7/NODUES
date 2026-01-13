import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const PerformanceChart = () => {
  // Mock data to match the visual
  const data = [
    { name: 'Library', cleared: 96, pending: 65 },
    { name: 'Hostel', cleared: 56, pending: 77 },
    { name: 'Sports', cleared: 48, pending: 54 },
    { name: 'Labs', cleared: 78, pending: 18 },
    { name: 'Accounts', cleared: 90, pending: 12 },
  ];

  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          Department Performance Overview
        </h3>
        {/* Optional: Filter dropdown */}
        <select className="text-xs border border-slate-200 rounded-md text-slate-500 bg-slate-50 p-1 focus:outline-none">
          <option>Last 30 Days</option>
          <option>This Semester</option>
          <option>All Time</option>
        </select>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
            barSize={32}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
              dy={10}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
            />
            
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: '#ffffff',
                padding: '8px 12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '11px' }}
            />
            
            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingBottom: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-slate-600 font-medium ml-1 text-xs">{value}</span>}
            />
            
            {/* Dark Blue Bar (Cleared) */}
            <Bar 
              dataKey="cleared" 
              name="Cleared" 
              fill="#1e40af" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
            />
            
            {/* Light Blue Bar (Pending) */}
            <Bar 
              dataKey="pending" 
              name="Pending" 
              fill="#93c5fd" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;