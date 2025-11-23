import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FiUser, FiLogOut, FiFileText, FiMenu, FiX, FiCheck, FiXCircle } from 'react-icons/fi';

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

const StudentDashboard = () => {
  const { student: user, logout } = useStudentAuth();
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
    isHosteller: '',
    hostelName: '',
    department: '',
    admissionYear: '',
    section: '',
    batch: '',
    admissionType: ''
  });

  const [stepStatuses, setStepStatuses] = useState(() =>
    STATUS_STEPS.map(() => ({ status: 'pending', comment: '' }))
  );

  const [locked, setLocked] = useState({});
  const dialogsRef = useRef(null); // for detecting outside taps

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
      isHosteller:
        get(s, 'is_hosteller') === true || get(s, 'is_hosteller') === 'true'
          ? 'Yes'
          : get(s, 'is_hosteller') === false || get(s, 'is_hosteller') === 'false'
          ? 'No'
          : '',
      hostelName: get(s, 'hostel_name', 'hostelName'),
      department: get(s, 'department_id', 'department'),
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
      domicile: get(s, 'domicile') !== '' || get(s, 'permanent_address') !== '',
      isHosteller: s && (s.is_hosteller != null || s.isHosteller != null),
      hostelName: get(s, 'hostel_name') !== '',
      department: get(s, 'department_id', 'department') !== '',
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

  const handleStartProcess = () => {
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
                <Button variant="primary" onClick={handleStartProcess} disabled={stepStatuses.some(s => s.status === 'in_progress') || stepStatuses.every(s => s.status === 'completed')}>{stepStatuses.some(s => s.status === 'in_progress') ? 'Process Started' : 'Start Process'}</Button>
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

              <form onSubmit={(e) => { e.preventDefault(); alert('Saved locally (mock).'); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ReadOnlyRow label="Enrollment Number" value={formData.enrollmentNumber || user?.enrollment_number} />
                  <ReadOnlyRow label="Roll Number" value={formData.rollNumber || user?.roll_number} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ReadOnlyRow label="Full Name" value={formData.fullName || user?.full_name} />
                  <ReadOnlyRow label="Email" value={formData.email || user?.email} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ReadOnlyRow label="Mobile" value={formData.mobile || user?.mobile_number} />
                  <InputRow label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.fatherName} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputRow label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.motherName} />
                  <SelectRow label="Gender" name="gender" value={formData.gender} onChange={handleChange} fieldClass={fieldClass} editable={!locked.gender} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SelectRow label="Category" name="category" value={formData.category} onChange={handleChange} fieldClass={fieldClass} editable={!locked.category} />
                  <InputRow label="DOB" name="dob" type="date" value={formData.dob} onChange={handleChange} fieldClass={fieldClass} editable={!locked.dob} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputRow label="Domicile" name="domicile" value={formData.domicile} onChange={handleChange} fieldClass={fieldClass} editable={!locked.domicile} />
                  <SelectRow label="Hosteller" name="isHosteller" value={formData.isHosteller} onChange={handleChange} fieldClass={fieldClass} editable={!locked.isHosteller} options={[{ v: 'No', l: 'No' }, { v: 'Yes', l: 'Yes' }]} />
                </div>

                {formData.isHosteller === 'Yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelName} />
                    <InputRow label="Hostel Room" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelRoom} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputRow label="Department" name="department" value={formData.department} onChange={handleChange} fieldClass={fieldClass} editable={!locked.department} />
                  <InputRow label="Section" name="section" value={formData.section} onChange={handleChange} fieldClass={fieldClass} editable={!locked.section} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InputRow label="Batch" name="batch" value={formData.batch} onChange={handleChange} fieldClass={fieldClass} editable={!locked.batch} />
                  <InputRow label="Admission Year" name="admissionYear" value={formData.admissionYear} onChange={handleChange} fieldClass={fieldClass} editable={!locked.admissionYear} />
                </div>

                <div>
                  <SelectRow label="Admission Type" name="admissionType" value={formData.admissionType} onChange={handleChange} fieldClass={fieldClass} editable={!locked.admissionType} />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
                  <Button variant="primary" type="submit" className="w-full sm:w-auto">Save Changes</Button>
                  <Button variant="outline" onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      fatherName: user?.father_name ?? '',
                      motherName: user?.mother_name ?? '',
                      gender: user?.gender ?? '',
                      category: user?.category ?? '',
                      dob: user?.dob ?? '',
                      domicile: user?.domicile ?? '',
                      isHosteller: typeof user?.is_hosteller === 'boolean' ? (user.is_hosteller ? 'Yes' : 'No') : '',
                      hostelName: user?.hostel_name ?? '',
                      hostelRoom: user?.hostel_room ?? '',
                      department: user?.department_id ?? '',
                      section: user?.section ?? '',
                      batch: user?.batch ?? '',
                      admissionYear: user?.admission_year ?? '',
                      admissionType: user?.admission_type ?? ''
                    }));
                  }} className="w-full sm:w-auto">Reset</Button>
                </div>
              </form>
            </Card>
          )}

          {/* STATUS */}
          {active === 'status' && (
            <Card className="p-4 sm:p-6 rounded-2xl shadow-lg overflow-auto">
              <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Application Status</h2>
                <div className="text-sm text-slate-500">Track your clearance progress</div>
              </div>

              <div className="mb-6">
                <Stepper steps={STATUS_STEPS} statuses={stepStatuses} />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="text-sm text-slate-600">Completed {stepStatuses.filter(s => s.status === 'completed').length} of {STATUS_STEPS.length}</div>

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