import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Landmark, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext'; // Path to your AuthContext

const DashboardStats = () => {
  const { authFetch } = useAuth(); // Use the helper from your context
  const [stats, setStats] = useState({
    totalApps: "N/A",
    pendingApps: "N/A",
    completedApps: "N/A",
    rejectedApps: "N/A"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // authFetch automatically handles:
        // 1. Adding Bearer Token
        // 2. Adding VITE_API_BASE
        // 3. Setting Content-Type: application/json
        const response = await authFetch('/api/admin/dashboard-stats');

        if (response.ok) {
          const data = await response.json();
          
          if (data.metrics) {
            setStats({
              totalApps: data.metrics.total_applications?.toLocaleString() || "0",
              pendingApps: data.metrics.pending?.toLocaleString() || "0",
              completedApps: data.metrics.completed?.toLocaleString() || "0",
              rejectedApps: data.metrics.rejected?.toLocaleString() || "0"
            });
          }
        } else {
          console.error("Stats API failed:", response.statusText);
        }
      } catch (error) {
        console.error("Network Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [authFetch]); // authFetch is a stable dependency

  // ... (statCards array remains the same)
  const statCards = [
    { title: "Total Applications", value: stats.totalApps, icon: Landmark, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Pending Approval", value: stats.pendingApps, icon: Clock, color: "text-orange-600", bgColor: "bg-orange-100" },
    { title: "Cleared Students", value: stats.completedApps, icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-100" },
    { title: "Rejected", value: stats.rejectedApps, icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-100" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">{card.title}</h3>
            <div className={`p-2 rounded-full ${card.bgColor}`}><card.icon className={`h-4 w-4 ${card.color}`} /></div>
          </div>
          <div className="text-2xl font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;