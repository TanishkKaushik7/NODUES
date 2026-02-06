import React, { useState, useEffect } from 'react';
import { 
  FiCheck, FiInfo, FiClock, FiAlertCircle, 
  FiBookOpen, FiUser, FiHome, 
  FiFileText, FiUploadCloud, FiRefreshCw, FiCheckCircle, FiDownload 
} from 'react-icons/fi';

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- COMPONENTS ---
const Button = React.forwardRef(({ className, variant = "primary", disabled, children, ...props }, ref) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-600"
  };
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn("inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
});

const Label = ({ children, required }) => (
  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
    {children} {required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

const ReadOnlyField = ({ label, value, error }) => (
  <div className="group">
    <Label required>{label}</Label>
    <div className="w-full px-4 py-3 bg-slate-50/80 border border-slate-100 rounded-xl text-slate-600 text-sm font-bold flex items-center gap-2">
      <span className="truncate">{value || '—'}</span>
    </div>
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1">
        <FiAlertCircle size={12}/> {typeof error === 'string' ? error : "Invalid value"}
      </span>
    )}
  </div>
);

const InputRow = ({ label, name, value, onChange, type = 'text', editable = true, error, required = true, placeholder = "" }) => (
  <div className="group">
    <Label required={required}>{label}</Label>
    <input 
      name={name} 
      value={value ?? ''} 
      onChange={onChange} 
      type={type}
      placeholder={placeholder}
      disabled={!editable}
      className={cn(
        "w-full rounded-xl px-4 py-3 text-sm font-bold border outline-none transition-all",
        editable 
          ? "bg-white border-slate-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/10" 
          : "bg-slate-50 text-slate-400 border-slate-100",
        error ? "border-rose-400 bg-rose-50/50" : ""
      )}
    />
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1">
        <FiAlertCircle size={12}/> {typeof error === 'string' ? error : "Invalid value"}
      </span>
    )}
  </div>
);

const SelectRow = ({ label, name, value, onChange, editable = true, options, error, required = true }) => (
  <div className="group">
    <Label required={required}>{label}</Label>
    <div className="relative">
      <select 
        name={name} 
        value={value ?? ''} 
        onChange={onChange} 
        disabled={!editable}
        className={cn(
            "w-full appearance-none rounded-xl px-4 py-3 text-sm font-bold border outline-none transition-all",
            editable 
              ? "bg-white border-slate-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/10" 
              : "bg-slate-50 text-slate-400 border-slate-100",
            error ? "border-rose-400 bg-rose-50/50" : ""
        )}
      >
        <option value="">Select Option</option>
        {options ? options.map((o, idx) => <option key={idx} value={o.v}>{o.l}</option>) : null}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
        </svg>
      </div>
    </div>
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1">
        <FiAlertCircle size={12}/> {typeof error === 'string' ? error : "Selection required"}
      </span>
    )}
  </div>
);

// ✅ DEPARTMENT CODES (Must match backend)
const DEPARTMENT_OPTIONS = [
    { v: "CSE", l: "Computer Science & Engg. (CSE)" },
    { v: "IT", l: "Information Technology (IT)" },
    { v: "ECE", l: "Electronics & Comm. (ECE)" },
    { v: "ME", l: "Mechanical Engineering (ME)" },
    { v: "CE", l: "Civil Engineering (CE)" },
    { v: "EE", l: "Electrical Engineering (EE)" },
    { v: "BT", l: "Biotechnology (BT)" },
    { v: "MGMT", l: "Management Studies" },
    { v: "LAW", l: "Law & Justice" },
    { v: "HSS", l: "Humanities & Social Sciences" },
    { v: "AP", l: "Architecture & Planning" },
    { v: "MATH", l: "Applied Mathematics" },
    { v: "PHY", l: "Applied Physics" }
];

