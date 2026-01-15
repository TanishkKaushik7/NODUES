import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { motion } from 'framer-motion';
import { 
  FiCalendar, FiEye, FiList, FiRefreshCw, FiCheckCircle, 
  FiClock, FiXCircle, FiMapPin, FiSearch, FiFilter, FiLoader 
} from 'react-icons/fi';
// ✅ Import Auth Context to get the current user's department
import { useAuth } from '../../contexts/AuthContext'; 

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// --- Helper Functions ---
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

const renderStatusBadge = (status) => {
  const s = (status || '').toString();
  const key = s.toLowerCase().replace(/[\s-]/g, '');
  if (['cleared', 'approved'].includes(key)) {
    return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiCheckCircle className="mr-1" /> {s}</span>;
  }
  if (['inprogress', 'in_progress', 'pending'].includes(key)) {
    return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiClock className="mr-1" /> {s}</span>;
  }
  if (['rejected', 'denied'].includes(key)) {
    return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiXCircle className="mr-1" /> {s}</span>;
  }
  return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">{s}</span>;
};

const ApplicationsTable = ({ applications, isLoading, onView, onSearch, onRefresh, isViewLoading }) => {
  const { user } = useAuth(); // ✅ Get current user info
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null); 
  const itemsPerPage = 50;

  // ✅ FILTERING LOGIC
  // Only show applications relevant to the logged-in user's department
  const filteredApps = useMemo(() => {
    if (!applications) return [];
    
    return applications.filter(app => {
      // 1. Super Admins / Deans see everything
      if (['super_admin', 'dean'].includes(user?.role)) {
        return true; 
      }

      // 2. Departments only see apps currently at their location
      // Using .includes() handles cases like "Pending at: Library" vs just "Library"
      const location = (app.current_location || '').toLowerCase();
      const myDept = (user?.department || user?.role || '').toLowerCase();

      // Fix for "School of ICT" needing to match specific location names if they differ
      // or simply matching the department name.
      return location.includes(myDept);
    });
  }, [applications, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [applications.length]);

  useEffect(() => {
    if (!isViewLoading) {
      setLoadingId(null);
    }
  }, [isViewLoading]);

  // ✅ Use filteredApps instead of raw applications for pagination
  const totalItems = filteredApps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedApplications = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.value));
  };

  const handleViewClick = (app) => {
    setLoadingId(app.id);
    onView(app);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4 gap-4">
        <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">
            Application List
            </h3>
            {/* Optional: Show what view mode the user is in */}
            {user?.role !== 'super_admin' && (
                <span className="text-xs text-gray-400 font-medium">
                    Showing requests for: {user?.department || user?.role}
                </span>
            )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64 transition-shadow duration-300 focus-within:shadow-md focus-within:border-indigo-500 bg-gray-50/50">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full outline-none text-sm bg-transparent"
              onChange={onSearch}
            />
          </div>

          {/* Pagination Dropdown */}
          {totalItems > itemsPerPage && (
            <div className="relative w-full md:w-auto">
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors">
                <FiFilter className="text-gray-500 mr-2" />
                <select
                  value={currentPage}
                  onChange={handlePageChange}
                  className="appearance-none bg-transparent outline-none text-sm text-gray-700 font-medium cursor-pointer pr-6"
                  style={{ minWidth: '80px' }}
                >
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    const start = (pageNum - 1) * itemsPerPage + 1;
                    const end = Math.min(pageNum * itemsPerPage, totalItems);
                    return (
                      <option key={pageNum} value={pageNum}>
                        {start} - {end}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 border border-gray-300 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors duration-200 shadow-sm flex-shrink-0"
            title="Refresh Data"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {/* Table Content */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
          <FiRefreshCw className="animate-spin w-6 h-6 mb-3 text-indigo-500" />
          <p>Loading applications...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Roll No', 'Name', 'Location', 'Date', 'Status', 'Action'].map(head => (
                   <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedApplications.map((app) => (
                <tr 
                  key={app.id} 
                  className="hover:bg-indigo-50/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-gray-900 font-semibold">{app.rollNo || '—'}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <div>{app.name || '—'}</div>
                    <div className="text-xs text-gray-400">{app.enrollment}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">
                     <div className="flex items-center text-gray-500">
                        <FiMapPin className="mr-1 text-xs" />
                        {app.current_location || '—'}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className='flex items-center text-sm'>
                        <FiCalendar className='mr-1 text-gray-400' />
                        {formatDate(app.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">{renderStatusBadge(app.status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewClick(app)}
                      disabled={isViewLoading && loadingId === app.id}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center font-medium p-2 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
                    >
                      {isViewLoading && loadingId === app.id ? (
                        <FiLoader className="animate-spin mr-1 w-4 h-4" />
                      ) : (
                        <FiEye className="mr-1 w-4 h-4" />
                      )}
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApps.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-lg">
              <FiList className='mx-auto w-8 h-8 mb-2 text-gray-400' />
              {/* Contextual empty state message */}
              {user?.role !== 'super_admin' 
                 ? "No pending applications at your department."
                 : "No applications found."}
            </div>
          )}
          
          {!isLoading && filteredApps.length > 0 && (
            <div className="mt-4 text-xs text-gray-400 text-right px-2">
              Showing {Math.min(filteredApps.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} applications
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationsTable;