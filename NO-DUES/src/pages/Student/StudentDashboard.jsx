import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  FiUser, FiClock, FiFileText, FiLogOut, FiMenu, FiX, 
  FiCheck, FiXCircle, FiRefreshCw, FiAlertCircle, 
  FiChevronRight, FiHome, FiActivity 
} from 'react-icons/fi';

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

// Default department sequence (used when backend does not provide names)
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
  const [pdf, setPdf] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDialogIndex, setShowDialogIndex] = useState(-1); // mobile tap dialog index

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
    admissionYear: '',
    section: '',
    batch: '',
    admissionType: ''
  });

  const [stepStatuses, setStepStatuses] = useState(() =>
    STATUS_STEPS.map(() => ({ status: 'pending', comment: '' }))
  );

  const [locked, setLocked] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const dialogsRef = useRef(null); // for detecting outside taps
  const statusMountedRef = useRef(false); // mounted flag for status polling

  // Allowed categories enforced by backend
  const VALID_CATEGORIES = ['GEN', 'OBC', 'SC', 'ST'];

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
      admissionYear: get(s, 'admission_year', 'admissionYear'),
      section: get(s, 'section'),
      batch: get(s, 'batch'),
      admissionType: get(s, 'admission_type', 'admissionType')
    };
    setFormData(mapped);

    const locks = {
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
      admissionYear: get(s, 'admission_year') !== '',
      section: get(s, 'section') !== '',
      batch: get(s, 'batch') !== '',
      admissionType: get(s, 'admission_type') !== ''
    };
    setLocked(locks);

    const backendStatuses = s?.step_statuses ?? null;
    const backendProgress = s?.process_progress ?? s?.progress ?? null;
    if (Array.isArray(backendStatuses) && backendStatuses.length === STATUS_STEPS.length) {
      setStepStatuses(backendStatuses.map(st => ({ status: st.status || 'pending', comment: st.comment || '' })));
    } else if (typeof backendProgress === 'number') {
      const p = Math.min(Math.max(0, backendProgress), STATUS_STEPS.length);
      const arr = STATUS_STEPS.map((_, i) => {
        if (i < p) return { status: 'completed', comment: '' };
        if (i === p && p < STATUS_STEPS.length) return { status: 'in_progress', comment: '' };
        return { status: 'pending', comment: '' };
      });
      setStepStatuses(arr);
    } else {
      setStepStatuses(STATUS_STEPS.map(() => ({ status: 'pending', comment: '' })));
    }
  }, [user]);

  // Dynamic steps
  const [departmentSteps, setDepartmentSteps] = useState(STATUS_STEPS);
  const [lastStatusBody, setLastStatusBody] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [showRawStatus, setShowRawStatus] = useState(false);

  /* ---------- fetch application status ---------- */
  const fetchApplicationStatus = async () => {
    if (!user) return;
    setStatusLoading(true);
    setStatusError('');
    try {
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, '');
      const url = API_BASE ? `${API_BASE}/api/applications/my` : `/api/applications/my`;

      const authToken = token || user?.access_token || user?.token || user?.accessToken || localStorage.getItem('studentToken') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(url, { method: 'GET', headers });
      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }
      
      setLastStatusBody(body);

      if (!statusMountedRef.current) { setStatusLoading(false); return; }
      if (!res.ok) { setStatusError(`Status fetch failed: ${res.status}`); setStatusLoading(false); return; }

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
      const startedFlag = !!(body?.flags?.is_in_progress || (body?.application && typeof body.application.status === 'string' && body.application.status.toLowerCase() !== 'pending' && body.application.status.toLowerCase() !== 'new'));
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

  /* ---------- body scroll lock ---------- */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (locked[name]) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartProcess = async () => {
    if (submitting) return;
    const ok = await handleSave();
    if (!ok) return;
    setStarted(true);
    setStepStatuses(prev => {
      const hasInProgress = prev.some(s => s.status === 'in_progress');
      if (hasInProgress) return prev;
      const next = prev.slice();
      const idx = next.findIndex(s => s.status === 'pending');
      if (idx >= 0) next[idx] = { ...next[idx], status: 'in_progress' };
      return next;
    });
  };

  /* ---------- Sidebar content ---------- */
  const SidebarContent = ({ closeOnClick }) => (
    <div className="flex flex-col h-full  font-sans">
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
        <button 
          onClick={() => { setActive('dashboard'); if (closeOnClick) setSidebarOpen(false); }} 
          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
            active === 'dashboard' 
              ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FiHome className={`text-lg ${active === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Overview</span>
        </button>

        <button 
          onClick={() => { setActive('form'); if (closeOnClick) setSidebarOpen(false); }} 
          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
            active === 'form' 
              ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FiFileText className={`text-lg ${active === 'form' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>My Application</span>
        </button>

        <button 
          onClick={() => { setActive('status'); if (closeOnClick) setSidebarOpen(false); }} 
          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
            active === 'status' 
              ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FiActivity className={`text-lg ${active === 'status' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Track Status</span>
        </button>
      </nav>

      <div className="pt-4 border-t border-slate-100 mt-auto">
        <button onClick={() => { handleLogout(); if (closeOnClick) setSidebarOpen(false); }} className="w-full inline-flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
          <FiLogOut className="text-lg" /> Sign Out
        </button>
      </div>
    </div>
  );

  /* ---------- New Timeline Component (Order Tracking Style) ---------- */
  const TrackingTimeline = ({ steps, statuses }) => {
    // Calculate progress percentage
    const total = steps.length;
    const completedCount = statuses.filter(s => s.status === 'completed').length;
    const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return (
      <div className="w-full">
        {/* Progress Header */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Progress</div>
              <div className="text-2xl font-bold text-slate-900">{progressPercent}% <span className="text-sm font-normal text-slate-500">Completed</span></div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Next Step</div>
              <div className="font-medium text-blue-600">
                {steps[statuses.findIndex(s => s.status === 'in_progress') !== -1 
                  ? statuses.findIndex(s => s.status === 'in_progress') 
                  : statuses.findIndex(s => s.status === 'pending')] || 'Completed'}
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        {/* Detailed Vertical Timeline */}
        <div className="relative pl-4 sm:pl-6 space-y-0">
          {/* Vertical Line Background */}
          <div className="absolute left-8 top-2 bottom-4 w-0.5 bg-slate-200 md:left-[2.25rem]" aria-hidden="true"></div>

          {steps.map((label, idx) => {
            const st = statuses[idx] || { status: 'pending', comment: '' };
            const statusKey = (st.status || 'pending').toLowerCase();
            
            let statusConfig = {
              icon: <div className="w-2.5 h-2.5 bg-slate-300 rounded-full" />,
              colorClass: 'border-slate-300 bg-white text-slate-300',
              textClass: 'text-slate-500',
              badge: null
            };

            if (statusKey === 'completed') {
              statusConfig = {
                icon: <FiCheck className="w-5 h-5" />,
                colorClass: 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200',
                textClass: 'text-slate-900',
                badge: <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 rounded-full border border-blue-100">Cleared</span>
              };
            } else if (statusKey === 'in_progress' || statusKey === 'inprogress') {
              statusConfig = {
                icon: <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />,
                colorClass: 'border-blue-600 bg-white text-blue-600 ring-4 ring-blue-50',
                textClass: 'text-blue-700 font-semibold',
                badge: <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 rounded-full border border-amber-100">Processing</span>
              };
            } else if (statusKey === 'failed' || statusKey === 'rejected') {
              statusConfig = {
                icon: <FiX className="w-5 h-5" />,
                colorClass: 'border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-200',
                textClass: 'text-rose-700',
                badge: <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 bg-rose-50 rounded-full border border-rose-100">Action Required</span>
              };
            }

            return (
              <div key={idx} className="relative flex items-start group pb-8 last:pb-0">
                {/* Timeline Node */}
                <div className={`
                  relative z-10 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-colors duration-300
                  ${statusConfig.colorClass}
                `}>
                  {statusConfig.icon}
                </div>

                {/* Content */}
                <div className="flex-1 ml-4 md:ml-6 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h4 className={`text-sm md:text-base font-medium ${statusConfig.textClass}`}>
                      {label}
                    </h4>
                    {statusConfig.badge}
                  </div>
                  
                  {/* Status Message / Comment */}
                  {st.comment && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600">
                      <p className="flex items-start gap-2">
                        <span className="mt-0.5 text-slate-400"><FiFileText /></span>
                        {st.comment}
                      </p>
                    </div>
                  )}
                  
                  {statusKey === 'pending' && (
                    <p className="text-xs text-slate-400 mt-1">Waiting for initiation...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ---------- form validation & save ---------- */
  const handleSave = async () => {
    const errs = {};
    const require = (k, label) => {
      const v = (formData[k] ?? '').toString().trim();
      if (!v) errs[k] = `${label} is required`;
    };

    require('enrollmentNumber', 'Enrollment Number');
    require('rollNumber', 'Roll Number');
    require('fullName', 'Full Name');
    require('fatherName', "Father's Name");
    require('motherName', "Mother's Name");
    require('gender', 'Gender');
    require('category', 'Category');
    require('dob', 'DOB');
    require('mobile', 'Mobile');
    require('email', 'Email');
    require('domicile', 'Domicile');
    require('permanentAddress', 'Permanent Address');
    require('admissionYear', 'Admission Year');
    require('section', 'Section');
    require('batch', 'Batch');
    require('admissionType', 'Admission Type');

    if ((formData.isHosteller ?? '').toString() === 'Yes') {
      require('hostelName', 'Hostel Name');
      require('hostelRoom', 'Hostel Room');
    }

    setFormErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el && el.focus) el.focus();
      return false;
    }

    setSubmitting(true);
    setSaveMessage('');
    if (formData.category && !VALID_CATEGORIES.includes(formData.category)) {
      setFormErrors(prev => ({ ...prev, category: 'Invalid category selected' }));
      setSaveMessage('Please select a valid category');
      setSubmitting(false);
      return false;
    }

    try {
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, '');
      const url = API_BASE ? `${API_BASE}/api/applications/create` : `/api/applications/create`;

      const payload = {
        enrollment_number: formData.enrollmentNumber || user?.enrollment_number || null,
        roll_number: formData.rollNumber || user?.roll_number || null,
        full_name: formData.fullName || user?.full_name || null,
        father_name: formData.fatherName || null,
        mother_name: formData.motherName || null,
        gender: formData.gender || null,
        category: formData.category || null,
        dob: formData.dob || null,
        mobile_number: formData.mobile || user?.mobile_number || null,
        email: formData.email || user?.email || null,
        permanent_address: formData.permanentAddress || formData.domicile || null,
        domicile: formData.domicile || formData.permanentAddress || null,
        is_hosteller: formData.isHosteller === 'Yes',
        hostel_name: formData.hostelName || null,
        hostel_room: formData.hostelRoom || null,
        section: formData.section || null,
        batch: formData.batch || null,
        admission_year: formData.admissionYear || null,
        admission_type: formData.admissionType || null
      };

      payload.student_update = {
        father_name: formData.fatherName || null,
        mother_name: formData.motherName || null,
        gender: formData.gender || null,
        category: formData.category || null,
        dob: formData.dob || null,
        permanent_address: formData.permanentAddress || null,
        domicile: formData.domicile || null,
        is_hosteller: formData.isHosteller === 'Yes',
        hostel_name: formData.hostelName || null,
        hostel_room: formData.hostelRoom || null
      };

      const authToken = token || user?.access_token || user?.token || user?.accessToken || localStorage.getItem('studentToken') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }

      if (!res.ok) {
        if (res.status === 400 && body && typeof body === 'object' && body.detail) {
          setSaveMessage(body.detail);
          setSubmitting(false);
          return false;
        }
        const serverErrors = {};
        if (body && typeof body === 'object') {
          if (body.errors && typeof body.errors === 'object') {
            for (const k of Object.keys(body.errors)) {
              serverErrors[k] = Array.isArray(body.errors[k]) ? body.errors[k][0] : String(body.errors[k]);
            }
          } else {
            for (const k of Object.keys(body)) {
              if (Array.isArray(body[k])) serverErrors[k] = body[k][0];
            }
          }
        }
        if (Object.keys(serverErrors).length) {
          const mapped = {};
          for (const k of Object.keys(serverErrors)) {
            const fk = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            mapped[fk] = serverErrors[k];
          }
          setFormErrors(mapped);
          setSaveMessage('Please fix the highlighted fields.');
        } else {
          setSaveMessage(body && body.message ? body.message : `Save failed: ${res.status}`);
        }
        setSubmitting(false);
        return false;
      }

      setFormErrors({});
      setSaveMessage((body && (body.message || body.detail)) || 'Application submitted successfully');
      setStarted(true);
      setStepStatuses(prev => {
        try {
          const next = prev.map(s => ({ ...s }));
          if (next.length > 0) next[0] = { ...next[0], status: 'in_progress' };
          return next;
        } catch (e) {
          return prev;
        }
      });
      setLocked(prev => ({ ...prev, enrollmentNumber: true, rollNumber: true, fullName: true, email: true, mobile: true }));

      if (body && (body.student || body.user)) {
         payload.student_update = {
            father_name: formData.fatherName || null,
            mother_name: formData.motherName || null,
            gender: formData.gender || null,
            category: formData.category || null,
            dob: formData.dob || null,
            permanent_address: formData.permanentAddress || null,
            domicile: formData.domicile || null,
            is_hosteller: formData.isHosteller === 'Yes',
            hostel_name: formData.hostelName || null,
            hostel_room: formData.hostelRoom || null
          };
        const updated = body.student || body.user;
        try { localStorage.setItem('studentUser', JSON.stringify(updated)); } catch (e) { }
      }
      return true;
    } catch (err) {
      setSaveMessage(err?.message || 'Application submit failed');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = 'w-full px-4 py-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm sticky top-6 h-[calc(100vh-3rem)]">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:hidden`} aria-hidden={!sidebarOpen}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-white p-4 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-6">
               <span className="font-bold text-lg text-slate-800">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"><FiX className="w-5 h-5" /></button>
            </div>
            <SidebarContent closeOnClick />
          </aside>
        </div>

        <main className="md:col-span-9 lg:col-span-10 space-y-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                 {(formData.fullName || user?.full_name || 'S').charAt(0)}
               </div>
               <span className="font-semibold text-slate-900">Dashboard</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-50 border border-slate-200 text-slate-600"><FiMenu className="w-5 h-5" /></button>
          </div>

          {/* DASHBOARD VIEW */}
          {active === 'dashboard' && (
            <>
              {/* Welcome Card */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      Welcome, {formData.fullName?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base">
                      Manage your university No-Dues application and track your clearance status.
                    </p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                      onClick={handleStartProcess} 
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold shadow-md shadow-blue-100 transition-all ${stepStatuses.some(s => s.status === 'in_progress') ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      disabled={submitting || stepStatuses.some(s => s.status === 'in_progress') || stepStatuses.every(s => s.status === 'completed')}
                    >
                      {submitting ? 'Initiating...' : (stepStatuses.some(s => s.status === 'in_progress') ? 'Process Active' : 'Start Clearance')}
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <StatCard label="Enrollment No" value={formData.enrollmentNumber || user?.enrollment_number} />
                  <StatCard label="Roll No" value={formData.rollNumber || user?.roll_number} />
                  <StatCard label="Course" value={formData.batch || '—'} />
                  <StatCard label="Status" value={stepStatuses.every(s => s.status === 'completed') ? 'Cleared' : 'Pending'} highlight={stepStatuses.every(s => s.status === 'completed')} />
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setActive('form')}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FiFileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Edit Application</h3>
                  <p className="text-sm text-slate-500">Update your personal details and documents.</p>
                </button>

                <button 
                  onClick={() => setActive('status')}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FiActivity className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Track Progress</h3>
                  <p className="text-sm text-slate-500">View real-time status of your clearances.</p>
                </button>
              </div>
            </>
          )}

          {/* APPLICATION FORM VIEW */}
          {active === 'form' && (
            <Card className="p-0 rounded-2xl shadow-sm border border-slate-200 bg-white overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">Application Details</h2>
                <p className="text-sm text-slate-500 mt-1">Please ensure all information is correct before submitting.</p>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={async (e) => { e.preventDefault(); await handleSave(); }} className="space-y-6">
                  
                  {/* Section: Academic Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ReadOnlyField label="Enrollment Number" value={formData.enrollmentNumber || user?.enrollment_number} error={formErrors.enrollmentNumber} />
                      <ReadOnlyField label="Roll Number" value={formData.rollNumber || user?.roll_number} error={formErrors.rollNumber} />
                      <InputRow label="Admission Year" name="admissionYear" value={formData.admissionYear} onChange={handleChange} fieldClass={fieldClass} editable={!locked.admissionYear} error={formErrors.admissionYear} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputRow label="Batch" name="batch" value={formData.batch} onChange={handleChange} fieldClass={fieldClass} editable={!locked.batch} error={formErrors.batch} />
                        <InputRow label="Section" name="section" value={formData.section} onChange={handleChange} fieldClass={fieldClass} editable={!locked.section} error={formErrors.section} />
                      </div>
                      <SelectRow label="Admission Type" name="admissionType" value={formData.admissionType} onChange={handleChange} fieldClass={fieldClass} editable={!locked.admissionType} error={formErrors.admissionType} options={[{ v: 'Regular', l: 'Regular' }, { v: 'Lateral Entry', l: 'Lateral Entry' }, { v: 'Transfer', l: 'Transfer' }]} />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Section: Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ReadOnlyField label="Full Name" value={formData.fullName || user?.full_name} error={formErrors.fullName} />
                      <ReadOnlyField label="Email Address" value={formData.email || user?.email} error={formErrors.email} />
                      <ReadOnlyField label="Mobile Number" value={formData.mobile || user?.mobile_number} error={formErrors.mobile} />
                      <InputRow label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} fieldClass={fieldClass} editable={!locked.dob} error={formErrors.dob} />
                      <InputRow label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.fatherName} error={formErrors.fatherName} />
                      <InputRow label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.motherName} error={formErrors.motherName} />
                      <div className="grid grid-cols-2 gap-4">
                         <SelectRow 
                           label="Gender" 
                           name="gender" 
                           value={formData.gender} 
                           onChange={handleChange} 
                           fieldClass={fieldClass} 
                           editable={!locked.gender} 
                           error={formErrors.gender} 
                           options={[{ v: 'Male', l: 'Male' }, { v: 'Female', l: 'Female' }, { v: 'Other', l: 'Other' }]} // <-- ADDED THIS LINE
                         />
                         <SelectRow label="Category" name="category" value={formData.category} onChange={handleChange} fieldClass={fieldClass} editable={!locked.category} error={formErrors.category} options={VALID_CATEGORIES.map(c => ({ v: c, l: c }))} />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Section: Address & Hostel */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">Residential Details</h3>
                    <div className="grid grid-cols-1 gap-5">
                      <InputRow label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} fieldClass={fieldClass} editable={!locked.permanentAddress} error={formErrors.permanentAddress} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputRow label="Domicile State" name="domicile" value={formData.domicile} onChange={handleChange} fieldClass={fieldClass} editable={!locked.domicile} error={formErrors.domicile} />
                        <SelectRow label="Are you a Hosteller?" name="isHosteller" value={formData.isHosteller} onChange={handleChange} fieldClass={fieldClass} editable={!locked.isHosteller} error={formErrors.isHosteller} options={[{ v: 'No', l: 'No' }, { v: 'Yes', l: 'Yes' }]} />
                      </div>
                      
                      {formData.isHosteller === 'Yes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2">
                          <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelName} error={formErrors.hostelName} />
                          <InputRow label="Room Number" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelRoom} error={formErrors.hostelRoom} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save & Update'}
                    </Button>
                 
                  </div>
                  {saveMessage && (
                    <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${saveMessage.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                      {saveMessage.includes('success') ? <FiCheck className="w-5 h-5" /> : <FiAlertCircle className="w-5 h-5" />}
                      {saveMessage}
                    </div>
                  )}
                </form>
              </div>
            </Card>
          )}

          {/* STATUS TRACKING VIEW */}
          {active === 'status' && (
            <Card className="p-0 rounded-2xl shadow-sm border border-slate-200 bg-white overflow-hidden">
              <div className="p-6 md:p-8 bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    Order Tracking
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                      REF: {user?.roll_number}
                    </span>
                  </h2>
                  <p className="text-slate-500 mt-1 text-sm">Real-time status of your No-Dues Application</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={fetchApplicationStatus} 
                    disabled={statusLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all text-sm font-medium"
                  >
                    <FiRefreshCw className={statusLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  {statusError && <span className="text-xs text-rose-500 self-center">{statusError}</span>}
                </div>
              </div>

              <div className="p-6 md:p-8 bg-white">
                <TrackingTimeline steps={departmentSteps} statuses={stepStatuses} />
              </div>

              {/* Footer / Debug */}
              <div className="bg-slate-50 border-t border-slate-200 p-4">
                 <button 
                  onClick={() => setShowRawStatus(!showRawStatus)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                 >
                   {showRawStatus ? 'Hide Debug Data' : 'View Debug Data'}
                 </button>
                 {showRawStatus && (
                    <pre className="mt-2 p-4 bg-slate-900 text-slate-200 rounded-lg text-xs overflow-auto max-h-40">
                      {JSON.stringify(lastStatusBody, null, 2)}
                    </pre>
                 )}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

/* ---------- Improved Helper Components ---------- */
const StatCard = ({ label, value, highlight }) => (
  <div className={`p-4 rounded-xl border flex flex-col justify-center min-h-[5rem] ${highlight ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
    <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${highlight ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
    <span className={`text-lg font-bold truncate ${highlight ? 'text-emerald-700' : 'text-slate-700'}`}>{value || '—'}</span>
  </div>
);

const ReadOnlyField = ({ label, value, error }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium">
      {value || '—'}
    </div>
    {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
  </div>
);

const InputRow = ({ label, name, value, onChange, type = 'text', fieldClass, editable = true, error }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    <input 
      name={name} 
      value={value ?? ''} 
      onChange={onChange} 
      type={type}
      disabled={!editable}
      className={`${fieldClass} ${error ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400' : ''}`} 
    />
    {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
  </div>
);

const SelectRow = ({ label, name, value, onChange, fieldClass, editable = true, options, error }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative">
      <select 
        name={name} 
        value={value ?? ''} 
        onChange={onChange} 
        disabled={!editable}
        className={`${fieldClass} appearance-none ${error ? 'border-rose-300' : ''}`}
      >
        <option value="">Select Option</option>
        {options ? options.map((o, idx) => <option key={idx} value={o.v}>{o.l}</option>) : null}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
        <FiChevronRight className="rotate-90 w-4 h-4" />
      </div>
    </div>
    {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
  </div>
);

export default StudentDashboard;