const MyApplications = ({ 
  user, formData, locked, formErrors: externalErrors, submitting, uploading, 
  saveMessage, handleChange, handleSave, hasSubmittedApplication,
  isRejected, rejectionDetails, stepStatuses, applicationId, token,
  isCompleted 
}) => {
  const [certDownloading, setCertDownloading] = useState(false);
  const [localFileError, setLocalFileError] = useState(''); 
  const [validationError, setValidationError] = useState('');
  const [localFieldErrors, setLocalFieldErrors] = useState({});
  const [deptOptions] = useState(DEPARTMENT_OPTIONS); 

  const isFullyCleared = isCompleted || (stepStatuses?.length > 0 && stepStatuses?.every(s => s.status === 'completed'));
  const combinedErrors = { ...externalErrors, ...localFieldErrors };

  const getSafeErrorMsg = (msg) => {
    if (!msg) return null;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.map(e => e.msg || 'Error').join(', ');
    if (typeof msg === 'object') return msg.msg || msg.detail || 'Validation Error';
    return "Unknown Error";
  };

  const validateAndSave = () => {
    setValidationError('');
    setLocalFieldErrors({});
    
    // ✅ NO BATCH IN MANDATORY KEYS
    const mandatoryKeys = [
      'enrollmentNumber', 'rollNumber', 'admissionYear', 'section', 
      'admissionType', 'dob', 'fatherName', 'motherName', 'gender', 
      'category', 'permanentAddress', 'isHosteller', 'proof_document_url',
      'departmentCode' // ✅ Critical for new flow
    ];

    if (formData.isHosteller === 'Yes') mandatoryKeys.push('hostelName', 'hostelRoom');
    if (isRejected) mandatoryKeys.push('remarks');

    const newErrors = {};
    mandatoryKeys.forEach(key => {
      if (!formData[key] || String(formData[key]).trim() === '') {
        newErrors[key] = `Required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setLocalFieldErrors(newErrors);
      setValidationError('Please fill all highlighted fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // ✅ DEBUGGING LOG
    console.log("🚀 Submitting Application Payload...");
    console.log("Department Code:", formData.departmentCode);

    // ✅ CORRECT PAYLOAD (NO BATCH)
    const payload = {
      proof_document_url: formData.proof_document_url,
      remarks: !isRejected ? (formData.remarks || "") : undefined,
      student_remarks: isRejected ? (formData.remarks || "") : undefined,
      
      father_name: formData.fatherName,
      mother_name: formData.motherName,
      gender: formData.gender,
      category: formData.category,
      dob: formData.dob,
      permanent_address: formData.permanentAddress,
      domicile: formData.domicile || "State", 
      
      is_hosteller: formData.isHosteller === 'Yes',
      hostel_name: formData.isHosteller === 'Yes' ? formData.hostelName : null,
      hostel_room: formData.isHosteller === 'Yes' ? formData.hostelRoom : null,
      
      section: formData.section,
      admission_year: parseInt(formData.admissionYear),
      admission_type: formData.admissionType,
      
      // ✅ VITAL: Sending department_code
      department_code: formData.departmentCode 
    };

    handleSave(payload);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setLocalFileError('Max 5MB allowed');
      e.target.value = null; 
      return;
    }
    setLocalFileError('');
    handleChange(e); 
  };

  const handleDownloadCertificate = async () => {
    if (!applicationId) return;
    setCertDownloading(true);
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/g, '');
      const authToken = token || localStorage.getItem('studentToken');
      const response = await fetch(`${API_BASE}/api/applications/${applicationId}/certificate`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error('Certificate not found.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Clearance_Certificate_${formData.rollNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message);
    } finally {
      setCertDownloading(false);
    }
  };

  if (isFullyCleared) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center flex flex-col items-center">
        <FiCheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-900 mb-4">Clearance Completed</h2>
        <Button onClick={handleDownloadCertificate} disabled={certDownloading} variant="success" className="w-full max-w-xs py-4">
          {certDownloading ? <FiRefreshCw className="animate-spin" /> : <FiDownload size={18} />} Download Certificate
        </Button>
      </div>
    );
  }

  if (hasSubmittedApplication && !isRejected) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center flex flex-col items-center">
        <FiClock className="w-20 h-20 text-blue-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Processing</h2>
        <p className="text-slate-500 text-sm">Your application is under review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {(isRejected || validationError) && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex gap-4">
          <FiAlertCircle className="w-6 h-6 text-rose-600" />
          <div>
            <h3 className="text-lg font-black text-rose-900">{validationError ? 'Form Incomplete' : 'Correction Required'}</h3>
            <p className="text-sm text-rose-800">{validationError ? getSafeErrorMsg(validationError) : getSafeErrorMsg(rejectionDetails?.remarks)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          {/* ✅ VISUAL MARKER: Ensure this says '(Fixed)' */}
          <h2 className="text-lg font-black text-slate-900">Application Form (Fixed)</h2>
          {saveMessage && (
            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">{getSafeErrorMsg(saveMessage)}</div>
          )}
        </div>
        
        <div className="p-10 space-y-10">
          <section className="space-y-6">
            <h3 className="text-sm font-black text-slate-800 border-b pb-2">Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputRow label="Enrollment Number" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleChange} editable={!locked.enrollmentNumber} error={getSafeErrorMsg(combinedErrors.enrollmentNumber)} />
              <InputRow label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} editable={!locked.rollNumber} error={getSafeErrorMsg(combinedErrors.rollNumber)} />
              <InputRow label="Admission Year" name="admissionYear" type="number" value={formData.admissionYear} onChange={handleChange} editable={!locked.admissionYear} error={getSafeErrorMsg(combinedErrors.admissionYear)} />
              
              {/* ✅ DEPARTMENT SELECTION */}
              <SelectRow 
                label="Academic Department" 
                name="departmentCode" 
                value={formData.departmentCode} 
                onChange={handleChange} 
                editable={!locked.departmentCode} 
                error={getSafeErrorMsg(combinedErrors.departmentCode)} 
                options={deptOptions} 
                required
              />
              
              <SelectRow label="Section" name="section" value={formData.section} onChange={handleChange} editable={!locked.section} error={getSafeErrorMsg(combinedErrors.section)} options={[{v:'A',l:'A'}, {v:'B',l:'B'}, {v:'C',l:'C'}, {v:'D',l:'D'}]} />
              <SelectRow label="Admission Type" name="admissionType" value={formData.admissionType} onChange={handleChange} editable={!locked.admissionType} error={getSafeErrorMsg(combinedErrors.admissionType)} options={[{v:'Regular',l:'Regular'}, {v:'Lateral Entry',l:'Lateral Entry'}, {v:'Transfer',l:'Transfer'}]} />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-black text-slate-800 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyField label="Full Name" value={formData.fullName || user?.full_name} error={getSafeErrorMsg(combinedErrors.fullName)} />
                <ReadOnlyField label="Email" value={formData.email || user?.email} error={getSafeErrorMsg(combinedErrors.email)} />
                <InputRow label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} editable={!locked.fatherName} error={getSafeErrorMsg(combinedErrors.fatherName)} />
                <InputRow label="Mother Name" name="motherName" value={formData.motherName} onChange={handleChange} editable={!locked.motherName} error={getSafeErrorMsg(combinedErrors.motherName)} />
                <InputRow label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} editable={!locked.dob} error={getSafeErrorMsg(combinedErrors.dob)} />
                <div className="grid grid-cols-2 gap-4">
                    <SelectRow label="Gender" name="gender" value={formData.gender} onChange={handleChange} editable={!locked.gender} error={getSafeErrorMsg(combinedErrors.gender)} options={[{v:'Male',l:'Male'}, {v:'Female',l:'Female'}]} />
                    <SelectRow label="Category" name="category" value={formData.category} onChange={handleChange} editable={!locked.category} error={getSafeErrorMsg(combinedErrors.category)} options={[{v:'GEN',l:'GEN'}, {v:'OBC',l:'OBC'}, {v:'SC',l:'SC'}, {v:'ST',l:'ST'}]} />
                </div>
                <div className="md:col-span-2">
                    <Label required>Address</Label>
                    <textarea name="permanentAddress" value={formData.permanentAddress||''} onChange={handleChange} disabled={locked.permanentAddress} rows="3" className="w-full rounded-xl px-4 py-3 text-sm border border-slate-200" />
                </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-black text-slate-800 border-b pb-2">Other Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectRow label="Hosteller?" name="isHosteller" value={formData.isHosteller} onChange={handleChange} editable={!locked.isHosteller} error={getSafeErrorMsg(combinedErrors.isHosteller)} options={[{v:'Yes',l:'Yes'}, {v:'No',l:'No'}]} />
                {formData.isHosteller === 'Yes' && (
                    <>
                        <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} editable={!locked.hostelName} error={getSafeErrorMsg(combinedErrors.hostelName)} />
                        <InputRow label="Hostel Room" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} editable={!locked.hostelRoom} error={getSafeErrorMsg(combinedErrors.hostelRoom)} />
                    </>
                )}
                <div className="md:col-span-2">
                    <Label required>Proof Document (PDF)</Label>
                    <input type="file" onChange={onFileChange} accept="application/pdf" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {localFileError && <p className="text-rose-500 text-xs mt-1">{localFileError}</p>}
                </div>
                {/* Remarks Field */}
                <div className="md:col-span-2">
                    <Label required={isRejected}>Remarks</Label>
                    <textarea name="remarks" value={formData.remarks||''} onChange={handleChange} rows="2" className="w-full rounded-xl px-4 py-3 text-sm border border-slate-200" placeholder={isRejected ? "Reason for correction..." : "Optional notes"} />
                </div>
            </div>
          </section>

          <div className="pt-6 flex justify-end">
            <Button onClick={validateAndSave} disabled={submitting || uploading} className="px-12 py-4">
                {submitting ? <FiRefreshCw className="animate-spin" /> : (isRejected ? 'Resubmit' : 'Submit Application')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;