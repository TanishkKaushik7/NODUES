import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios'; 
import { 
  FiUser, FiLogOut, FiMenu, FiX, FiHome, FiFileText, 
  FiActivity, FiShield,  
} from 'react-icons/fi';

// Import Sub-components
import Overview from './Overview';
import MyApplications from './MyApplications';
import TrackStatus from './TrackStatus';

// --- Constants ---
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

  // --- UI States ---
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- Form & Data States ---
  const [formData, setFormData] = useState({
    enrollmentNumber: '', rollNumber: '', fullName: '', fatherName: '',
    motherName: '', gender: '', category: '', dob: '', mobile: '',
    email: '', domicile: '', permanentAddress: '', hostelName: '',
    hostelRoom: '', admissionYear: '', section: '', 
    departmentCode: '', 
    admissionType: '', proof_document_url: '', remarks: '', 
    schoolName: '' 
  });

  const [stepStatuses, setStepStatuses] = useState(() =>
    STATUS_STEPS.map(() => ({ status: 'pending', comment: '' }))
  );

  // --- Logic States ---
  const [locked, setLocked] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // ✅ Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState(null);
  
  const [applicationId, setApplicationId] = useState(null);
  const [applicationData, setApplicationData] = useState(null);

  const [departmentSteps, setDepartmentSteps] = useState(STATUS_STEPS);
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  /* ---------- 1. DATA MAPPING LOGIC ---------- */
  useEffect(() => {
    if (!user) return;
    const s = user.student ? user.student : user;
    
    // Helper to safely get nested properties or camel/snake case
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
      departmentCode: get(s, 'department_code', 'departmentCode'),
      admissionType: get(s, 'admission_type', 'admissionType'),
      proof_document_url: get(s, 'proof_document_url') || '',
      schoolName: get(s, 'school_name', 'schoolName') || s?.school?.name || '',
      remarks: ''
    };
    
    setFormData(mapped);

    // Lock fields if they came from the User Profile (SSO/DB)
    setLocked({
      enrollmentNumber: !!get(s, 'enrollment_number'),
      rollNumber: !!get(s, 'roll_number'),
      fullName: !!get(s, 'full_name'),
      fatherName: !!get(s, 'father_name'),
      motherName: !!get(s, 'mother_name'),
      gender: !!get(s, 'gender'),
      category: !!get(s, 'category'),
      dob: !!get(s, 'dob'),
      mobile: !!get(s, 'mobile_number', 'mobile'),
      email: !!get(s, 'email'),
      domicile: (get(s, 'domicile') !== '') || (get(s, 'permanent_address') !== ''),
      permanentAddress: !!get(s, 'permanent_address'),
      isHosteller: false, // Usually editable
      hostelName: !!get(s, 'hostel_name'),
      hostelRoom: !!get(s, 'hostel_room'),
      admissionYear: !!get(s, 'admission_year'),
      section: !!get(s, 'section'),
      departmentCode: !!get(s, 'department_code'),
      admissionType: !!get(s, 'admission_type'),
      schoolName: (mapped.schoolName !== '') 
    });
  }, [user]);

  /* ---------- 2. FETCH STATUS LOGIC ---------- */
  const fetchApplicationStatus = useCallback(async () => {
    if (!user) return;
    setStatusLoading(true);
    
    try {
      const res = await api.get('/api/applications/my');
      const body = res.data;

      // Update Form Data if application exists
      if (body?.student) {
        setFormData(prev => ({
           ...prev,
           schoolName: body.student.school_name || prev.schoolName
        }));
      }

      if (body?.application) {
          setApplicationId(body.application.id);
          setApplicationData(body.application);
      }

      // Handle Rejection
      const rejectedFlag = body?.flags?.is_rejected || (body?.application?.status === 'rejected');
      setIsRejected(rejectedFlag);
      
      if (rejectedFlag) {
        setRejectionDetails(body?.rejection_details || { role: 'Dept', remarks: body?.application?.remarks || 'Rejected' });
        // Unlock all fields for editing
        setLocked(prev => { 
            let u = {}; 
            Object.keys(prev).forEach(k => u[k] = false); 
            return u; 
        });
      }

      // Handle Completion
      const completedFlag = !!(body?.flags?.is_completed || body?.application?.status?.toLowerCase() === 'completed');
      setIsCompleted(completedFlag);

      // Map Status Steps
      const mapStageToStatus = (stage, body) => {
        if (!stage) return { status: 'pending', comment: '' };
        const s = (stage.status || '').toLowerCase();
        
        if (['completed', 'done', 'approved'].includes(s)) return { status: 'completed', comment: stage.remarks || '' };
        if (['rejected', 'denied'].includes(s)) return { status: 'failed', comment: stage.remarks || '' };
        if (body?.application && Number(body.application.current_department_id) === Number(stage.department_id)) return { status: 'in_progress', comment: stage.remarks || '' };
        
        return { status: 'pending', comment: stage.remarks || '' };
      };

      let deptSeq = (body.departments || body.department_sequence || DEFAULT_DEPT_SEQUENCE);
      
      // Determine Status Labels
      const stepLabels = deptSeq.map(d => d.name || d.department_name);
      if (!stepLabels.includes('Completed')) stepLabels.push('Completed');
      setDepartmentSteps(stepLabels);

      // Determine Status State
      const stages = body.stages || [];
      const mappedStatuses = deptSeq.map(d => {
        const stage = stages.find(s => Number(s.department_id) === Number(d.id));
        return mapStageToStatus(stage, body);
      });
      
      mappedStatuses.push(completedFlag ? { status: 'completed', comment: '' } : { status: 'pending', comment: '' });
      setStepStatuses(mappedStatuses);

    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 401) {
         setStatusError("Session Expired. Please Login Again.");
      } else {
         setStatusError(e.message);
      }
    } finally {
      setStatusLoading(false);
      setInitialLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplicationStatus(); 
  }, [fetchApplicationStatus]);

  /* ---------- 3. HANDLE FILE UPLOAD (With Progress) ---------- */
  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    
    // Respect lock unless rejected (allows re-upload)
    if (locked[name] && !isRejected) return; 

    if (type === 'file') {
      const file = files[0];
      if (!file || file.type !== 'application/pdf') {
        setFormErrors(prev => ({ ...prev, [name]: 'Only PDF allowed' }));
        return;
      }
      
      setUploading(true);
      setUploadProgress(0); // Reset progress
      setFormErrors(prev => ({ ...prev, [name]: '' }));

      const data = new FormData();
      data.append('file', file);

      try {
        const res = await api.post('/api/utils/upload-proof', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        });

        if (res.data.path) {
            setFormData(prev => ({ ...prev, proof_document_url: res.data.path }));
        }
      } catch (err) {
          console.error("Upload Error:", err);
          setFormErrors(prev => ({ ...prev, [name]: 'Upload failed. Ensure file is PDF < 5MB.' }));
      } finally {
          // Add small delay so user sees 100% before spinner stops
          setTimeout(() => setUploading(false), 500);
      }
      return; 
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ---------- 4. HANDLE SAVE ---------- */
  const handleSave = async (childPayload = null) => {
    setSubmitting(true);
    setSaveMessage('');
    
    try {
      // Use child payload if available (from MyApplications), else fallback to local state
      let payload = childPayload || {
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
        department_code: formData.departmentCode,
        admission_type: formData.admissionType,
        is_hosteller: formData.isHosteller === 'Yes',
        hostel_name: formData.hostelName,
        hostel_room: formData.hostelRoom,
        admission_year: parseInt(formData.admissionYear) || undefined
      };

      if (isRejected && applicationId) {
        await api.patch(`/api/applications/${applicationId}/resubmit`, payload);
        setSaveMessage('Resubmitted Successfully');
        setIsRejected(false);
      } else {
        await api.post('/api/applications/create', payload);
        setSaveMessage('Saved Successfully');
      }

      fetchApplicationStatus();
      return true;

    } catch (err) {
      console.error("Submission Error:", err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error saving application';
      setSaveMessage(errorMsg);
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

  // --- Loading Screen ---
  if (initialLoading) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading Portal...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex items-stretch overflow-hidden font-sans relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[80%] lg:w-[60%] h-[60%] bg-blue-50/40 rounded-full blur-[120px] lg:blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[80%] lg:w-[60%] h-[60%] bg-indigo-50/40 rounded-full blur-[120px] lg:blur-[160px]" />
      </div>

      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-slate-900 text-white p-8 xl:p-10 justify-between relative z-20 shadow-2xl">
        <div>
          <div className="flex items-center gap-4 mb-12 xl:mb-16 px-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 p-1.5 border border-slate-100">
  <img 
    src="https://www.gbu.ac.in/Content/img/logo_gbu.png" 
    alt="GBU Logo" 
    className="w-full h-full object-contain"
  />
</div>      <h1 className="text-[12px] xl:text-sm font-black uppercase tracking-[0.25em]">GBU Portal</h1>
          </div>

          <nav className="space-y-2 xl:space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-4 xl:gap-5 px-5 xl:px-6 py-4 xl:py-5 rounded-xl xl:rounded-2xl text-[11px] xl:text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-300 group ${
                  active === item.id 
                    ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} className={active === item.id ? 'text-blue-600' : 'group-hover:text-white transition-colors'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-8 border-t border-slate-800/50 space-y-4">
          <div className="px-4 py-3 xl:py-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 xl:gap-4 group hover:bg-white/[0.08] transition-all duration-300">
            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg xl:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20 text-xs xl:text-base">
              {formData.fullName?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] xl:text-[11px] font-black text-white truncate uppercase tracking-wider leading-none mb-1">
                {formData.fullName || 'Student'}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] xl:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Online</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-between px-4 xl:px-6 py-3 xl:py-4 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <FiLogOut size={16} xl:size={18} />
              <span className="text-[10px] xl:text-[11px] font-black uppercase tracking-[0.2em]">Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <section className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Header */}
        <header className="min-h-[72px] lg:h-24 border-b border-slate-50 flex items-center justify-between px-6 md:px-10 lg:px-14 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 lg:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <FiMenu size={24} />
            </button>
            <h3 className="text-sm xl:text-base font-black text-slate-900 uppercase tracking-[0.15em] xl:tracking-[0.2em]">
              {menuItems.find(m => m.id === active)?.label}
            </h3>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#fcfdfe] overflow-x-hidden scroll-smooth">
          <div className="px-6 py-8 md:px-10 md:py-10 lg:px-14 xl:px-16 lg:py-14 max-w-[1440px] mx-auto w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div 
                key={active} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full h-full"
              >
                {active === 'dashboard' && (
                  <Overview 
                    user={{ ...user, school_name: formData.schoolName }} 
                    formData={formData} 
                    stepStatuses={stepStatuses} 
                    setActive={setActive} 
                    applicationId={applicationId}
                    application={applicationData}
                    token={token}
                  />
                )}
                {active === 'form' && (
                  <MyApplications
                    user={user} formData={formData} locked={locked} formErrors={formErrors}
                    submitting={submitting} 
                    uploading={uploading} 
                    uploadProgress={uploadProgress} // ✅ Pass progress prop
                    saveMessage={saveMessage}
                    handleChange={handleChange} handleSave={handleSave}
                    hasSubmittedApplication={!!applicationId} isRejected={isRejected} rejectionDetails={rejectionDetails}
                    isCompleted={isCompleted}
                    stepStatuses={stepStatuses}
                    applicationId={applicationId} 
                    token={token}
                  />
                )}
                {active === 'status' && (
                  <TrackStatus 
                    stepStatuses={stepStatuses} 
                    departmentSteps={departmentSteps} 
                    loading={statusLoading} 
                    error={statusError} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </section>

      {/* --- Mobile Sidebar Overlay --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] sm:w-80 bg-slate-900 z-[100] p-8 lg:hidden shadow-2xl flex flex-col justify-between"
            >
<div>
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 p-1.5 border border-slate-100">
  <img 
    src="https://www.gbu.ac.in/Content/img/logo_gbu.png" 
    alt="GBU Logo" 
    className="w-full h-full object-contain"
  />
</div> <span className="text-white text-xs font-black uppercase tracking-widest">GBU Portal</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400 p-2 hover:text-white transition-colors">
                    <FiX size={24} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {menuItems.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { setActive(item.id); setSidebarOpen(false); }} 
                      className={`w-full flex items-center gap-4 p-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                        active === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 active:bg-white/5'
                      }`}
                    >
                      <item.icon size={20} /> {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-4 p-4 text-slate-400 hover:text-rose-400 font-black uppercase tracking-widest transition-all border-t border-slate-800/50 pt-8"
              >
                <FiLogOut size={20} /> End Session
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;