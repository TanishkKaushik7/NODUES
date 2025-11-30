import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // ADDED: Import motion for animations
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { 
  FiEye, FiX, FiCheck, FiDownload, FiCheckCircle, FiClock, FiXCircle,
  FiSearch, FiFilter, FiRefreshCw, FiUsers, FiCalendar, FiList // ADDED: Icons for new UI
} from 'react-icons/fi';

// Animation variants (Copied from DepartmentDashboard)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const cardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
};


const LibraryDashboard = () => {
  const { user, logout, authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // ADDED: Filter state
  const [isLoading, setIsLoading] = useState(true); // ADDED: Loading state
  
  // Action State
  const [actionDeptId, setActionDeptId] = useState(null);
  const [actionRemark, setActionRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const applicationPopupRef = useRef(null);
  
  const menuItems = [
    { id: 1, label: 'Dashboard', path: '/library/dashboard' },
    { id: 2, label: 'Pending', path: '/library/pending' },
    { id: 3, label: 'History', path: '/library/history' },
  ];

  const DEPARTMENTS = [
    { id: 1, name: 'Department' },
    { id: 2, name: 'Library' }, // Library ID is 2
    { id: 3, name: 'Hostel' },
    { id: 4, name: 'Accounts' },
    { id: 5, name: 'Sports' },
    { id: 6, name: 'Exam Cell' }
  ];

  // Helper: Format Date
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

  // Helper: Render Status Badge (Updated to use DepartmentDashboard's status logic)
  const renderStatusBadge = (status) => {
    const s = (status || '').toString();
    const key = s.toLowerCase().replace(/[\s-]/g, ''); // Normalise the key
    if (['cleared', 'approved'].includes(key)) {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiCheckCircle className="mr-1" /> {s}
        </span>
      );
    }
    // Combined pending and in progress
    if (['inprogress', 'in_progress', 'in-progress', 'in progress', 'pending'].includes(key)) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiClock className="mr-1" /> {s}
        </span>
      );
    }
    if (['rejected', 'denied'].includes(key)) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiXCircle className="mr-1" /> {s}
        </span>
      );
    }
    return (
      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
        {s}
      </span>
    );
  };

  // Fetch Applications (Updated with loading state and match property for search)
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // Fetch Enriched Data
      const enrichedRes = await authFetch('/api/approvals/all/enriched', { method: 'GET' });
      let enriched = [];
      try { enriched = await enrichedRes.json(); } catch (e) { enriched = []; }

      // Fetch Full Data (for stage_id)
      const allRes = await authFetch('/api/approvals/all', { method: 'GET' });
      let allData = [];
      try { allData = await allRes.json(); } catch (e) { allData = []; }

      const mapByAppId = new Map();
      if (Array.isArray(allData)) {
        for (const rec of allData) {
          const id = rec.application_id || rec.id || rec._id;
          if (id) mapByAppId.set(String(id), rec);
        }
      }

      const allApplications = Array.isArray(enriched)
        ? enriched.map(app => {
            const appId = app.application_id || app.id || app._id;
            const full = appId ? mapByAppId.get(String(appId)) : null;
            return {
              id: appId,
              application_id: appId,
              rollNo: app.roll_number || app.rollNo || app.student_roll_no || '',
              enrollment: app.enrollment_number || app.enrollmentNumber || '',
              name: app.student_name || app.name || app.full_name || '',
              date: app.created_at || app.application_date || app.date || '',
              status: app.application_status || app.status || 'Pending',
              course: app.course || app.student_course || '',
              email: app.student_email || app.email || '',
              mobile: app.student_mobile || app.mobile || '',
              department: app.department_name || app.department || '',
              active_stage: (full && full.active_stage) ? full.active_stage : (app.active_stage || app.activeStage || null),
              match: true, // ADDED: For search functionality
            };
          })
        : [];
      setApplications(allApplications.filter(app => app.id));
    } catch (err) {
      setApplications([]);
      console.error('Failed to fetch applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [authFetch]);

  // Close popup logic (Updated to clear action state on close)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (applicationPopupRef.current && !applicationPopupRef.current.contains(event.target)) {
        setSelectedApplication(null);
        setActionRemark(''); 
        setActionError('');
        setActionDeptId(null);
      }
    };
    if (selectedApplication) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedApplication]);

  // ADDED: Set initial actionDeptId to Library's ID (2)
  useEffect(() => {
      if (selectedApplication) {
          const LIBRARY_DEPT_ID = 2; 
          setActionDeptId(LIBRARY_DEPT_ID);
      }
  }, [selectedApplication]);

  // Handle Action (Approve/Reject)
  const handleDepartmentAction = async (application, departmentId, action, remarksIn) => {
    if (!application) return;
    
    setActionError(''); // Reset error on new action attempt

    if (action === 'reject' && (!remarksIn || !remarksIn.trim())) {
      setActionError('Remarks are required when rejecting');
      return;
    }
  
    const stageId = application?.active_stage?.stage_id || application?.active_stage?.id || null;
    const appId = application?.application_id || application?.id || null;
    if (!stageId) {
      setActionError('Missing stage id; cannot perform department action.');
      return;
    }
  
    const verb = action === 'approve' ? 'approve' : 'reject';
    const stageEndpoint = `/api/approvals/${stageId}/${verb}`;
    const fallbackEndpoint = appId ? `/api/approvals/${appId}/stages/${stageId}/${verb}` : null;
    const payload = { department_id: departmentId || null, remarks: remarksIn || null };
  
    setActionLoading(true);
    setActionError('');
  
    const call = async (url, options) => {
      let res = await authFetch(url, options);
      if (res && res.status === 405) {
        try { res = await authFetch(url, { method: 'POST' }); } catch (_) {}
      }
      if (res && res.status === 401) {
        try {
          res = await authFetch(url, options);
          if (res && res.status === 405) {
            try { res = await authFetch(url, { method: 'POST' }); } catch (_) {}
          }
        } catch (_) {}
      }
      return res;
    };
  
    try {
      const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
      let res = await call(stageEndpoint, options);
  
      if ((!res || !res.ok) && fallbackEndpoint) {
        res = await call(fallbackEndpoint, options);
      }
  
      if (!res || !res.ok) {
        let body = null;
        try { body = await res?.json(); } catch (_) { body = null; }
        throw new Error(body?.message || `Action failed: ${res?.status || 'no response'}`);
      }
  
      // Update UI
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      const updatedApplications = applications.map(app =>
        (app.application_id || app.id || '').toString() === (appId || '').toString()
          ? {
              ...app,
              status: newStatus,
              department: DEPARTMENTS.find(d => d.id === departmentId)?.name || app.department,
              active_stage: app.active_stage ? { ...app.active_stage, status: newStatus } : app.active_stage
            }
          : app
      );
  
      setApplications(updatedApplications);
      setSelectedApplication(prev => prev && ((prev.application_id || prev.id || '').toString() === (appId || '').toString())
        ? { ...prev, status: newStatus, department: DEPARTMENTS.find(d => d.id === departmentId)?.name || prev.department, active_stage: prev.active_stage ? { ...prev.active_stage, status: newStatus } : prev.active_stage }
        : prev
      );

      // Close popup on success
      setActionRemark('');
      setSelectedApplication(null);
  
      alert(`Action ${action} succeeded`);
    } catch (err) {
      console.error('Department stage action failed', err);
      setActionError(err?.message || String(err));
      alert(`Action failed: ${err?.message || String(err)}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // ADDED: Filtering and Search logic
  const filteredApplications = applications.filter(
    (a) =>
      a.match !== false && (filterStatus === 'all' || (a.status || '').toLowerCase().replace(/[\s-]/g, '') === filterStatus.toLowerCase().replace(/[\s-]/g, ''))
  );

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setApplications((prev) =>
      prev.map((a) => ({
        ...a,
        match: (a.name + a.rollNo + a.enrollment + a.course).toLowerCase().includes(q),
      }))
    );
  };
  
  // Helper for stats
  const getStatusCount = (statusKey) => {
    return applications.filter((a) => (a.status || '').toLowerCase().replace(/[\s-]/g, '') === statusKey).length;
  };

  const totalCount = applications.length;
  const pendingCount = getStatusCount('pending') + getStatusCount('inprogress');
  const approvedCount = getStatusCount('approved') + getStatusCount('cleared');
  const rejectedCount = getStatusCount('rejected') + getStatusCount('denied');


  // NEW: renderApplicationsTable function
  const renderApplicationsTable = (apps) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Roll No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <motion.tbody 
          className="bg-white divide-y divide-gray-200"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {apps.map((app, index) => (
            <motion.tr 
              key={app.id} 
              className="hover:bg-indigo-50/50 transition-colors duration-200"
              variants={itemVariants}
            >
              <td className="px-6 py-4 text-gray-900 font-semibold">{app.rollNo || '—'}</td>
              <td className="px-6 py-4 text-gray-700">{app.name || '—'}</td>
              <td className="px-6 py-4 text-gray-700">{app.course || '—'}</td>
              <td className="px-6 py-4 text-gray-700">
                <div className='flex items-center'>
                    <FiCalendar className='mr-1 text-gray-400 text-sm' />
                    {formatDate(app.date)}
                </div>
              </td>
              <td className="px-6 py-4">
                {renderStatusBadge(app.status)}
              </td>
              <td className="px-6 py-4">
                <button
                    onClick={() => {
                        setSelectedApplication(app);
                        setActionRemark('');
                        setActionError('');
                        setActionDeptId(null); // This will trigger the useEffect hook to reset it
                    }}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center font-medium p-2 rounded-lg hover:bg-indigo-100"
                    aria-label={`View application for ${app.name}`}
                >
                  <FiEye className="mr-1 w-4 h-4" /> View
                </button>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>

      {/* No Data */}
      {apps.length === 0 && (
        <div className="py-12 text-center text-gray-500 text-lg">
          <FiList className='mx-auto w-8 h-8 mb-2 text-gray-400' />
          {isLoading ? 'Loading...' : 'No applications found for the current filters.'}
        </div>
      )}
    </div>
  );


  const renderApplicationPopup = () => {
    if (!selectedApplication) return null;

    // Get current user's department name for display
    const userDepartmentName = user?.department_name || 'Library';
    const LIBRARY_DEPT_ID = 2;

    // FIX: Check if application is in an actionable state (Pending or In Progress)
    const statusKey = (selectedApplication.status || '').toLowerCase().replace(/[\s-]/g, '');
    const isActionable = ['pending', 'inprogress', 'in_progress'].includes(statusKey);

    return (
      <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
        <motion.div 
          ref={applicationPopupRef}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <p className="text-sm text-gray-500 mt-1">Review and take action on this application</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Application Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedApplication.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Roll Number</label>
                  <p className="text-gray-900">{selectedApplication.rollNo || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrollment Number</label>
                  <p className="text-gray-900">{selectedApplication.enrollment ?? '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Course</label>
                  <p className="text-gray-900">{selectedApplication.course ?? '—'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedApplication.email ?? '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile</label>
                  <p className="text-gray-900">{selectedApplication.mobile ?? '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Date</label>
                  <p className="text-gray-900">{formatDate(selectedApplication.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{renderStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>
            </div>

            {/* Action Section (Only show if actionable - PENDING or IN PROGRESS) */}
            {isActionable && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Department Action</h3>
                
                <div className="space-y-4">
                    
                    {/* FIXED: Display Current Department statically */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Actioning Department
                        </label>
                        <div className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2.5 font-semibold text-gray-900 shadow-sm">
                            {userDepartmentName}
                        </div>
                    </div>
                    {/* END FIXED */}

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remark (required for rejection)
                    </label>
                    <textarea 
                        value={actionRemark} 
                        onChange={(e) => setActionRemark(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your remarks here..."
                    />
                    {actionError && (
                        <p className="text-red-600 text-sm mt-2">{actionError}</p>
                    )}
                    </div>

                    <div className="flex space-x-3">
                    <button
                        disabled={actionLoading || !actionDeptId}
                        onClick={() => handleDepartmentAction(
                            selectedApplication, 
                            LIBRARY_DEPT_ID, // Use fixed ID
                            'approve', 
                            actionRemark
                        )}
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <FiCheck className="mr-2" />
                        {actionLoading && actionDeptId && actionRemark !== 'reject' ? 'Processing...' : 'Approve'}
                    </button>
                    
                    <button
                        disabled={actionLoading || !actionDeptId}
                        onClick={() => handleDepartmentAction(
                            selectedApplication, 
                            LIBRARY_DEPT_ID, // Use fixed ID
                            'reject', 
                            actionRemark
                        )}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <FiX className="mr-2" />
                        {actionLoading && actionDeptId && actionRemark === 'reject' ? 'Processing...' : 'Reject'}
                    </button>
                    </div>
                </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center transition-colors">
                <FiDownload className="mr-2" />
                Download Documents
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // REFACTORED: Main content structure
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header Section */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-extrabold mb-1 text-gray-900">
                        Library Review
                    </h1>
                    <p className="text-gray-600 mb-6">Welcome, {user?.name}. Review and process pending No-Dues applications.</p>
                </motion.div>

                {/* Stats Section */}
                <motion.div 
                    className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    variants={containerVariants}
                    initial="initial" animate="animate"
                >
                    <motion.div 
                        className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-indigo-500 transition-shadow duration-300 hover:shadow-xl"
                        variants={cardVariants} initial="initial" animate="animate" whileHover="hover"
                    >
                        <div className='flex items-center justify-between'>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Total</p>
                            <FiUsers className='text-indigo-500 text-xl' />
                        </div>
                        <p className="text-3xl font-bold mt-1 text-gray-900">{totalCount}</p>
                    </motion.div>

                    <motion.div 
                        className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-yellow-500 transition-shadow duration-300 hover:shadow-xl"
                        variants={cardVariants} initial="initial" animate="animate" whileHover="hover"
                    >
                        <div className='flex items-center justify-between'>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Pending</p>
                            <FiClock className='text-yellow-500 text-xl' />
                        </div>
                        <p className="text-3xl font-bold mt-1 text-yellow-600">
                            {pendingCount}
                        </p>
                    </motion.div>

                    <motion.div 
                        className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-green-500 transition-shadow duration-300 hover:shadow-xl"
                        variants={cardVariants} initial="initial" animate="animate" whileHover="hover"
                    >
                        <div className='flex items-center justify-between'>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Approved</p>
                            <FiCheckCircle className='text-green-500 text-xl' />
                        </div>
                        <p className="text-3xl font-bold mt-1 text-green-600">
                            {approvedCount}
                        </p>
                    </motion.div>

                    <motion.div 
                        className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-red-500 transition-shadow duration-300 hover:shadow-xl"
                        variants={cardVariants} initial="initial" animate="animate" whileHover="hover"
                    >
                        <div className='flex items-center justify-between'>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Rejected</p>
                            <FiXCircle className='text-red-500 text-xl' />
                        </div>
                        <p className="text-3xl font-bold mt-1 text-red-600">
                            {rejectedCount}
                        </p>
                    </motion.div>
                </motion.div>

                {/* Search + Filter + Refresh */}
                <motion.div 
                    className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 p-4 bg-white rounded-xl shadow"
                    variants={itemVariants}
                >

                    {/* Search Bar */}
                    <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 transition-shadow duration-300 focus-within:shadow-md focus-within:border-indigo-500">
                        <FiSearch className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search by name, roll number, or course..."
                            className="w-full outline-none text-sm bg-transparent"
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Filter & Refresh */}
                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                        <div className='relative flex items-center'>
                             <FiFilter className="absolute left-3 text-gray-500 w-4 h-4 pointer-events-none" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white transition-colors duration-200 hover:border-indigo-500 cursor-pointer"
                            >
                                <option value="all">All Applications</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <button
                            onClick={fetchApplications} // Use the dedicated fetch function for refresh
                            className="p-2.5 border border-gray-300 rounded-lg hover:bg-indigo-100/50 transition-colors duration-200 text-gray-600 shadow-sm"
                            title="Refresh Data"
                        >
                            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </motion.div>

                {/* Applications Table */}
                <motion.div 
                    className="bg-white rounded-xl shadow-lg p-6"
                    variants={itemVariants}
                >
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Application List</h3>
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                            <FiRefreshCw className="animate-spin w-6 h-6 mb-3 text-indigo-500" />
                            <p>Loading applications...</p>
                        </div>
                    ) : (
                        renderApplicationsTable(filteredApplications)
                    )}
                </motion.div>
            </motion.div>
        </main>
      </div>
      
      {/* Popup Modal */}
      {renderApplicationPopup()}
    </div>
  );
};

export default LibraryDashboard;