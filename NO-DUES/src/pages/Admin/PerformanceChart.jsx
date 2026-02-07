import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const DEPT_MAP = {
  'Corporate Relations Cell': 'CRC',
  'University Library': 'LIB',
  'Sports Department': 'SPO',
  'Finance & Accounts': 'ACC',
  'Laboratories': 'LAB',
  'Hostel Administration': 'HST',
  'School Dean': 'DEAN',
  'Computer Science & Engineering': 'CSE',
  'Information Technology': 'IT',
  'Staff': 'STAFF'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 shadow-2xl rounded-2xl border border-slate-100 ring-1 ring-black/5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pb-1 border-b border-slate-50">{label}</p>
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-blue-700 flex justify-between gap-6">
            <span>Cleared:</span> <span className="font-mono">{payload[0].value}</span>
          </p>
          <p className="text-xs font-bold text-blue-300 flex justify-between gap-6">
            <span>Pending:</span> <span className="font-mono">{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const PerformanceChart = () => {
  const { authFetch } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        const response = await authFetch('/api/admin/analytics/performance');
        if (response.ok) {
          const rawData = await response.json();
          const chartData = rawData
            .filter(dept => (dept.approved_count + dept.pending_count) > 0) 
            .map(dept => ({
              name: DEPT_MAP[dept.dept_name] || dept.dept_name.substring(0, 3).toUpperCase(),
              cleared: dept.approved_count,
              pending: dept.pending_count
            }));
          setData(chartData);
        }
      } catch (err) {
        console.error("Chart Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformanceData();
  }, [authFetch]);

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-4 p-8">
       <div className="w-full h-48 bg-slate-50 rounded-3xl animate-pulse" />
       <div className="w-1/3 h-3 bg-slate-50 rounded-full animate-pulse" />
    </div>
  );

  // ✅ DYNAMIC WIDTH CALCULATION
  // We ensure each bar group has at least 60px of space.
  const minChartWidth = Math.max(data.length * 60, 400);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex-1 w-full overflow-x-auto no-scrollbar scroll-smooth">
        <div style={{ width: minChartWidth, height: '100%', minHeight: '340px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: -20, bottom: 20 }}
              barSize={10}
              barGap={4}
            >
              <defs>
                <linearGradient id="clearedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e40af" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bfdbfe" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#dbeafe" stopOpacity={1}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                interval={0}
                dy={10}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }}
                allowDecimals={false}
                dx={-5}
              />
              
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 8 }}
                content={<CustomTooltip />}
                wrapperStyle={{ outline: 'none' }} 
              />
              
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ 
                  paddingBottom: '40px', 
                  fontSize: '9px', 
                  fontWeight: 900, 
                  letterSpacing: '0.1em',
                  color: '#94a3b8'
                }}
              />
              
              <Bar 
                dataKey="cleared" 
                name="CLEARED" 
                fill="url(#clearedGradient)" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`c-${index}`} className="hover:opacity-80 transition-opacity cursor-pointer" />
                ))}
              </Bar>

              <Bar 
                dataKey="pending" 
                name="PENDING" 
                fill="url(#pendingGradient)" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`p-${index}`} className="hover:opacity-80 transition-opacity cursor-pointer" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;