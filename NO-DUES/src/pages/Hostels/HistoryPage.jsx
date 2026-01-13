import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiClock, FiCheckCircle, FiXCircle, FiSearch, 
  FiRefreshCw, FiCalendar, FiUser, FiHash 
} from 'react-icons/fi';
import RoleLayout from '../../components/common/RoleLayout';
import { useAuth } from '../../contexts/AuthContext';

const HistoryPage = () => {
  const { authFetch } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/approvals/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.display_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderActionBadge = (action) => {
    const isApproved = action?.toLowerCase() === 'approved';
    return (
      <span className={`flex items-center w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {isApproved ? <FiCheckCircle className="mr-1" /> : <FiXCircle className="mr-1" />}
        {action}
      </span>
    );
  };

  return (
    <RoleLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Approval History</h1>
            <p className="text-gray-500 mt-1 text-sm">Review your past approval and rejection actions</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search history..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 bg-white shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchHistory}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 shadow-sm transition-colors"
            >
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Retrieving history records...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Student Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Remarks</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredHistory.map((item, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.timestamp + index}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5">
                            <FiUser className="text-indigo-400 shrink-0" /> {item.student_name}
                          </span>
                          <span className="text-xs font-mono font-medium text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                            {item.display_id}
                          </span>
                          <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                             <FiHash className="text-gray-300" /> {item.roll_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {renderActionBadge(item.action)}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-600 italic max-w-xs truncate" title={item.remarks}>
                          "{item.remarks || 'No remarks provided'}"
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <FiCalendar className="text-gray-400" /> 
                            {new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <FiClock className="text-gray-300" /> 
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <FiClock className="text-gray-300 text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No history found</h3>
            <p className="text-gray-500">You haven't performed any approval actions yet.</p>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default HistoryPage;