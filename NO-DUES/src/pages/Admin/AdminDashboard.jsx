import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // <-- ADDED: Framer Motion import
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import AdminSidebar from './adminsidebar';
import { 
  FiSearch, FiUser, FiMail, FiBook, FiDollarSign, FiCheckCircle, 
  FiXCircle, FiUpload, FiDownload, FiCheck, FiX, FiMessageSquare, 
  FiClock, FiArchive, FiList, FiEdit3, FiFilter, FiEye, FiRefreshCw,
  FiUsers, // Added for stats
  FiCalendar, // Added for date in table
} from 'react-icons/fi';

// Animation variants (COPIED FROM DEPARTMENT DASHBOARD)
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

const AdminDashboard = () => {
  const { user, logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rollNo, setRollNo] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    cancellationCheque: null,
    aadharCard: null,
    result: null
  });

  // State for applications
  const [applications, setApplications] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Application list loading state
  const [isListLoading, setIsListLoading] = useState(false); 
  
  // Action State
  const [actionDeptId, setActionDeptId] = useState(null);
  const [actionRemark, setActionRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Ref for popup (for click outside logic)
  const applicationPopupRef = useRef(null); 

  // Checklist state
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: 'Verify all documents are submitted', status: null, comment: '', showComment: false },
    { id: 2, text: 'Confirm fee payment status', status: null, comment: '', showComment: false },
    { id: 3, text: 'Check library book return status', status: null, comment: '', showComment: false },
    { id: 4, text: 'Verify hostel clearance', status: null, comment: '', showComment: false },
    { id: 5, text: 'Confirm no pending lab dues', status: null, comment: '', showComment: false }
  ]);

  // Create user form state (kept for completeness)
  const [createRole, setCreateRole] = useState('Admin');
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [createErrors, setCreateErrors] = useState({});

  const officeMenuItems = [
    { id: 1, label: 'Dashboard', path: '/Admin/dashboard', icon: FiList },
    { id: 2, label: 'Pending Applications', path: '/Admin/pending', icon: FiClock },
    { id: 3, label: 'Application History', path: '/Admin/history', icon: FiArchive },
    // Removed 'Create User' to keep the sidebar cleaner, assuming it's accessed elsewhere or via a separate button
    // { id: 4, label: 'Create User', path: '/Admin/create-user', icon: FiUser },
  ];

  const BASE_API_URL = 'https://gbubackend-gbubackend.pagekite.me';

  // --- START: UI Helper Functions (Adopted from Department Dashboard) ---

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
    const key = s.toLowerCase();
    if (['cleared', 'approved'].includes(key)) {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center w-fit border border-green-200">
          <FiCheckCircle className="mr-1 w-3 h-3" /> {s}
        </span>
      );
    }
    if (['pending', 'inprogress', 'in_progress', 'in-progress', 'in progress'].includes(key)) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center w-fit border border-yellow-200">
          <FiClock className="mr-1 w-3 h-3" /> {s}
        </span>
      );
    }
    if (['rejected', 'denied'].includes(key)) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center w-fit border border-red-200">
          <FiXCircle className="mr-1 w-3 h-3" /> {s}
        </span>
      );
    }
    return (
      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center w-fit border border-gray-200">
        {s}
      </span>
    );
  };
  
  // --- END: UI Helper Functions ---
  
  // Utility function for robust API calling (LOGIC - PRESERVED)
  const call = async (url, options) => {
    let res = await authFetch(url, options);
    // Added 405/401 retry logic based on LibraryDashboard.jsx
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

  // NEW: Refactored fetch logic into a reusable function (LOGIC - PRESERVED)
  const fetchApplications = async () => { 
    setIsListLoading(true);
    try {
      // 1. Fetch Enriched Data (for display fields)
      const enrichedRes = await authFetch(`${BASE_API_URL}/api/approvals/all/enriched`, { method: 'GET' });
      let enriched = [];
      try { enriched = await enrichedRes.json(); } catch (e) { enriched = []; }

      // 2. Fetch Full Data (for active_stage/stage_id - necessary for action logic)
      const allRes = await authFetch(`${BASE_API_URL}/api/approvals/all`, { method: 'GET' });
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
              status: app.application_status || app.status || '',
              course: app.course || app.student_course || '',
              email: app.student_email || app.email || '',
              mobile: app.student_mobile || app.mobile || '',
              department: app.department_name || app.department || '',
              active_stage: (full && full.active_stage) ? full.active_stage : (app.active_stage || app.activeStage || null), // CRUCIAL
            };
          })
        : [];

      setApplications(allApplications);
      // Filter logic preserved for Pending/Approved lists
      setPendingApplications(allApplications.filter(app => app.status === 'Pending' || app.status === 'Rejected'));
      setApprovedApplications(allApplications.filter(app => app.status === 'Approved'));
    } catch (err) {
      setApplications([]);
      setPendingApplications([]);
      setApprovedApplications([]);
      console.error('Failed to fetch applications:', err);
    } finally {
      setIsListLoading(false);
    }
  };


  // Load all applications from backend on component mount and handle click outside (LOGIC - PRESERVED)
  useEffect(() => {
    fetchApplications();
    
    // Logic to close popup when clicking outside (re-integrated)
    const handleClickOutside = (event) => {
      if (applicationPopupRef.current && !applicationPopupRef.current.contains(event.target)) {
        setSelectedApplication(null);
      }
    };
    if (selectedApplication) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [authFetch, selectedApplication]);

  // Checklist handlers (LOGIC - PRESERVED)
  const handleStatusChange = (id, status) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status, showComment: status === 'disapprove' ? true : item.showComment }
        : item
    ));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateMessage('');
    const errs = {};
    if (!createName) errs.name = 'Name is required';
    if (!createEmail) errs.email = 'Email is required';
    if (!createPassword) errs.password = 'Password is required';
    setCreateErrors(errs);
    if (Object.keys(errs).length) return;

    setCreateSubmitting(true);
    try {
      const res = await authFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: createName, email: createEmail, password: createPassword, role: createRole })
      });
      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }
      if (!res.ok) {
        if (body && body.errors) {
          const mapped = {};
          for (const k of Object.keys(body.errors)) mapped[k] = Array.isArray(body.errors[k]) ? body.errors[k][0] : String(body.errors[k]);
          setCreateErrors(mapped);
          setCreateMessage('Please fix the highlighted fields');
        } else {
          setCreateMessage(body && body.message ? body.message : `Create failed: ${res.status}`);
        }
      } else {
        setCreateMessage('User created successfully');
        setCreateName(''); setCreateEmail(''); setCreatePassword(''); setCreateRole('Library');
      }
    } catch (err) {
      console.error('Create user failed', err);
      setCreateMessage(err?.message || 'Create user failed');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const toggleComment = (id) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, showComment: !item.showComment }
        : item
    ));
  };

  const updateComment = (id, comment) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, comment }
        : item
    ));
  };

  // Mock student database (LOGIC - PRESERVED)
  const mockStudentDatabase = [
    { rollNo: '12345', name: 'Alice Smith', email: 'alice@gbu.in', course: 'B.Tech CSE', semester: 8, feesStatus: 'Approved', libraryStatus: 'Pending', hostelStatus: 'Approved', noDuesStatus: 'In Progress' },
    { rollNo: '67890', name: 'Bob Johnson', email: 'bob@gbu.in', course: 'MBA', semester: 4, feesStatus: 'Pending', libraryStatus: 'Approved', hostelStatus: 'Rejected', noDuesStatus: 'Rejected' },
  ];

  // Search handler (LOGIC - PRESERVED)
  const handleSearch = (e) => {
    e.preventDefault();
    if (!rollNo) return;
    
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const student = mockStudentDatabase.find(s => s.rollNo === rollNo);
      setStudentData(student || null);
      setIsLoading(false);
    }, 800);
  };

  const DEPARTMENTS = [
    { id: 1, name: 'Department' },
    { id: 2, name: 'Library' },
    { id: 3, name: 'Hostel' },
    { id: 4, name: 'Accounts' },
    { id: 5, name: 'Sports' },
    { id: 6, name: 'Exam Cell' }
  ];


  const handleFileUpload = (fileType, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleSubmitNoDues = () => {
    // In a real application, this would submit the data to the backend
    alert('No-Dues application submitted successfully!');
    // Reset form
    setStudentData(null);
    setRollNo('');
    setUploadedFiles({
      cancellationCheque: null,
      aadharCard: null,
      result: null
    });
    // Reset checklist
    setChecklistItems([
      { id: 1, text: 'Verify all documents are submitted', status: null, comment: '', showComment: false },
      { id: 2, text: 'Confirm fee payment status', status: null, comment: '', showComment: false },
      { id: 3, text: 'Check library book return status', status: null, comment: '', showComment: false },
      { id: 4, text: 'Verify hostel clearance', status: null, comment: '', showComment: false },
      { id: 5, text: 'Confirm no pending lab dues', status: null, comment: '', showComment: false }
    ]);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    // Find the student data for this application
    const student = mockStudentDatabase.find(s => s.rollNo === application.rollNo);
    setStudentData(student);
    // Set default department ID for action based on application department
    const defaultDeptId = DEPARTMENTS.find(d => d.name === application.department)?.id || null;
    setActionDeptId(defaultDeptId);
    setActionRemark('');
    setActionError('');
  };

  // Department Action Logic (LOGIC - PRESERVED)
  const handleDepartmentAction = async (application, departmentId, action, remarksIn) => {
    // action: 'approve' | 'reject'
    if (!application) return;
    if (!departmentId) {
        setActionError('Please select a department/stage to perform an action.');
        return;
    }
    if (action === 'reject' && (!remarksIn || !remarksIn.trim())) {
      setActionError('Remark is required when rejecting');
      return;
    }

    // CRUCIAL: Get stageId (UUID) from active_stage
    const stageId = application?.active_stage?.stage_id || application?.active_stage?.id || null;
    const appId = application?.application_id || application?.id || null;
    
    if (!stageId) {
      setActionError('Missing active stage id; cannot perform department action. Please refresh and ensure active_stage data is available.');
      return;
    }

    const verb = action === 'approve' ? 'approve' : 'reject';
    // Use the stageId (UUID) in the primary endpoint
    const stageEndpoint = `${BASE_API_URL}/api/approvals/${stageId}/${verb}`;
    // Include fallback logic
    const fallbackEndpoint = appId ? `${BASE_API_URL}/api/approvals/${appId}/stages/${stageId}/${verb}` : null; 
    
    // department_id is sent in the payload
    const payload = { department_id: departmentId, remarks: remarksIn || null };

    setActionLoading(true);
    setActionError('');
    
    try {
      const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
      
      let res = await call(stageEndpoint, options); 

      // Fallback logic
      if ((!res || !res.ok) && fallbackEndpoint) {
        res = await call(fallbackEndpoint, options);
      }

      if (!res || !res.ok) {
        let body = null;
        try { body = await res?.json(); } catch (_) { body = null; }
        // The error response is returned to the user
        throw new Error(body?.message || `Action failed: ${res?.status || 'no response'}`);
      }

      // Update UI state
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      const departmentName = DEPARTMENTS.find(d => d.id === departmentId)?.name || application.department;
      
      const updatedApplications = applications.map(app =>
        (app.application_id || app.id || '').toString() === (appId || '').toString()
          ? {
              ...app,
              status: newStatus,
              department: departmentName,
              active_stage: app.active_stage ? { ...app.active_stage, status: newStatus } : app.active_stage
            }
          : app
      );

      setApplications(updatedApplications);
      setPendingApplications(updatedApplications.filter(app => app.status === 'Pending' || app.status === 'Rejected'));
      setApprovedApplications(updatedApplications.filter(app => app.status === 'Approved'));
      setSelectedApplication(prev => prev && ((prev.application_id || prev.id || '').toString() === (appId || '').toString())
        ? { ...prev, status: newStatus, department: departmentName, active_stage: prev.active_stage ? { ...prev.active_stage, status: newStatus } : prev.active_stage }
        : prev
      );

      setActionLoading(false);
      setActionRemark(''); // Clear remark on success
      alert(`Action ${action} succeeded`);

    } catch (e) {
      console.error('Department action failed:', e);
      setActionError(e?.message || String(e));
      setActionLoading(false);
    }
  };

  // --- START: New UI Components ---

  const renderDashboardStats = () => {
    // Calculate stats
    const totalApplications = applications.length;
    const pendingCount = pendingApplications.filter(a => a.status === 'Pending').length;
    const approvedCount = approvedApplications.length;
    const rejectedCount = applications.filter(a => a.status === 'Rejected').length; // Rejected are in the pending list, but calculated from all applications for accuracy

    const stats = [
        { title: 'Total Applications', value: totalApplications, icon: FiUsers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Pending Review', value: pendingCount, icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { title: 'Approved', value: approvedCount, icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Rejected', value: rejectedCount, icon: FiXCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8" 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
        >
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    className={`p-5 rounded-xl shadow-lg border border-gray-100 ${stat.bg}`}
                    variants={cardVariants}
                    whileHover="hover"
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center">
                        <stat.icon className={`w-6 h-6 mr-3 ${stat.color}`} />
                        <h3 className="text-sm font-semibold text-gray-700">{stat.title}</h3>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </motion.div>
            ))}
        </motion.div>
    );
  };

  const renderApplicationsTable = (applicationsList) => {
    return (
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
                Enrollment
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
            {isListLoading ? (
                <tr>
                    <td colSpan="7" className="py-8 text-center text-indigo-600 font-medium">
                        <FiRefreshCw className="w-5 h-5 animate-spin inline mr-2" /> Loading applications...
                    </td>
                </tr>
            ) : applicationsList.length === 0 ? (
                <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 text-lg">
                        <FiList className='mx-auto w-8 h-8 mb-2 text-gray-400' /> No applications found for the current filters.
                    </td>
                </tr>
            ) : (
                applicationsList.map((app) => (
                    <motion.tr 
                        key={app.id} 
                        className="hover:bg-indigo-50/50 transition-colors duration-200"
                        variants={itemVariants}
                    >
                        <td className="px-6 py-4 text-gray-900 font-semibold">{app.rollNo}</td>
                        <td className="px-6 py-4 text-gray-700">{app.name}</td>
                        <td className="px-6 py-4 text-gray-700">{app.enrollment ?? '—'}</td>
                        <td className="px-6 py-4 text-gray-700">{app.course ?? '—'}</td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className='flex items-center'>
                            <FiCalendar className='mr-1 text-gray-400 text-sm' />
                            {formatDate(app.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewApplication(app)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center font-medium p-2 rounded-lg hover:bg-indigo-100" 
                            aria-label={`View application for ${app.name}`}
                          >
                            <FiEye className="mr-1 w-4 h-4" /> View
                          </button>
                        </td>
                    </motion.tr>
                ))
            )}
          </motion.tbody>
        </table>
      </div>
    );
  };

  // NEW: Full-Screen Modal Component (Department-like UI)
  const renderApplicationPopup = () => {
    if (!selectedApplication) return null;

    // Use selectedApplication.department as default, then fallback to current actionDeptId if set
    const currentDeptId = actionDeptId || DEPARTMENTS.find(d => d.name === selectedApplication.department)?.id;
    const isPending = selectedApplication.status.toLowerCase() === 'pending' || selectedApplication.status.toLowerCase() === 'rejected';


    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          ref={applicationPopupRef}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                    Application Details
                </h2>
                <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="Close"
                >
                    <FiX className="w-6 h-6" />
                </button>
            </div>

            {/* Application Information (Two-column layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedApplication.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Roll Number</label>
                  <p className="text-gray-900">{selectedApplication.rollNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrollment Number</label>
                  <p className="text-gray-900">{selectedApplication.enrollment ?? '—'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Course</label>
                  <p className="text-gray-900">{selectedApplication.course ?? '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Date</label>
                  <p className="text-gray-900">{formatDate(selectedApplication.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <div className="mt-1">{renderStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>
            </div>
            
            {/* Student Contact Info (New Section) */}
            <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{selectedApplication.email ?? '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mobile</label>
                <p className="text-sm text-gray-900">{selectedApplication.mobile ?? '—'}</p>
              </div>
            </div>

            {/* Department Action Section */}
            <div className={`rounded-lg p-6 border-2 shadow-inner ${isPending ? 'border-indigo-500/50 bg-white' : 'border-gray-300 bg-gray-50'}`}>
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">Administrative Action</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Department (for action payload)
                  </label>
                  <div className='relative flex items-center'>
                    <select 
                      value={currentDeptId ?? ''} 
                      onChange={(e) => {
                        setActionDeptId(Number(e.target.value));
                        setActionError('');
                      }}
                      className="w-full border border-gray-300 rounded-lg pl-3 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white transition-colors cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark (Required for Rejection)
                  </label>
                  <textarea 
                    value={actionRemark} 
                    onChange={(e) => setActionRemark(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Enter your approval/rejection comments here..."
                  />
                  {actionError && (
                    <div className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded-lg flex items-center"><FiXCircle className='mr-1' /> {actionError}</div>
                  )}
                </div>

                <div className="flex gap-4 mt-5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={actionLoading || !currentDeptId || !selectedApplication.active_stage}
                    onClick={() => handleDepartmentAction(
                      selectedApplication, 
                      currentDeptId, 
                      'approve', 
                      actionRemark
                    )}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-all duration-200 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    <FiCheck className="inline mr-2 w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={actionLoading || !currentDeptId || !selectedApplication.active_stage}
                    onClick={() => handleDepartmentAction(
                      selectedApplication, 
                      currentDeptId, 
                      'reject', 
                      actionRemark
                    )}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-all duration-200 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    <FiX className="inline mr-2 w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </motion.button>
                </div>
                {(!selectedApplication.active_stage && !actionLoading) && <p className="text-xs text-red-500 mt-2 text-center">Cannot act: Missing active stage data.</p>}
              </div>
            </div>

            {/* Quick Actions / Footer */}
            <div className="flex justify-between pt-6 border-t mt-6">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center transition-colors shadow-md">
                <FiDownload className="mr-2" />
                Download Documents
              </button>
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 text-gray-700 font-medium hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderDashboard = () => {
    // Determine which applications to show in the recent list based on the filterStatus state
    const applicationsToShow = filterStatus === 'all' 
      ? applications 
      : applications.filter(app => 
          filterStatus === 'approved' ? app.status === 'Approved' :
          filterStatus === 'pending' ? app.status === 'Pending' :
          app.status === 'Rejected'
        );

    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants} >
        
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-extrabold mb-1 text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-6">Welcome, {user?.name}. Manage student records and application flow.</p>
        </motion.div>

        {/* Stats Section (New UI) */}
        <motion.div variants={itemVariants}>
          {renderDashboardStats()}
        </motion.div>

        {/* Student Search Section (New UI style) */}
        <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-6" variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-3">Student Search & No-Dues Form</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className='flex items-center border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 transition-shadow duration-300 focus-within:shadow-md focus-within:border-indigo-500'>
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Enter Student Roll Number"
                className="w-full outline-none text-sm bg-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center transition-colors"
              disabled={isLoading}
            >
              <FiSearch className="mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </motion.div>

        {/* Student Details and Checklist Section */}
        {studentData && (
          <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-6" variants={itemVariants}>
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-3">Student Profile & Clearance</h2>
            
            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center">
                <FiUser className="text-indigo-600 mr-3" />
                <div className='text-sm'>
                  <span className="font-medium text-gray-700 block">Name:</span>
                  <span className="font-semibold text-gray-900">{studentData.name}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiMail className="text-indigo-600 mr-3" />
                <div className='text-sm'>
                  <span className="font-medium text-gray-700 block">Email:</span>
                  <span className="text-gray-900">{studentData.email}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiBook className="text-indigo-600 mr-3" />
                <div className='text-sm'>
                  <span className="font-medium text-gray-700 block">Course:</span>
                  <span className="text-gray-900">{studentData.course}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiCalendar className="text-indigo-600 mr-3" />
                <div className='text-sm'>
                  <span className="font-medium text-gray-700 block">Semester:</span>
                  <span className="text-gray-900">{studentData.semester}</span>
                </div>
              </div>
            </div>

            {/* No-Dues Status (New style) */}
            <h3 className="font-semibold mb-3 text-lg text-gray-800">Department Clearance Status</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-3 border rounded-lg bg-white shadow-sm flex flex-col space-y-1">
                <span className='text-sm text-gray-500'>Fees:</span>
                {renderStatusBadge(studentData.feesStatus)}
              </div>
              
              <div className="p-3 border rounded-lg bg-white shadow-sm flex flex-col space-y-1">
                <span className='text-sm text-gray-500'>Library:</span>
                {renderStatusBadge(studentData.libraryStatus)}
              </div>
              
              <div className="p-3 border rounded-lg bg-white shadow-sm flex flex-col space-y-1">
                <span className='text-sm text-gray-500'>Hostel:</span>
                {renderStatusBadge(studentData.hostelStatus)}
              </div>
              
              <div className="p-3 border rounded-lg bg-white shadow-sm flex flex-col space-y-1">
                <span className='text-sm font-bold text-gray-700'>Overall:</span>
                {renderStatusBadge(studentData.noDuesStatus)}
              </div>
            </div>

            {/* Document Upload Section (New style) */}
            <h3 className="font-semibold mb-3 text-lg text-gray-800">Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition-shadow">
                <h4 className="font-medium mb-2 text-gray-700">Cancellation Cheque</h4>
                <div className="flex items-center justify-between">
                  {uploadedFiles.cancellationCheque ? (
                    <span className="text-sm text-green-600 font-medium flex items-center"><FiCheckCircle className='mr-1' /> Uploaded</span>
                  ) : (
                    <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100 flex items-center border border-indigo-200">
                      <FiUpload className="inline mr-1" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload('cancellationCheque', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition-shadow">
                <h4 className="font-medium mb-2 text-gray-700">Aadhar Card</h4>
                <div className="flex items-center justify-between">
                  {uploadedFiles.aadharCard ? (
                    <span className="text-sm text-green-600 font-medium flex items-center"><FiCheckCircle className='mr-1' /> Uploaded</span>
                  ) : (
                    <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100 flex items-center border border-indigo-200">
                      <FiUpload className="inline mr-1" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload('aadharCard', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition-shadow">
                <h4 className="font-medium mb-2 text-gray-700">Final Result</h4>
                <div className="flex items-center justify-between">
                  {uploadedFiles.result ? (
                    <span className="text-sm text-green-600 font-medium flex items-center"><FiCheckCircle className='mr-1' /> Uploaded</span>
                  ) : (
                    <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100 flex items-center border border-indigo-200">
                      <FiUpload className="inline mr-1" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload('result', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* No-Dues Process Checklist (New style) */}
            <h3 className="font-semibold mb-3 text-lg text-gray-800">Administrative Checklist</h3>
            <div className="space-y-3 mb-6">
              {checklistItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">{item.text}</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Approve Button */}
                      <button
                        onClick={() => handleStatusChange(item.id, 'approve')}
                        className={`p-2 rounded-full border transition-colors ${
                          item.status === 'approve'
                            ? 'bg-green-50 border-green-300 text-green-600'
                            : 'bg-gray-50 border-gray-300 text-gray-400 hover:bg-green-50 hover:border-green-300 hover:text-green-600'
                        }`}
                        title="Approve"
                      >
                        <FiCheck size={16} />
                      </button>

                      {/* Disapprove Button */}
                      <button
                        onClick={() => handleStatusChange(item.id, 'disapprove')}
                        className={`p-2 rounded-full border transition-colors ${
                          item.status === 'disapprove'
                            ? 'bg-red-50 border-red-300 text-red-600'
                            : 'bg-gray-50 border-gray-300 text-gray-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
                        }`}
                        title="Disapprove"
                      >
                        <FiX size={16} />
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() => toggleComment(item.id)}
                        className={`p-2 rounded-full border transition-colors ${
                          item.showComment
                            ? 'bg-blue-50 border-blue-300 text-blue-600'
                            : 'bg-gray-50 border-gray-300 text-gray-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                        }`}
                        title="Add Comment"
                      >
                        <FiMessageSquare size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Comment Box */}
                  {item.showComment && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <textarea
                        value={item.comment}
                        onChange={(e) => updateComment(item.id, e.target.value)}
                        placeholder="Add your comment..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleSubmitNoDues}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center transition-colors shadow-md"
              >
                <FiCheckCircle className="mr-2" />
                Submit No-Dues Application
              </button>
            </div>
          </motion.div>
        )}

        {/* Recent Activities (New UI style) */}
        <motion.div className="bg-white rounded-xl shadow-lg p-6" variants={itemVariants}>
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-xl font-bold text-gray-800">Recent No-Dues Applications</h2>
            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className='relative flex items-center'>
                <FiFilter className="absolute left-3 text-gray-500 w-4 h-4 pointer-events-none" />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white transition-colors duration-200 hover:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Applications</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>

              {/* Refresh */}
              <button 
                onClick={fetchApplications}
                disabled={isListLoading}
                className={`bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 flex items-center transition-colors border border-gray-300 disabled:opacity-50`}
                title="Refresh Data"
              >
                <FiRefreshCw className={`mr-1 w-4 h-4 ${isListLoading ? 'animate-spin' : ''}`} /> 
                Refresh
              </button>
            </div>
          </div>
          
          {renderApplicationsTable(applicationsToShow)}
        </motion.div>
      </motion.div>
    );
  };

  // Helper for Pending/History tables to include Loading/Refresh (New UI style)
  const renderApplicationsSection = (title, applicationsList) => (
    <motion.div className="bg-white rounded-xl shadow-lg p-6" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <button 
          onClick={fetchApplications}
          disabled={isListLoading}
          className={`bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 flex items-center transition-colors border border-gray-300 disabled:opacity-50`}
          title="Refresh Data"
        >
          <FiRefreshCw className={`mr-1 w-4 h-4 ${isListLoading ? 'animate-spin' : ''}`} /> 
          Refresh
        </button>
      </div>
      
      {renderApplicationsTable(applicationsList)}
    </motion.div>
  );

  const renderPendingApplications = () => {
    return renderApplicationsSection('Pending Applications', pendingApplications);
  };

  const renderApplicationHistory = () => {
    return renderApplicationsSection('Application History', approvedApplications);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar 
        menuItems={officeMenuItems} 
        user={user} 
        logout={logout} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="mb-6">
            </div>

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'pending' && renderPendingApplications()}
            {activeTab === 'history' && renderApplicationHistory()}
            
            {/* Application detail popup/modal - uses the new department-like UI */}
            {renderApplicationPopup()}

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;