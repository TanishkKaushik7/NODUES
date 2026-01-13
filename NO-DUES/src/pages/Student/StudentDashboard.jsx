import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { FiUser, FiLogOut, FiMenu, FiX, FiHome, FiFileText, FiActivity } from 'react-icons/fi';

// Import Sub-components
import Overview from './Overview';
import MyApplications from './MyApplications';
import TrackStatus from './TrackStatus';

const STATUS_STEPS = [
  'Process initiation',
  'Library',
  'Hostel',
  'Sports',
  'CRC',
  'Labs',
  'Accounts',
  'Completed'
];

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

  const [active, setActive] = useState('dashboard');
  const [started, setStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    rollNumber: '',
    fullName: '',
    fatherName: '',
    motherName: '',
    gender: '',
    category: '',
    dob: '',
    mobile: '',
    email: '',
    domicile: '',
    permanentAddress: '',
    hostelName: '',
    hostelRoom: '',
    admissionYear: '',
    section: '',
    batch: '',
    admissionType: '',
    proof_document_url: '',
    remarks: ''
  });

  const [stepStatuses, setStepStatuses] = useState(() =>
    STATUS_STEPS.map(() => ({ status: 'pending', comment: '' }))
  );

  const [locked, setLocked] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Rejection State
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState(null);
  
  // Store Application ID for resubmission
  const [applicationId, setApplicationId] = useState(null);

  const statusMountedRef = useRef(false);

  // Dynamic steps & API Data
  const [departmentSteps, setDepartmentSteps] = useState(STATUS_STEPS);
  const [lastStatusBody, setLastStatusBody] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  /* ---------- load user data ---------- */
  useEffect(() => {
    if (!user) return;
    const envelope = user;
    const s = envelope && envelope.student ? envelope.student : envelope;

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
      isHosteller:
        get(s, 'is_hosteller') === true || get(s, 'is_hosteller') === 'true'
          ? 'Yes'
          : get(s, 'is_hosteller') === false || get(s, 'is_hosteller') === 'false'
          ? 'No'
          : '',
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

    const initialLocks = {
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
    };
    setLocked(initialLocks);
  }, [user]);

  /* ---------- fetch application status ---------- */
  const fetchApplicationStatus = async () => {
    if (!user) return;
    setStatusLoading(true);
    setStatusError('');
    try {
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, '');
      const url = API_BASE ? `${API_BASE}/api/applications/my` : `/api/applications/my`;

      const authToken = token || user?.access_token || user?.token || user?.accessToken || localStorage.getItem('studentToken');
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(url, { method: 'GET', headers });
      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }
      
      setLastStatusBody(body);

      if (!statusMountedRef.current) { setStatusLoading(false); return; }
      if (!res.ok) { setStatusError(`Status fetch failed: ${res.status}`); setStatusLoading(false); return; }

      // capture ID for resubmission
      if (body?.application?.id) {
        setApplicationId(body.application.id);
      }

      // --- CHECK FOR REJECTION ---
      const rejectedFlag = body?.flags?.is_rejected || (body?.application?.status === 'rejected');
      setIsRejected(rejectedFlag);

      if (rejectedFlag) {
        setRejectionDetails(body?.rejection_details || { role: 'Unknown', remarks: body?.application?.remarks || 'Application Rejected' });
        
        // UNLOCK FIELDS IF REJECTED
        setLocked(prevLocks => {
          const unlocked = {};
          Object.keys(prevLocks).forEach(key => unlocked[key] = false);
          return unlocked;
        });
      } else {
        setRejectionDetails(null);
      }

      // Map Statuses logic
      const mapStageToStatus = (stage, body) => {
        if (!stage) return { status: 'pending', comment: '' };
        const s = (stage.status || '').toString().toLowerCase();
        if (['completed', 'done', 'approved'].includes(s)) return { status: 'completed', comment: stage.remarks || '' };
        if (['rejected', 'denied'].includes(s)) return { status: 'failed', comment: stage.remarks || '' };
        if (body?.application && Number(body.application.current_department_id) === Number(stage.department_id)) return { status: 'in_progress', comment: stage.remarks || '' };
        return { status: 'pending', comment: stage.remarks || '' };
      };

      let deptSeq = null;
      if (body && Array.isArray(body.departments) && body.departments.length) {
        deptSeq = body.departments.map(d => ({ id: d.id, name: d.name || d.department_name || `Dept ${d.id}`, sequence_order: d.sequence_order ?? null }));
      } else if (Array.isArray(body.department_sequence) && body.department_sequence.length) {
        deptSeq = body.department_sequence.map(d => ({ id: d.id, name: d.name || d.department_name || `Dept ${d.id}`, sequence_order: d.sequence_order ?? null }));
      } else {
        deptSeq = DEFAULT_DEPT_SEQUENCE.map(d => ({ id: d.id, name: d.name, sequence_order: d.sequence_order }));
      }

      const stepLabels = [...deptSeq.map(d => d.name)];
      if (stepLabels[stepLabels.length - 1] !== 'Completed') stepLabels.push('Completed');
      setDepartmentSteps(stepLabels);

      const stages = Array.isArray(body.stages) ? body.stages : [];
      const mappedStatuses = deptSeq.map((d) => {
        const stage = stages.find(s => Number(s.department_id) === Number(d.id) || (s.sequence_order != null && d.sequence_order != null && Number(s.sequence_order) === Number(d.sequence_order)));
        return mapStageToStatus(stage, body);
      });

      const completedFlag = !!(body?.flags?.is_completed || (body?.application && typeof body.application.status === 'string' && body.application.status.toLowerCase() === 'completed'));
      mappedStatuses.push(completedFlag ? { status: 'completed', comment: '' } : { status: 'pending', comment: '' });

      setStepStatuses(mappedStatuses);
      
      const startedFlag = !!(body?.flags?.is_in_progress || body?.application);
      setStarted(startedFlag);

      setStatusLoading(false);
    } catch (e) {
      setStatusError(e?.message || String(e));
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    statusMountedRef.current = true;
    fetchApplicationStatus();
    const iv = setInterval(fetchApplicationStatus, 30000);
    return () => { statusMountedRef.current = false; clearInterval(iv); };
  }, [user, token]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (locked[name] && !isRejected) return; 

    if (type === 'file') {
      const file = files[0];
      if (!file) return;
      if (file.type !== 'application/pdf') {
        setFormErrors(prev => ({ ...prev, [name]: 'Only PDF files are allowed' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, [name]: 'File size must be less than 5MB' }));
        return;
      }
      setUploading(true);
      setFormErrors(prev => ({ ...prev, [name]: null }));

      const data = new FormData();
      data.append('file', file);

      const authToken = token || user?.access_token || user?.token || localStorage.getItem('studentToken');
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, '');
      const url = API_BASE ? `${API_BASE}/api/utils/upload-proof` : `/api/utils/upload-proof`;

      fetch(url, { method: 'POST', headers, body: data })
      .then(res => {
        if(!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(resData => {
        if (resData && resData.path) {
          setFormData(prev => ({ ...prev, proof_document_url: resData.path }));
        } else {
          setFormErrors(prev => ({ ...prev, [name]: 'Upload failed on server' }));
        }
      })
      .catch(err => {
        setFormErrors(prev => ({ ...prev, [name]: `Upload failed: ${err.message}` }));
      })
      .finally(() => setUploading(false));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ---------- HANDLE SAVE / RESUBMIT ---------- */
  const handleSave = async () => {
    setSubmitting(true);
    setSaveMessage('');
    try {
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, '');
      
      const authToken = token || user?.access_token || user?.token || localStorage.getItem('studentToken');
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      // Payload Construction (send only non-empty fields for PATCH)
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
        admission_type: formData.admissionType
      };
      // Only include hostel fields if hosteller
      if (formData.isHosteller === 'Yes') {
        payload.is_hosteller = true;
        if (formData.hostelName) payload.hostel_name = formData.hostelName;
        if (formData.hostelRoom) payload.hostel_room = formData.hostelRoom;
      } else if (formData.isHosteller === 'No') {
        payload.is_hosteller = false;
      }
      // Only include admission_year if valid
      if (formData.admissionYear && !isNaN(parseInt(formData.admissionYear))) {
        payload.admission_year = parseInt(formData.admissionYear);
      }
      // Remove empty string, null, or undefined fields for PATCH
      if (isRejected && applicationId) {
        Object.keys(payload).forEach(key => {
          if (
            payload[key] === '' ||
            payload[key] === null ||
            payload[key] === undefined
          ) {
            delete payload[key];
          }
        });
      }

      // --- LOGIC SWITCH: CREATE vs RESUBMIT ---
      let url;
      let method;

      if (isRejected && applicationId) {
        // 
        // 1. RESUBMIT MODE
        url = API_BASE ? `${API_BASE}/api/applications/${applicationId}/resubmit` : `/api/applications/${applicationId}/resubmit`;
        method = 'PATCH';
      } else {
        // 2. CREATE MODE
        url = API_BASE ? `${API_BASE}/api/applications/create` : `/api/applications/create`;
        method = 'POST';
      }

      console.log(`Executing ${method} to ${url}`, payload);

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      let body = null;
      try { body = await res.json(); } catch (e) { }

      if (!res.ok) throw new Error(body?.error || body?.message || body?.detail || 'Failed to process application');

      setSaveMessage(isRejected ? 'Application resubmitted successfully' : 'Application saved successfully');
      setStarted(true);
      
      // Clear rejection state optimistically to update UI immediately
      if (isRejected) {
        setIsRejected(false); 
      }
      
      fetchApplicationStatus(); // Refresh status from backend
      return true;
    } catch (err) {
      console.error(err);
      setSaveMessage(err?.message || 'Application submit failed');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const SidebarContent = ({ closeOnClick }) => (
    <div className="flex flex-col h-full font-sans">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
          {(formData.fullName || user?.full_name) ? ((formData.fullName || user.full_name).charAt(0).toUpperCase()) : <FiUser />}
        </div>
        <div className="overflow-hidden">
          <div className="text-sm font-semibold text-slate-900 truncate" title={user?.full_name || formData.fullName}>
            {user?.full_name || formData.fullName || 'Student'}
          </div>
          <div className="text-xs text-slate-500 truncate">{user?.roll_number || formData.rollNumber || ''}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <button onClick={() => { setActive('dashboard'); if (closeOnClick) setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${active === 'dashboard' ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <FiHome className={`text-lg ${active === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Overview</span>
        </button>

        <button onClick={() => { setActive('form'); if (closeOnClick) setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${active === 'form' ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <FiFileText className={`text-lg ${active === 'form' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>My Application</span>
        </button>

        <button onClick={() => { setActive('status'); if (closeOnClick) setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${active === 'status' ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <FiActivity className={`text-lg ${active === 'status' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Track Status</span>
        </button>
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all">
          <FiLogOut className="text-lg" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const hasSubmittedApplication = !!(lastStatusBody && lastStatusBody.application && lastStatusBody.application.id);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm sticky top-6 h-[calc(100vh-3rem)]">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:hidden`}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 h-full">
              <div className="flex justify-end mb-2">
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><FiX className="w-6 h-6" /></button>
              </div>
              <SidebarContent closeOnClick />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="md:col-span-9 lg:col-span-10">
          <header className="flex md:hidden items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">{(formData.fullName || user?.full_name || 'S').charAt(0)}</div>
              <span className="font-semibold text-slate-900">{formData.fullName || 'Student'}</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"><FiMenu className="w-6 h-6" /></button>
          </header>

          {active === 'dashboard' && <Overview user={user} formData={formData} stepStatuses={stepStatuses} setActive={setActive} />}

          {active === 'form' && (
            <MyApplications
              user={user}
              formData={formData}
              locked={locked}
              formErrors={formErrors}
              submitting={submitting}
              uploading={uploading}
              saveMessage={saveMessage}
              handleChange={handleChange}
              handleSave={handleSave}
              hasSubmittedApplication={hasSubmittedApplication}
              isRejected={isRejected}
              rejectionDetails={rejectionDetails}
            />
          )}

          {active === 'status' && <TrackStatus stepStatuses={stepStatuses} departmentSteps={departmentSteps} loading={statusLoading} error={statusError} />}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;