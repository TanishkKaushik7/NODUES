import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const DEPT_MAP = {
  'Crc': 'CRC',
  'Library': 'LIB',
  'Sports': 'SPO',
  'Accounts': 'ACC',
  'Laboratories': 'LAB',
  'Hostel': 'HST',
  'Dean': 'SCHOOLS',
  'Lab': 'LAB',
  'Account': 'ACC'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 shadow-2xl rounded-2xl border border-white/20">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-xs font-bold text-blue-700 flex justify-between gap-4">
            <span>Cleared:</span> <span className="font-mono">{payload[0].value}</span>
          </p>
          <p className="text-xs font-bold text-blue-300 flex justify-between gap-4">
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
          const chartData = rawData.map(dept => ({
            name: DEPT_MAP[dept.dept_name] || dept.dept_name.toUpperCase().substring(0, 3),
            cleared: dept.approved_count,
            pending: dept.pending_count
          }));
          setData(chartData);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPerformanceData();
  }, [authFetch]);

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-3 animate-pulse">
       <div className="w-full h-48 bg-slate-50 rounded-3xl" />
       <div className="w-1/2 h-4 bg-slate-50 rounded-full" />
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col p-2">
      <div className="flex-1 w-full min-h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            barSize={14}
            barGap={8}
            style={{ outline: 'none' }} 
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

            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f8fafc" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }} 
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
              cursor={{ fill: '#f1f5f9', radius: 10 }}
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none' }} 
            />
            
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ 
                paddingBottom: '30px', 
                fontSize: '9px', 
                fontWeight: 900, 
                letterSpacing: '0.1em',
                color: '#94a3b8',
                outline: 'none' 
              }}
            />
            
            <Bar 
              dataKey="cleared" 
              name="CLEARED" 
              fill="url(#clearedGradient)" 
              radius={[10, 10, 0, 0]} 
              animationDuration={1500}
              /* ✅ FIX: Removes outline from the Bar component */
              style={{ outline: 'none' }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-cleared-${index}`} 
                  className="hover:opacity-80 transition-opacity cursor-pointer" 
                  style={{ outline: 'none' }} // ✅ FIX
                />
              ))}
            </Bar>

            <Bar 
              dataKey="pending" 
              name="PENDING" 
              fill="url(#pendingGradient)" 
              radius={[10, 10, 0, 0]} 
              animationDuration={1500}
              style={{ outline: 'none' }} // ✅ FIX
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-pending-${index}`} 
                  className="hover:opacity-80 transition-opacity cursor-pointer" 
                  style={{ outline: 'none' }} // ✅ FIX
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;