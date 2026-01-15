import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios'; 
import { 
  FiUser, FiLogOut, FiMenu, FiX, FiHome, FiFileText, 
  FiActivity, FiShield, FiChevronRight, FiBell, FiRefreshCw 
} from 'react-icons/fi';

// Import Sub-components
import Overview from './Overview';
import MyApplications from './MyApplications';
import TrackStatus from './TrackStatus';

const STATUS_STEPS = ['Process initiation', 'Library', 'Hostel', 'Sports', 'CRC', 'Labs', 'Accounts', 'Completed'];

const DEFAULT_DEPT_SEQUENCE = [
  { idx: 0, id: 1, name: 'Department', sequence_order: 1 },
  { idx: 1, id: 2, name: 'Library', sequence_order: 2 },
  { idx: 2, id: 3, name: 'Hostel', sequence_order: 3 },
  { idx: 3, id: 4, name: 'Accounts', sequence_order: 4 },
  { idx: 4, id: 5, name: 'Sports', sequence_order: 5 },
  { idx: 5, id: 6, name: 'Exam Cell', sequence_order: 6 }
];

const StudentDashboard = () => {
  const { student: user, token, logout } = useStudentAuth();
  const navigate = useNavigate();

  // Navigation & UI States
  const [active, setActive] = useState('dashboard');
  const [started, setStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    enrollmentNumber: '', rollNumber: '', fullName: '', fatherName: '',
    motherName: '', gender: '', category: '', dob: '', mobile: '',
    email: '', domicile: '', permanentAddress: '', hostelName: '',
    hostelRoom: '', admissionYear: '', section: '', batch: '',
    admissionType: '', proof_document_url: '', remarks: ''
  });

  const [stepStatuses, setStepStatuses] = useState(() =>
    STATUS_STEPS.map(() => ({ status: 'pending', comment: '' }))
  );

  // Logic States
  const [locked, setLocked] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const statusMountedRef = useRef(false);
  const [departmentSteps, setDepartmentSteps] = useState(STATUS_STEPS);
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  /* ---------- 1. DATA MAPPING LOGIC ---------- */
  useEffect(() => {
    if (!user) return;
    const s = user.student ? user.student : user;
    
    const get = (obj, ...keys) => {
      for (const k of keys) {
        if (obj == null) continue;
        if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
        const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        if (Object.prototype.hasOwnProperty.call(obj, camel) && obj[camel] != null) return obj[camel];
      }
      return '';
    };

    const mapped = {
      enrollmentNumber: get(s, 'enrollment_number', 'enrollmentNumber'),
      rollNumber: get(s, 'roll_number', 'rollNumber'),
      fullName: get(s, 'full_name', 'fullName', 'name'),
      fatherName: get(s, 'father_name', 'fatherName'),
      motherName: get(s, 'mother_name', 'motherName'),
      gender: get(s, 'gender'),
      category: get(s, 'category'),
      dob: get(s, 'dob'),
      mobile: get(s, 'mobile_number', 'mobile'),
      email: get(s, 'email'),
      domicile: get(s, 'domicile', 'permanent_address'),
      permanentAddress: get(s, 'permanent_address', 'domicile'),
      isHosteller: get(s, 'is_hosteller') === true || get(s, 'is_hosteller') === 'true' ? 'Yes' : 'No',
      hostelName: get(s, 'hostel_name', 'hostelName'),
      hostelRoom: get(s, 'hostel_room', 'hostelRoom'),
      admissionYear: get(s, 'admission_year', 'admissionYear'),
      section: get(s, 'section'),
      batch: get(s, 'batch'),
      admissionType: get(s, 'admission_type', 'admissionType'),
      proof_document_url: get(s, 'proof_document_url') || '',
      remarks: ''
    };
    setFormData(mapped);

    setLocked({
      enrollmentNumber: get(s, 'enrollment_number') !== '',
      rollNumber: get(s, 'roll_number') !== '',
      fullName: get(s, 'full_name') !== '',
      fatherName: get(s, 'father_name') !== '',
      motherName: get(s, 'mother_name') !== '',
      gender: get(s, 'gender') !== '',
      category: get(s, 'category') !== '',
      dob: get(s, 'dob') !== '',
      mobile: get(s, 'mobile_number', 'mobile') !== '',
      email: get(s, 'email') !== '',
      domicile: (get(s, 'domicile') !== '') || (get(s, 'permanent_address') !== ''),
      permanentAddress: get(s, 'permanent_address') !== '',
      isHosteller: false,
      hostelName: get(s, 'hostel_name') !== '',
      hostelRoom: get(s, 'hostel_room') !== '',
      admissionYear: get(s, 'admission_year') !== '',
      section: get(s, 'section') !== '',
      batch: get(s, 'batch') !== '',
      admissionType: get(s, 'admission_type') !== ''
    });
  }, [user]);

  /* ---------- 2. FETCH STATUS LOGIC ---------- */
  const fetchApplicationStatus = useCallback(async () => {
    if (!user) return;
    statusMountedRef.current = true;
    setStatusLoading(true);
    try {
      const res = await api.get('/api/applications/my');
      const body = res.data;

      if (!statusMountedRef.current) return;

      if (body?.application?.id) setApplicationId(body.application.id);

      const rejectedFlag = body?.flags?.is_rejected || (body?.application?.status === 'rejected');
      setIsRejected(rejectedFlag);
      if (rejectedFlag) {
        setRejectionDetails(body?.rejection_details || { role: 'Dept', remarks: body?.application?.remarks || 'Rejected' });
        setLocked(prev => { let u = {}; Object.keys(prev).forEach(k => u[k] = false); return u; });
      }

      const completedFlag = !!(body?.flags?.is_completed || body?.application?.status?.toLowerCase() === 'completed');
      setIsCompleted(completedFlag);

      const mapStageToStatus = (stage, body) => {
        if (!stage) return { status: 'pending', comment: '' };
        const s = (stage.status || '').toLowerCase();
        if (['completed', 'done', 'approved'].includes(s)) return { status: 'completed', comment: stage.remarks || '' };
        if (['rejected', 'denied'].includes(s)) return { status: 'failed', comment: stage.remarks || '' };
        if (body?.application && Number(body.application.current_department_id) === Number(stage.department_id)) return { status: 'in_progress', comment: stage.remarks || '' };
        return { status: 'pending', comment: stage.remarks || '' };
      };

      let deptSeq = (body.departments || body.department_sequence || DEFAULT_DEPT_SEQUENCE);
      const stepLabels = deptSeq.map(d => d.name || d.department_name);
      if (!stepLabels.includes('Completed')) stepLabels.push('Completed');
      setDepartmentSteps(stepLabels);

      const stages = body.stages || [];
      const mappedStatuses = deptSeq.map(d => {
        const stage = stages.find(s => Number(s.department_id) === Number(d.id));
        return mapStageToStatus(stage, body);
      });
      
      mappedStatuses.push(completedFlag ? { status: 'completed', comment: '' } : { status: 'pending', comment: '' });
      setStepStatuses(mappedStatuses);
      setStarted(!!(body?.flags?.is_in_progress || body?.application));

    } catch (e) {
      if (e.response?.status === 403) {
         setStatusError("Access Forbidden: Please re-login.");
         logout();
      } else {
         setStatusError(e.message);
      }
    } finally {
      setStatusLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    statusMountedRef.current = true;
    fetchApplicationStatus(); 
    return () => { statusMountedRef.current = false; };
  }, [fetchApplicationStatus]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (locked[name] && !isRejected) return; 

    // ✅ FIXED FILE UPLOAD LOGIC
    // We use native fetch() to avoid Axios interceptors forcing JSON headers
    if (type === 'file') {
      const file = files[0];
      if (!file || file.type !== 'application/pdf') {
        setFormErrors(prev => ({ ...prev, [name]: 'Only PDF allowed' }));
        return;
      }
      setUploading(true);

      const data = new FormData();
      // "file" MUST match the variable name in backend: async def upload_proof(file: UploadFile ...)
      data.append('file', file); 

      // Get Base URL properly
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, '');

      // Get Token
      const authToken = token || user?.access_token || localStorage.getItem('studentToken');

      fetch(`${API_BASE}/api/utils/upload-proof`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`
            // ⚠️ CRITICAL: DO NOT SET 'Content-Type' manually.
            // The browser will automatically set 'multipart/form-data; boundary=----WebKitFormBoundary...'
        },
        body: data
      })
      .then(async (res) => {
        if (!res.ok) {
           const errText = await res.text();
           throw new Error(`Upload Failed: ${errText}`);
        }
        return res.json();
      })
      .then(resData => {
        if (resData.path) {
            setFormData(prev => ({ ...prev, proof_document_url: resData.path }));
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
      })
      .catch((err) => {
         console.error("Upload Error:", err);
         setFormErrors(prev => ({ ...prev, [name]: 'Upload failed. Ensure file is PDF < 5MB.' }));
      })
      .finally(() => setUploading(false));
      
      return; // Stop execution here for file inputs
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      let payload = {
        proof_document_url: formData.proof_document_url,
        remarks: formData.remarks,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        gender: formData.gender,
        category: formData.category,
        dob: formData.dob,
        permanent_address: formData.permanentAddress,
        domicile: formData.domicile || formData.permanentAddress,
        section: formData.section,
        batch: formData.batch,
        admission_type: formData.admissionType,
        is_hosteller: formData.isHosteller === 'Yes',
        hostel_name: formData.hostelName,
        hostel_room: formData.hostelRoom,
        admission_year: parseInt(formData.admissionYear) || undefined
      };

      if (isRejected && applicationId) {
        await api.patch(`/api/applications/${applicationId}/resubmit`, payload);
      } else {
        await api.post('/api/applications/create', payload);
      }

      setSaveMessage(isRejected ? 'Resubmitted Successfully' : 'Saved Successfully');
      setIsRejected(false);
      fetchApplicationStatus();
      return true;
    } catch (err) {
      setSaveMessage(err.response?.data?.detail || err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: FiHome },
    { id: 'form', label: 'My Application', icon: FiFileText },
    { id: 'status', label: 'Track Status', icon: FiActivity },
  ];

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex items-stretch overflow-hidden font-sans relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-50/40 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-indigo-50/40 rounded-full blur-[160px]" />
      </div>

      <aside className="hidden lg:flex flex-col w-80 bg-slate-900 text-white p-10 justify-between relative z-20">
        <div>
          <div className="flex items-center gap-4 mb-16 px-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <FiShield size={24} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.25em]">GBU Portal</h1>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-300 group ${
                  active === item.id 
                    ? 'bg-white text-slate-900 shadow-2xl shadow-white/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} className={active === item.id ? 'text-blue-600' : ''} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-slate-800/50 space-y-4">
          <div className="px-4 py-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group hover:bg-white/[0.08] transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20">
              {formData.fullName?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white truncate uppercase tracking-wider leading-none mb-1">
                {formData.fullName || 'Student'}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Active Session
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-between px-6 py-4 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/10 hover:border hover:border-rose-500/20 group transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <FiLogOut size={18} className="group-hover:text-rose-400 transition-colors" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">End Session</span>
            </div>
            <FiChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 bg-white relative">
        <header className="h-24 border-b border-slate-50 flex items-center justify-between px-10 lg:px-14">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 mr-2">
              <FiMenu size={28} />
            </button>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-[0.2em] hidden lg:block">
              {menuItems.find(m => m.id === active)?.label}
            </h3>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors relative">
              <FiBell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10 lg:px-16 lg:py-14 bg-[#fcfdfe]">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div 
                key={active} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {active === 'dashboard' && (
                  <Overview 
                    user={user} 
                    formData={formData} 
                    stepStatuses={stepStatuses} 
                    setActive={setActive} 
                    applicationId={applicationId}
                    token={token}
                  />
                )}
                {active === 'form' && (
                  <MyApplications
                    user={user} formData={formData} locked={locked} formErrors={formErrors}
                    submitting={submitting} uploading={uploading} saveMessage={saveMessage}
                    handleChange={handleChange} handleSave={handleSave}
                    hasSubmittedApplication={!!applicationId} isRejected={isRejected} rejectionDetails={rejectionDetails}
                    isCompleted={isCompleted}
                    stepStatuses={stepStatuses}
                    applicationId={applicationId} 
                    token={token}
                  />
                )}
                {active === 'status' && <TrackStatus stepStatuses={stepStatuses} departmentSteps={departmentSteps} loading={statusLoading} error={statusError} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ x: '-100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '-100%' }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-slate-900 z-[100] p-10 lg:hidden shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-12">
                <FiShield className="text-blue-500" size={32} />
                <button onClick={() => setSidebarOpen(false)} className="text-white p-2">
                  <FiX size={32} />
                </button>
              </div>
              <nav className="space-y-6">
                {menuItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { setActive(item.id); setSidebarOpen(false); }} 
                    className={`w-full flex items-center gap-5 p-5 rounded-2xl text-[14px] font-black uppercase tracking-widest transition-all ${
                      active === item.id ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <item.icon size={24} /> {item.label}
                  </button>
                ))}
              </nav>
            </div>
            
            <button onClick={handleLogout} className="w-full flex items-center gap-5 p-5 text-slate-400 hover:text-rose-400 font-black uppercase tracking-widest transition-all">
              <FiLogOut size={24} /> End Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;