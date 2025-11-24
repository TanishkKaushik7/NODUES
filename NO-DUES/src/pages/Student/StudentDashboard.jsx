import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FiUser, FiLogOut, FiFileText, FiMenu, FiX, FiCheck, FiXCircle, FiRefreshCw } from 'react-icons/fi';

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

  // Helper: decode JWT payload (no signature verification). Returns parsed payload or null.
  const decodeJwt = (t) => {
    if (!t || typeof t !== 'string') return null;
    try {
      const parts = t.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      // pad base64 string
      const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = padded.length % 4;
      const b64 = pad ? padded + '='.repeat(4 - pad) : padded;
      const json = atob(b64);
      return JSON.parse(json);
    } catch (e) {
      console.debug('decodeJwt failed', e);
      return null;
    }
  };

  /* ---------- load user data (same tolerant mapping you've used) ---------- */
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
      // Keep hosteller editable regardless of backend value
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

  // Dynamic steps (labels) driven by backend department sequence when available
  const [departmentSteps, setDepartmentSteps] = useState(STATUS_STEPS);
  const [lastStatusBody, setLastStatusBody] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [showRawStatus, setShowRawStatus] = useState(false);

  /* ---------- fetch application status from backend and map to steps ---------- */
  const fetchApplicationStatus = async () => {
    // Reusable fetch function so UI can call it on-demand (refresh) or via polling
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
      console.debug('Application /my response', { status: res.status, ok: res.ok, body });
        setLastStatusBody(body);

        if (!statusMountedRef.current) { setStatusLoading(false); return; }
        if (!res.ok) { setStatusError(`Status fetch failed: ${res.status}`); setStatusLoading(false); return; }

      if (!statusMountedRef.current) return;
      if (!res.ok) return; // don't update UI on error

      const mapStageToStatus = (stage, body) => {
        if (!stage) return { status: 'pending', comment: '' };
        const s = (stage.status || '').toString().toLowerCase();
        if (['completed', 'done', 'approved'].includes(s)) return { status: 'completed', comment: stage.remarks || '' };
        if (['rejected', 'denied'].includes(s)) return { status: 'failed', comment: stage.remarks || '' };
        if (body?.application && Number(body.application.current_department_id) === Number(stage.department_id)) return { status: 'in_progress', comment: stage.remarks || '' };
        return { status: 'pending', comment: stage.remarks || '' };
      };

      // Build a department sequence (array of {id,name,sequence_order})
      let deptSeq = null;
      if (body && Array.isArray(body.departments) && body.departments.length) {
        deptSeq = body.departments.map(d => ({ id: d.id, name: d.name || d.department_name || `Dept ${d.id}`, sequence_order: d.sequence_order ?? null }));
      } else if (Array.isArray(body.department_sequence) && body.department_sequence.length) {
        deptSeq = body.department_sequence.map(d => ({ id: d.id, name: d.name || d.department_name || `Dept ${d.id}`, sequence_order: d.sequence_order ?? null }));
      } else {
        // fallback to default department list (ensures all steps are shown)
        deptSeq = DEFAULT_DEPT_SEQUENCE.map(d => ({ id: d.id, name: d.name, sequence_order: d.sequence_order }));
      }

      // Build labels and append final 'Completed' step
      const stepLabels = [...deptSeq.map(d => d.name)];
      if (stepLabels[stepLabels.length - 1] !== 'Completed') stepLabels.push('Completed');
      // debug: show mapping results
        try { console.debug('Mapped departments', { deptSeq, stepLabels }); } catch (e) {}
      setDepartmentSteps(stepLabels);

      // Map statuses using stages info (match by department_id primarily, fallback to sequence_order)
      const stages = Array.isArray(body.stages) ? body.stages : [];
      const mappedStatuses = deptSeq.map((d) => {
        const stage = stages.find(s => Number(s.department_id) === Number(d.id) || (s.sequence_order != null && d.sequence_order != null && Number(s.sequence_order) === Number(d.sequence_order)));
        return mapStageToStatus(stage, body);
      });

      // Add final 'Completed' status based on flags or application.status
      const completedFlag = !!(body?.flags?.is_completed || (body?.application && typeof body.application.status === 'string' && body.application.status.toLowerCase() === 'completed'));
      mappedStatuses.push(completedFlag ? { status: 'completed', comment: '' } : { status: 'pending', comment: '' });

      setStepStatuses(mappedStatuses);
      try { console.debug('Set stepStatuses', mappedStatuses); } catch (e) {}
      // Update started state from flags/application
      const startedFlag = !!(body?.flags?.is_in_progress || (body?.application && typeof body.application.status === 'string' && body.application.status.toLowerCase() !== 'pending' && body.application.status.toLowerCase() !== 'new'));
      setStarted(startedFlag);
        setStatusLoading(false);
    } catch (e) {
      console.debug('fetchApplicationStatus error', e);
        setStatusError(e?.message || String(e));
        setStatusLoading(false);
    }
  };

  useEffect(() => {
    statusMountedRef.current = true;
    // initial fetch and periodic poll
    fetchApplicationStatus();
    const iv = setInterval(fetchApplicationStatus, 30000);
    return () => { statusMountedRef.current = false; clearInterval(iv); };
  }, [user, token]);

  /* ---------- body scroll lock for mobile sidebar ---------- */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  /* ---------- detect outside taps to close any mobile dialog ---------- */
  useEffect(() => {
    const onDown = (e) => {
      if (showDialogIndex === -1) return;
      // if click is outside dialogsRef, close
      if (!dialogsRef.current) return;
      if (!dialogsRef.current.contains(e.target)) {
        setShowDialogIndex(-1);
      }
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [showDialogIndex]);

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
    // Save first, then start process if save succeeded
    if (submitting) return; // prevent duplicate
    const ok = await handleSave();
    if (!ok) return; // validation or server errors
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

  const handlePdfChange = (e) => setPdf(e.target.files?.[0] || null);
  const handlePdfSubmit = (e) => { e.preventDefault(); if (!pdf) return alert('Please select a PDF to submit.'); alert(`PDF "${pdf.name}" submitted (mock).`); setPdf(null); };

  const fieldClass = 'w-full px-3 py-2 border border-gray-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200';

  /* ---------- Sidebar content ---------- */
  const SidebarContent = ({ closeOnClick }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg font-semibold shadow">
          {(formData.fullName || user?.full_name) ? ((formData.fullName || user.full_name).charAt(0).toUpperCase()) : <FiUser />}
        </div>
        <div>
          <div className="text-sm text-slate-500">Signed in as</div>
          <div className="font-medium text-slate-900 truncate" title={user?.full_name || formData.fullName || 'Student'}>{user?.full_name || formData.fullName || 'Student'}</div>
          <div className="text-xs text-slate-400">{user?.roll_number || formData.rollNumber || ''}</div>
        </div>
      </div>

      <nav className="mt-2 flex-1">
        <ul className="space-y-2">
          <li>
            <button onClick={() => { setActive('dashboard'); if (closeOnClick) setSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 ${active === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
              <FiFileText className="text-lg" /><span>Dashboard</span>
            </button>
          </li>
          <li>
            <button onClick={() => { setActive('form'); if (closeOnClick) setSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 ${active === 'form' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
              <FiFileText className="text-lg" /><span>Application</span>
            </button>
          </li>
          <li>
            <button onClick={() => { setActive('status'); if (closeOnClick) setSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 ${active === 'status' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>
              <span>Status</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button onClick={() => { handleLogout(); if (closeOnClick) setSidebarOpen(false); }} className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-slate-700 hover:bg-slate-50">
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );

  /* ---------- Stepper ---------- */
  const Stepper = ({ steps, statuses }) => {
    // mobile: 2 columns (4 rows) -> visually 2x4, md+: 4 columns (2 rows) -> 4x2
    return (
      <div className="w-full relative overflow-x-auto" ref={dialogsRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
          {steps.map((label, idx) => {
            const st = statuses[idx] || { status: 'pending', comment: '' };
            const completed = st.status === 'completed';
            const failed = st.status === 'failed';
            const inProgress = st.status === 'in_progress';
            const prewritten = st.comment || 'Department note: Required documents missing. Please contact the concerned department.';

            const col = idx % 4;
            const hasRightConnector = col < 3; // on md+ this draws horizontal connector to next
            const isStep4 = idx === 3;

            return (
              <div key={label} className="relative group">
                <div
                  className="flex flex-col items-center cursor-default"
                  // on mobile taps, allow toggling dialog for failed steps
                  onClick={(e) => {
                    if (failed) {
                      // toggle mobile dialog index
                      setShowDialogIndex(prev => prev === idx ? -1 : idx);
                    }
                  }}
                >
                  <div className="relative">
                    {completed ? (
                      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow">
                        <FiCheck className="text-white" />
                      </div>
                    ) : failed ? (
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow">
                        <FiXCircle className="text-white" />
                      </div>
                    ) : inProgress ? (
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center">
                        <div className="text-sm font-semibold text-blue-600">{idx + 1}</div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <div className="text-sm font-semibold text-slate-700">{idx + 1}</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-center max-w-[140px] text-slate-700">
                    {label}
                  </div>
                </div>

                {/* Horizontal connector: visible on md+ (connects 1→2→3→4 and 5→6→7→8) */}
                {hasRightConnector && (
                  <div
                    aria-hidden
                    className="hidden md:block"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '100%',
                      transform: 'translateY(-50%)',
                      width: '64px',
                      height: '2px',
                      background: (statuses[idx]?.status === 'completed' && statuses[idx + 1]?.status === 'completed') ? '#16a34a' : '#E5E7EB'
                    }}
                  />
                )}

                {/* small connector for mobile arrangement */}
                {hasRightConnector && (
                  <div className="md:hidden" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '100%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '2px',
                    background: '#E5E7EB'
                  }} />
                )}

                {/* vertical connector from step 4 -> 5 (short / half) on md+ */}
                {isStep4 && (
                  <div aria-hidden
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: '100%',
                      width: '2px',
                      height: '26px',
                      marginTop: 6,
                      background: '#9CA3AF',
                      opacity: 0.5,
                      borderRadius: 2,
                      zIndex: 5
                    }}
                    className="hidden md:block"
                  />
                )}

                {/* Desktop hover dialog (md+: shown by CSS group-hover) */}
                {failed && (
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -top-44 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto" style={{ minWidth: 240 }}>
                    <div className="bg-white border border-slate-200 rounded-md p-3 text-sm shadow-2xl text-slate-800">
                      <div className="font-semibold text-sm mb-1">{label} — Comment</div>
                      <div className="text-xs">{prewritten}</div>
                    </div>
                  </div>
                )}

                {/* Mobile dialog: controlled by showDialogIndex */}
                {failed && showDialogIndex === idx && (
                  <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50" style={{ minWidth: 220 }}>
                    <div className="bg-white border border-slate-200 rounded-md p-3 text-sm shadow-2xl text-slate-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm mb-1">{label} — Comment</div>
                          <div className="text-xs">{prewritten}</div>
                        </div>
                        <button onClick={() => setShowDialogIndex(-1)} className="ml-3 p-1 text-slate-500 hover:text-slate-700">
                          <FiX />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ---------- dev helpers ---------- */
  const getCurrentIndex = () => {
    const idx = stepStatuses.findIndex(s => s.status === 'in_progress');
    if (idx >= 0) return idx;
    const pending = stepStatuses.findIndex(s => s.status === 'pending');
    return pending >= 0 ? pending : -1;
  };
  const advanceStepDev = () => {
    setStepStatuses(prev => {
      const arr = prev.map(s => ({ ...s }));
      const cur = arr.findIndex(s => s.status === 'in_progress');
      if (cur === -1) {
        const firstPending = arr.findIndex(s => s.status === 'pending');
        if (firstPending === -1) return arr;
        arr[firstPending].status = 'in_progress';
        return arr;
      }
      if (arr[cur].status !== 'failed') arr[cur].status = 'completed';
      const nextPending = arr.findIndex((s, i) => i > cur && s.status === 'pending');
      if (nextPending !== -1) arr[nextPending].status = 'in_progress';
      return arr;
    });
  };
  const failStepDev = () => {
    const cur = getCurrentIndex();
    if (cur === -1) { alert('No in-progress step to fail. Advance a step first.'); return; }
    const prewritten = 'Department note: Required documents missing. Please contact the concerned department.';
    setStepStatuses(prev => {
      const arr = prev.map(s => ({ ...s }));
      arr[cur].status = 'failed';
      arr[cur].comment = prewritten;
      return arr;
    });
  };
  const resetSteps = () => { setStepStatuses(STATUS_STEPS.map(() => ({ status: 'pending', comment: '' }))); setStarted(false); };

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

    // If hosteller is yes, require hostel fields
    if ((formData.isHosteller ?? '').toString() === 'Yes') {
      require('hostelName', 'Hostel Name');
      require('hostelRoom', 'Hostel Room');
    }

    setFormErrors(errs);
    if (Object.keys(errs).length) {
      // focus first invalid
      const first = Object.keys(errs)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el && el.focus) el.focus();
      return false;
    }

    // All validation passed — send to backend
    setSubmitting(true);
    setSaveMessage('');
    // Ensure category is valid
    if (formData.category && !VALID_CATEGORIES.includes(formData.category)) {
      setFormErrors(prev => ({ ...prev, category: 'Invalid category selected' }));
      setSaveMessage('Please select a valid category');
      setSubmitting(false);
      return false;
    }

    // Allow students to create applications — backend issues `access_token` and student object on login.
    // (Do not block client-side based solely on the `role` claim.)
    try {
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, '');
      const url = API_BASE ? `${API_BASE}/api/applications/create` : `/api/applications/create`;

      // Build payload (snake_case) from formData and include student identifiers
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

      // Include nested student_update object to match backend expectation
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

      // Prefer token from context, fall back to common locations on the user object or localStorage
      const authToken = token || user?.access_token || user?.token || user?.accessToken || localStorage.getItem('studentToken') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      // Debug: mask token when logging to avoid exposing it fully in console
      try {
        const masked = authToken ? `Bearer ${authToken.slice(0, 20)}...` : null;
        console.debug('Application POST ->', { url, headers: { ...headers, Authorization: masked }, payload });
      } catch (e) {
        console.debug('Application POST -> (unable to mask token)', { url, payload });
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }

      // Debug: log response status and body to reproduce 403 details
      try {
        console.debug('Application POST response', { status: res.status, ok: res.ok, body });
      } catch (e) {
        console.debug('Application POST response (failed to log)', res.status);
      }

      if (!res.ok) {
        // If backend returns a 400 with a 'detail' message, prefer showing it directly
        if (res.status === 400 && body && typeof body === 'object' && body.detail) {
          setSaveMessage(body.detail);
          setSubmitting(false);
          return false;
        }
        // map server field errors to formErrors if present
        const serverErrors = {};
        if (body && typeof body === 'object') {
          // common patterns: { errors: { field: ['msg'] } } or { field: ['msg'] }
          if (body.errors && typeof body.errors === 'object') {
            for (const k of Object.keys(body.errors)) {
              const msg = Array.isArray(body.errors[k]) ? body.errors[k][0] : String(body.errors[k]);
              serverErrors[k] = msg;
            }
          } else {
            for (const k of Object.keys(body)) {
              if (Array.isArray(body[k])) serverErrors[k] = body[k][0];
            }
          }
        }
        if (Object.keys(serverErrors).length) {
          // translate snake_case server field names to our form keys
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

      // success
      setFormErrors({});
      setSaveMessage((body && (body.message || body.detail)) || 'Application submitted successfully');
      // Update first step to in_progress when application is created
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
      // Optionally lock fields after submit — keep enrollment/roll/name read-only
      setLocked(prev => ({ ...prev, enrollmentNumber: true, rollNumber: true, fullName: true, email: true, mobile: true }));

      // if backend returned updated student profile, try to persist to localStorage
      if (body && (body.student || body.user)) {

          // Include nested student_update object to match backend expectation
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
        try { localStorage.setItem('studentUser', JSON.stringify(updated)); } catch (e) { /* ignore */ }
      }
      return true;
    } catch (err) {
      console.error('Application submit failed', err);
      setSaveMessage(err?.message || 'Application submit failed');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Dev helper: send a canned test application POST (only shown in dev builds)
  const sendTestApplication = async () => {
    if (!confirm('Send dev test application POST to /api/applications/create?')) return;
    const rawBase = import.meta.env.VITE_API_BASE || '';
    const API_BASE = rawBase.replace(/\/+/g, '');
    const url = API_BASE ? `${API_BASE}/api/applications/create` : `/api/applications/create`;

    const testPayload = {
      enrollment_number: user?.enrollment_number || '123123213213',
      roll_number: user?.roll_number || '235ICS056',
      full_name: user?.full_name || 'Tanishk Kaushik',
      student_update: {
        father_name: 'aa',
        mother_name: 'bb',
        gender: 'Male',
        category: 'GEN',
        dob: '2025-11-24',
        permanent_address: 'sa',
        domicile: 'UP',
        is_hosteller: true,
        hostel_name: 'das',
        hostel_room: 'dsa'
      }
    };

    // choose auth token same as handleSave
    const authToken = token || user?.access_token || user?.token || user?.accessToken || localStorage.getItem('studentToken') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    try {
      const masked = authToken ? `Bearer ${authToken.slice(0, 20)}...` : null;
      console.debug('Dev test POST ->', { url, headers: { ...headers, Authorization: masked }, testPayload });
    } catch (e) {
      console.debug('Dev test POST ->', { url, testPayload });
    }

    try {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(testPayload) });
      let body = null;
      try { body = await res.json(); } catch (e) { body = null; }
      console.debug('Dev test POST response', { status: res.status, ok: res.ok, body });
      if (res.ok) {
        alert('Dev test POST succeeded');
        setSaveMessage('Dev test POST succeeded');
      } else {
        alert(`Dev test POST failed: ${res.status}`);
        setSaveMessage(body && body.message ? body.message : `Dev test failed: ${res.status}`);
      }
    } catch (e) {
      console.error('Dev test POST error', e);
      alert('Dev test POST error — see console');
      setSaveMessage('Dev test POST error (see console)');
    }
  };

  /* ---------- layout rendering ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-3 sm:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* desktop sidebar */}
        <aside className="hidden md:block md:col-span-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-lg sticky top-6 self-start h-[calc(100vh-48px)] overflow-auto">
            <SidebarContent />
          </div>
        </aside>

        {/* mobile sidebar overlay */}
        <div className={`fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'} md:hidden`} aria-hidden={!sidebarOpen}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-white p-5 shadow-lg transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Removed duplicated "Signed in as" header here.
                SidebarContent already contains the header, so render it directly and pass closeOnClick. */}
            <div className="flex items-center justify-between mb-4">
              <div /> {/* keep spacing so close button sits to right */}
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded hover:bg-gray-100"><FiX /></button>
            </div>

            <SidebarContent closeOnClick />
          </aside>
        </div>

        <main className="md:col-span-9 space-y-6">
          <div className="flex items-center justify-between md:hidden mb-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded bg-white border border-gray-200"><FiMenu /></button>
            <div className="text-lg font-semibold text-slate-900">Student Dashboard</div>
            <div />
          </div>

          {/* Header */}
          <Card className="p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 truncate">Student Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1 truncate">Manage NoDues application and documents</p>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-xs text-slate-500">Application</div>
              <div className={`text-sm font-semibold ${stepStatuses.every(s => s.status === 'completed') ? 'text-green-600' : 'text-yellow-600'}`}>
                {stepStatuses.every(s => s.status === 'completed') ? 'All cleared' : (stepStatuses.some(s => s.status === 'in_progress') ? `Step in progress` : 'Not started')}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" onClick={handleStartProcess} disabled={submitting || stepStatuses.some(s => s.status === 'in_progress') || stepStatuses.every(s => s.status === 'completed')}>
                  {submitting ? 'Submitting...' : (stepStatuses.some(s => s.status === 'in_progress') ? 'Process Started' : 'Start Process')}
                </Button>
                <Button variant="outline" onClick={() => setActive('status')} className="hidden sm:inline-block">View Status</Button>
              </div>
            </div>
          </Card>

          {/* DASHBOARD */}
          {active === 'dashboard' && (
            <Card className="p-4 sm:p-6 rounded-2xl shadow-lg overflow-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-semibold text-white" style={{ backgroundColor: '#2563eb' }}>
                    {(formData.fullName || user?.full_name) ? ((formData.fullName || user.full_name).charAt(0).toUpperCase()) : <FiUser />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">{formData.fullName || user?.full_name || 'Student Name'}</h3>
                  <div className="text-sm text-slate-500 mt-1 truncate">{formData.email || user?.email || 'Email not set'}</div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SummaryCard label="Enrollment" value={formData.enrollmentNumber || user?.enrollment_number || '—'} />
                    <SummaryCard label="Roll" value={formData.rollNumber || user?.roll_number || '—'} />
                    <SummaryCard label="Mobile" value={formData.mobile || user?.mobile_number || '—'} />
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={() => setActive('form')} className="w-full sm:w-auto">Edit Application</Button>
                    <Button variant="primary" onClick={() => setActive('status')} className="w-full sm:w-auto">Check Status</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* FORM */}
          {active === 'form' && (
            <Card className="p-4 sm:p-6 rounded-2xl shadow-lg overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Application / Registration Details</h2>
                <div className="text-sm text-slate-500">Missing registration fields are editable.</div>
              </div>

              <form onSubmit={async (e) => { e.preventDefault(); await handleSave(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <ReadOnlyRow label="Enrollment Number" value={formData.enrollmentNumber || user?.enrollment_number} />
                    {formErrors.enrollmentNumber && <div className="text-xs text-red-600 mt-1">{formErrors.enrollmentNumber}</div>}
                  </div>
                  <div>
                    <ReadOnlyRow label="Roll Number" value={formData.rollNumber || user?.roll_number} />
                    {formErrors.rollNumber && <div className="text-xs text-red-600 mt-1">{formErrors.rollNumber}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <ReadOnlyRow label="Full Name" value={formData.fullName || user?.full_name} />
                    {formErrors.fullName && <div className="text-xs text-red-600 mt-1">{formErrors.fullName}</div>}
                  </div>
                  <div>
                    <ReadOnlyRow label="Email" value={formData.email || user?.email} />
                    {formErrors.email && <div className="text-xs text-red-600 mt-1">{formErrors.email}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <ReadOnlyRow label="Mobile" value={formData.mobile || user?.mobile_number} />
                    {formErrors.mobile && <div className="text-xs text-red-600 mt-1">{formErrors.mobile}</div>}
                  </div>
                  <div>
                    <InputRow label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.fatherName} />
                    {formErrors.fatherName && <div className="text-xs text-red-600 mt-1">{formErrors.fatherName}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <InputRow label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.motherName} />
                    {formErrors.motherName && <div className="text-xs text-red-600 mt-1">{formErrors.motherName}</div>}
                  </div>
                  <div>
                    <SelectRow label="Gender" name="gender" value={formData.gender} onChange={handleChange} fieldClass={fieldClass} editable={!locked.gender} />
                    {formErrors.gender && <div className="text-xs text-red-600 mt-1">{formErrors.gender}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                  <SelectRow
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    fieldClass={fieldClass}
                    editable={!locked.category}
                    options={VALID_CATEGORIES.map(c => ({ v: c, l: c }))}
                  />
                  {formErrors.category && <div className="text-xs text-red-600 mt-1">{formErrors.category}</div>}
                  </div>
                  <div>
                    <InputRow label="DOB" name="dob" type="date" value={formData.dob} onChange={handleChange} fieldClass={fieldClass} editable={!locked.dob} />
                    {formErrors.dob && <div className="text-xs text-red-600 mt-1">{formErrors.dob}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <InputRow label="Domicile" name="domicile" value={formData.domicile} onChange={handleChange} fieldClass={fieldClass} editable={!locked.domicile} />
                    {formErrors.domicile && <div className="text-xs text-red-600 mt-1">{formErrors.domicile}</div>}
                  </div>
                  <div>
                    <SelectRow label="Hosteller" name="isHosteller" value={formData.isHosteller} onChange={handleChange} fieldClass={fieldClass} editable={!locked.isHosteller} options={[{ v: 'No', l: 'No' }, { v: 'Yes', l: 'Yes' }]} />
                    {formErrors.isHosteller && <div className="text-xs text-red-600 mt-1">{formErrors.isHosteller}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <InputRow label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} fieldClass={fieldClass} editable={!locked.permanentAddress} />
                    {formErrors.permanentAddress && <div className="text-xs text-red-600 mt-1">{formErrors.permanentAddress}</div>}
                  </div>
                </div>

                {formData.isHosteller === 'Yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelName} />
                      {formErrors.hostelName && <div className="text-xs text-red-600 mt-1">{formErrors.hostelName}</div>}
                    </div>
                    <div>
                      <InputRow label="Hostel Room" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelRoom} />
                      {formErrors.hostelRoom && <div className="text-xs text-red-600 mt-1">{formErrors.hostelRoom}</div>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <InputRow label="Section" name="section" value={formData.section} onChange={handleChange} fieldClass={fieldClass} editable={!locked.section} />
                    {formErrors.section && <div className="text-xs text-red-600 mt-1">{formErrors.section}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <InputRow label="Batch" name="batch" value={formData.batch} onChange={handleChange} fieldClass={fieldClass} editable={!locked.batch} />
                    {formErrors.batch && <div className="text-xs text-red-600 mt-1">{formErrors.batch}</div>}
                  </div>
                  <div>
                    <InputRow label="Admission Year" name="admissionYear" value={formData.admissionYear} onChange={handleChange} fieldClass={fieldClass} editable={!locked.admissionYear} />
                    {formErrors.admissionYear && <div className="text-xs text-red-600 mt-1">{formErrors.admissionYear}</div>}
                  </div>
                </div>

                <div>
                  <div>
                  <SelectRow
                    label="Admission Type"
                    name="admissionType"
                    value={formData.admissionType}
                    onChange={handleChange}
                    fieldClass={fieldClass}
                    editable={!locked.admissionType}
                    options={[
                      { v: 'Regular', l: 'Regular' },
                      { v: 'Lateral Entry', l: 'Lateral Entry' },
                      { v: 'Transfer', l: 'Transfer' }
                    ]}
                  />
                  {formErrors.admissionType && <div className="text-xs text-red-600 mt-1">{formErrors.admissionType}</div>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
                  <Button variant="primary" type="submit" className="w-full sm:w-auto" disabled={submitting}>{submitting ? 'Submitting...' : 'Save Changes'}</Button>
                  <Button variant="outline" onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      // registration-backed values
                      enrollmentNumber: user?.enrollment_number ?? prev.enrollmentNumber ?? '',
                      rollNumber: user?.roll_number ?? prev.rollNumber ?? '',
                      fullName: user?.full_name ?? prev.fullName ?? '',
                      mobile: user?.mobile_number ?? prev.mobile ?? '',
                      email: user?.email ?? prev.email ?? '',

                      // other profile fields
                      fatherName: user?.father_name ?? '',
                      motherName: user?.mother_name ?? '',
                      gender: user?.gender ?? '',
                      category: user?.category ?? '',
                      dob: user?.dob ?? '',
                      domicile: user?.domicile ?? '',
                      permanentAddress: user?.permanent_address ?? '',
                      isHosteller: typeof user?.is_hosteller === 'boolean' ? (user.is_hosteller ? 'Yes' : 'No') : '',
                      hostelName: user?.hostel_name ?? '',
                      hostelRoom: user?.hostel_room ?? '',
                    
                      section: user?.section ?? '',
                      batch: user?.batch ?? '',
                      admissionYear: user?.admission_year ?? '',
                      admissionType: user?.admission_type ?? ''
                    }));
                  }} className="w-full sm:w-auto">Reset</Button>
                  {import.meta.env && import.meta.env.DEV && (
                    <Button variant="outline" type="button" onClick={sendTestApplication} className="w-full sm:w-auto">Dev: Send Test</Button>
                  )}
                </div>
                {saveMessage && <div className="mt-2 text-sm text-slate-600">{saveMessage}</div>}
              </form>
            </Card>
          )}

          {/* STATUS */}
          {active === 'status' && (
            <Card className="p-4 sm:p-6 rounded-2xl shadow-lg overflow-auto">
              <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Application Status</h2>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-500">Track your clearance progress</div>
                  <button onClick={fetchApplicationStatus} title="Refresh status" className="p-2 rounded hover:bg-slate-100 text-slate-600" disabled={statusLoading} aria-busy={statusLoading}>
                    <FiRefreshCw className={statusLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <Stepper steps={departmentSteps} statuses={stepStatuses} />
              </div>

              <div className="mb-3 flex items-start gap-3">
                <button onClick={() => setShowRawStatus(prev => !prev)} className="text-sm text-slate-600 underline hover:text-slate-800">{showRawStatus ? 'Hide raw response' : 'Show raw response'}</button>
                {statusLoading && <div className="text-sm text-slate-500">Refreshing...</div>}
                {statusError && <div className="text-sm text-red-600">{statusError}</div>}
              </div>

              {showRawStatus && (
                <div className="mb-4 bg-slate-50 border border-slate-100 rounded p-3 text-xs text-slate-800 overflow-auto max-h-64">
                  <pre className="whitespace-pre-wrap">{lastStatusBody ? JSON.stringify(lastStatusBody, null, 2) : 'No response captured yet'}</pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="text-sm text-slate-600">Completed {stepStatuses.filter(s => s.status === 'completed').length} of {departmentSteps.length}</div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={resetSteps}>Reset</Button>
                  <Button variant="outline" onClick={failStepDev}>Fail step (dev)</Button>
                  <Button variant="primary" onClick={advanceStepDev}>Advance step (dev)</Button>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

/* ---------- helpers ---------- */
const SummaryCard = ({ label, value }) => (
  <div className="p-3 bg-white border border-gray-100 rounded-lg text-sm min-w-0">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="font-medium text-slate-800 mt-1 truncate">{value ?? '—'}</div>
  </div>
);

const ReadOnlyRow = ({ label, value }) => (
  <div>
    <label className="block text-sm mb-1 text-slate-600">{label}</label>
    <div className="px-3 py-2 rounded-md bg-gray-50 text-slate-700 border border-transparent truncate">{value ?? '—'}</div>
  </div>
);

const InputRow = ({ label, name, value, onChange, type = 'text', fieldClass, editable = true }) => (
  <div>
    <label className="block text-sm mb-1 text-slate-700">{label}</label>
    <input name={name} value={value ?? ''} onChange={onChange} type={type}
      className={editable ? fieldClass : 'w-full px-3 py-2 rounded-md bg-gray-50 text-slate-700 border border-transparent cursor-not-allowed'} disabled={!editable} />
  </div>
);

const SelectRow = ({ label, name, value, onChange, fieldClass, editable = true, options }) => (
  <div>
    <label className="block text-sm mb-1 text-slate-700">{label}</label>
    {editable ? (
      <select name={name} value={value ?? ''} onChange={onChange} className={fieldClass}>
        {options ? (
          <>
            <option value="">Select</option>
            {options.map((o, idx) => <option key={idx} value={o.v}>{o.l}</option>)}
          </>
        ) : (
          <>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </>
        )}
      </select>
    ) : (
      <div className="px-3 py-2 rounded-md bg-gray-50 text-slate-700 border border-transparent truncate">{value ?? '—'}</div>
    )}
  </div>
);

export default StudentDashboard;