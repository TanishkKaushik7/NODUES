// src/components/dashboard/ApplicationsTable.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCalendar, FiEye, FiList, FiRefreshCw, FiCheckCircle, 
  FiClock, FiXCircle, FiMapPin, FiSearch, FiFilter, FiLoader,
  FiAlertTriangle 
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext'; 

const renderStatusBadge = (status) => {
  const s = (status || '').toString();
  const key = s.toLowerCase().replace(/[\s-]/g, '');
  if (['inprogress', 'in_progress', 'pending'].includes(key)) {
    return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiClock className="mr-1" /> {s}</span>;
  }
  
  return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">{s}</span>;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  } catch (e) { return iso; }
};

const ApplicationsTable = ({ applications, isLoading, onView, onSearch, onRefresh, isViewLoading }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null); 
  const [filterStatus, setFilterStatus] = useState('All'); 
  const itemsPerPage = 50;

  const filteredApps = useMemo(() => {
    if (!applications) return [];
    let result = applications.filter(app => {
      if (['super_admin', 'dean'].includes(user?.role)) return true; 
      const location = (app.current_location || '').toLowerCase();
      const myDept = (user?.department || user?.role || '').toLowerCase();
      return location.includes(myDept);
    });

    if (filterStatus !== 'All') {
        result = result.filter(app => {
            const status = (app.status || '').toLowerCase();
            if (filterStatus === 'Overdue') return app.is_overdue;
            if (filterStatus === 'Pending') return status === 'pending';
            return true;
        });
    }
    return result;
  }, [applications, user, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [applications.length, filterStatus]);

  useEffect(() => {
    if (!isViewLoading) setLoadingId(null);
  }, [isViewLoading]);

  const totalItems = filteredApps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedApplications = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (e) => setCurrentPage(Number(e.target.value));
  const handleViewClick = (app) => {
    setLoadingId(app.id);
    onView(app);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-4 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header & Controls remain the same... */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4 gap-4">
        <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4">
            <div className="flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">Application List</h3>
                {user?.role !== 'super_admin' && (
                    <span className="text-xs text-gray-400 font-medium break-words">Showing requests for: {user?.department || user?.role}</span>
                )}
            </div>
            <button onClick={onRefresh} className="p-2 border border-gray-300 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors duration-200 shadow-sm flex-shrink-0">
                <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 min-w-[140px]">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiFilter className="text-gray-500" /></div>
             <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none w-full border border-gray-300 rounded-lg py-2 pl-9 pr-8 bg-white text-sm font-medium text-gray-700 cursor-pointer">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Overdue"> Overdue</option>
             </select>
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64 bg-gray-50/50">
            <FiSearch className="text-gray-500 mr-2 flex-shrink-0" />
            <input type="text" placeholder="Search..." className="w-full outline-none text-sm bg-transparent" onChange={onSearch} />
          </div>

          {totalItems > itemsPerPage && (
            <select value={currentPage} onChange={handlePageChange} className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm">
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i+1} value={i+1}>Page {i+1}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
          <FiRefreshCw className="animate-spin w-6 h-6 mb-3 text-indigo-500" />
          <p>Loading applications...</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle px-4 md:px-0">
            <table className="min-w-full divide-y divide-gray-200 table-fixed"> {/* ✅ Added table-fixed */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  {/* ✅ FIXED: Set width for Location header */}
                  <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedApplications.map((app) => (
                  <tr key={app.id} className={`transition-colors duration-200 ${app.is_overdue ? 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-l-red-500' : 'hover:bg-indigo-50/50'}`}>
                    <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{app.rollNo || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="truncate font-medium">{app.name || '—'}</div>
                      <div className="text-xs text-gray-400">{app.enrollment}</div>
                    </td>
                    
                    {/* ✅ FIXED: Added truncate and title for location */}
                    <td className="px-4 py-3 text-gray-700 text-sm overflow-hidden">
                       <div 
                         className="flex items-center text-gray-500 max-w-[180px]" 
                         title={app.current_location} // Shows full text on hover
                       >
                         <FiMapPin className="mr-1 text-xs flex-shrink-0" />
                         <span className="truncate">{app.current_location || '—'}</span>
                       </div>
                    </td>
                    
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      <div className='flex flex-col'>
                          <div className='flex items-center text-sm'>
                              <FiCalendar className='mr-1 text-gray-400 flex-shrink-0' />
                              {formatDate(app.date)}
                          </div>
                          {app.is_overdue && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded w-fit">
                                <FiAlertTriangle className="w-3 h-3 flex-shrink-0" /> {app.days_pending}d
                              </span>
                          )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">{renderStatusBadge(app.status)}</td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleViewClick(app)}
                        disabled={isViewLoading && loadingId === app.id}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 inline-flex items-center font-medium p-2 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
                      >
                        {isViewLoading && loadingId === app.id ? (
                          <FiLoader className="animate-spin w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4 mr-1" />
                        )}
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Empty state & Pagination summary remains... */}
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationsTable;