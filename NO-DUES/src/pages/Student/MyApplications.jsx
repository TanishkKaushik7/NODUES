import React, { useState } from 'react';
import { 
  FiCheck, FiInfo, FiClock, FiAlertCircle, 
  FiXCircle, FiBookOpen, FiUser, FiHome, 
  FiFileText, FiUploadCloud, FiRefreshCw, FiCheckCircle, FiDownload 
} from 'react-icons/fi';

// --- INTEGRATED UI UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- INTEGRATED UI COMPONENTS ---

const Button = React.forwardRef(({ className, variant = "primary", disabled, children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";
  
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
      className={cn(baseStyles, variants[variant], className)}
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
    <div className="w-full px-4 py-3 bg-slate-50/80 border border-slate-100 rounded-xl text-slate-600 text-sm font-bold flex items-center gap-2 group-hover:border-slate-200 transition-all">
      <span className="truncate">{value || '—'}</span>
    </div>
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
        <FiAlertCircle size={12}/> {error}
      </span>
    )}
  </div>
);

const InputRow = ({ label, name, value, onChange, type = 'text', editable = true, error, required = true }) => (
  <div className="group">
    <Label required={required}>{label}</Label>
    <input 
      name={name} 
      value={value ?? ''} 
      onChange={onChange} 
      type={type}
      disabled={!editable}
      className={cn(
        "w-full rounded-xl px-4 py-3 text-sm font-bold border outline-none transition-all",
        editable 
          ? "bg-white border-slate-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" 
          : "bg-slate-50 text-slate-400 border-slate-100",
        error ? "border-rose-400 bg-rose-50/50" : ""
      )}
    />
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
        <FiAlertCircle size={12}/> {error}
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
              ? "bg-white border-slate-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" 
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
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
        <FiAlertCircle size={12}/> {error}
      </span>
    )}
  </div>
);

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

  const combinedErrors = { ...externalErrors, ...localFieldErrors };
  const isFullyCleared = isCompleted || (stepStatuses?.length > 0 && stepStatuses?.every(s => s.status === 'completed'));

  const validateAndSave = (e) => {
    setValidationError('');
    setLocalFieldErrors({});
    
    const mandatoryKeys = [
      'enrollmentNumber', 'rollNumber', 'admissionYear', 'batch', 'section', 
      'admissionType', 'dob', 'fatherName', 'motherName', 'gender', 
      'category', 'permanentAddress', 'isHosteller', 'proof_document_url'
    ];

    if (formData.isHosteller === 'Yes') {
      mandatoryKeys.push('hostelName', 'hostelRoom');
    }

    const newErrors = {};
    mandatoryKeys.forEach(key => {
      if (!formData[key] || String(formData[key]).trim() === '') {
        newErrors[key] = `Required field`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setLocalFieldErrors(newErrors);
      setValidationError('Your application is incomplete. Please fill all highlighted fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // MAP TO BACKEND SCHEMA (Snake Case)
    const payload = {
      proof_document_url: formData.proof_document_url,
      remarks: formData.remarks || "",
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
      batch: formData.batch,
      admission_year: parseInt(formData.admissionYear),
      admission_type: formData.admissionType
    };

    handleSave(payload);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setLocalFileError(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 5MB.`);
      e.target.value = null; 
      return;
    }
    setLocalFileError('');
    setLocalFieldErrors(prev => ({ ...prev, proof_document_url: null }));
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
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-emerald-900/5 p-6 sm:p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 min-h-[450px] sm:min-h-[550px]">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <FiCheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase px-4">Clearance Completed</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-sm sm:text-base font-medium leading-relaxed px-4">
          Congratulations! Your digital clearance process is 100% complete and verified by all departments.
        </p>
        
        <div className="mt-10 flex flex-col items-center gap-6 w-full max-w-xs px-6">
          <Button 
            onClick={handleDownloadCertificate}
            disabled={certDownloading}
            variant="success"
            className="w-full py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]"
          >
            {certDownloading ? <FiRefreshCw className="animate-spin" /> : <FiDownload size={18} />}
            Download Certificate
          </Button>
        </div>
      </div>
    );
  }

  if (hasSubmittedApplication && !isRejected) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-6 sm:p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 min-h-[450px] sm:min-h-[550px]">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40">
                <FiClock className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase px-4">Application Processing</h2>
        <p className="text-slate-500 max-sm mx-auto text-sm sm:text-base font-medium leading-relaxed px-4">
          Your digital clearance is currently being reviewed by the administrative heads.
        </p>
        <div className="mt-10 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 max-w-md w-full">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-black uppercase tracking-widest">
            Check "Track Status" for real-time updates
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 mt-0 lg:mt-[-50px] animate-in fade-in duration-700">
      
      {(isRejected || validationError) && (
        <div className="relative group overflow-hidden bg-rose-50 border border-rose-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start shadow-sm mx-2 sm:mx-0 animate-in slide-in-from-top-4">
          <div className="p-3 sm:p-4 bg-rose-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-rose-200 flex-shrink-0">
              <FiAlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg sm:text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">
                {validationError ? 'Form Incomplete' : 'Correction Required'}
            </h3>
            <p className="text-rose-700/80 text-[11px] sm:text-sm font-bold mb-4 uppercase tracking-wide">
              {validationError ? 'Mandatory fields missing' : `Rejected by ${rejectionDetails?.role?.toUpperCase()}`}
            </p>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-rose-100 text-[11px] sm:text-xs font-bold text-rose-800 shadow-sm leading-relaxed">
              {validationError ? validationError : `"${rejectionDetails.remarks}"`}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden mx-2 sm:mx-0">
        <div className="p-6 sm:p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <FiFileText className="w-5 h-5 sm:w-6 sm:h-6"/>
            </div>
            <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">Application Form</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Clearance Registry</p>
            </div>
          </div>
          {saveMessage && (
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
              {saveMessage}
            </div>
          )}
        </div>
        
        <div className="p-6 sm:p-10 space-y-10 sm:space-y-12">
          {/* SECTION: ACADEMIC */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <FiBookOpen className="text-blue-600" size={18} />
                <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] text-slate-800">Academic Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <InputRow label="Enrollment Number" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleChange} editable={!locked.enrollmentNumber} error={combinedErrors.enrollmentNumber} />
              <InputRow label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} editable={!locked.rollNumber} error={combinedErrors.rollNumber} />
              <InputRow label="Admission Year" name="admissionYear" type="number" value={formData.admissionYear} onChange={handleChange} editable={!locked.admissionYear} error={combinedErrors.admissionYear} />
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="Batch" name="batch" value={formData.batch} onChange={handleChange} editable={!locked.batch} error={combinedErrors.batch} />
                <InputRow label="Section" name="section" value={formData.section} onChange={handleChange} editable={!locked.section} error={combinedErrors.section} />
              </div>
              <SelectRow label="Admission Type" name="admissionType" value={formData.admissionType} onChange={handleChange} editable={!locked.admissionType} error={combinedErrors.admissionType} options={[{ v: 'Regular', l: 'Regular' }, { v: 'Lateral Entry', l: 'Lateral Entry' }, { v: 'Transfer', l: 'Transfer' }]} />
            </div>
          </section>

          {/* SECTION: PERSONAL */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <FiUser className="text-blue-600" size={18} />
                <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] text-slate-800">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <ReadOnlyField label="Full Name" value={formData.fullName || user?.full_name} error={combinedErrors.fullName} />
              <ReadOnlyField label="Email Address" value={formData.email || user?.email} error={combinedErrors.email} />
              <ReadOnlyField label="Mobile Number" value={formData.mobile || user?.mobile_number} error={combinedErrors.mobile} />
              <InputRow label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} editable={!locked.dob} error={combinedErrors.dob} />
              <InputRow label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} editable={!locked.fatherName} error={combinedErrors.fatherName} />
              <InputRow label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} editable={!locked.motherName} error={combinedErrors.motherName} />
              <div className="grid grid-cols-2 gap-4">
                <SelectRow label="Gender" name="gender" value={formData.gender} onChange={handleChange} editable={!locked.gender} error={combinedErrors.gender} options={[{ v: 'Male', l: 'Male' }, { v: 'Female', l: 'Female' }, { v: 'Other', l: 'Other' }]} />
                <SelectRow label="Category" name="category" value={formData.category} onChange={handleChange} editable={!locked.category} error={combinedErrors.category} options={['GEN', 'OBC', 'SC', 'ST'].map(c => ({ v: c, l: c }))} />
              </div>
              <div className="md:col-span-2">
                <Label required>Permanent Address</Label>
                <textarea 
                  name="permanentAddress" 
                  value={formData.permanentAddress ?? ''} 
                  onChange={handleChange} 
                  disabled={locked.permanentAddress}
                  rows="3" 
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-sm font-bold border outline-none transition-all resize-none",
                    !locked.permanentAddress ? "bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" : "bg-slate-50 text-slate-400 border-slate-100",
                    combinedErrors.permanentAddress ? "border-rose-400 bg-rose-50/50" : ""
                  )} 
                />
                {combinedErrors.permanentAddress && (
                   <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      <FiAlertCircle size={12}/> {combinedErrors.permanentAddress}
                   </span>
                )}
              </div>
            </div>
          </section>

          {/* SECTION: LOGISTICS */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <FiHome className="text-blue-600" size={18} />
                <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] text-slate-800">Additional Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <SelectRow label="Are you a Hosteller?" name="isHosteller" value={formData.isHosteller} onChange={handleChange} editable={!locked.isHosteller} error={combinedErrors.isHosteller} options={[{ v: 'Yes', l: 'Yes' }, { v: 'No', l: 'No' }]} />
              
              {formData.isHosteller === 'Yes' && (
                <div className="md:contents grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 animate-in slide-in-from-top-2">
                  <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} editable={!locked.hostelName} error={combinedErrors.hostelName} />
                  <InputRow label="Hostel Room" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} editable={!locked.hostelRoom} error={combinedErrors.hostelRoom} />
                </div>
              )}
              
              <div className={cn(
                "md:col-span-2 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all",
                combinedErrors.proof_document_url ? "bg-rose-50/30 border-rose-200" : "bg-blue-50/30 border-blue-100/50"
              )}>
                <label className="block text-xs font-black text-blue-900 uppercase tracking-widest mb-4">Verification Document (PDF) <span className="text-rose-500">*</span></label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group cursor-pointer w-full sm:w-auto">
                    <input 
                      type="file" 
                      name="proof_document_url" 
                      accept="application/pdf" 
                      onChange={onFileChange}
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                      <FiUploadCloud size={16} /> {uploading ? 'Uploading...' : 'Choose PDF File'}
                    </div>
                  </div>
                  
                  {formData.proof_document_url && !localFileError && (
                    <div className="flex items-center justify-center gap-3 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 animate-in slide-in-from-left-2 w-full sm:w-auto">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <FiCheck size={14} />
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Document Secured</span>
                    </div>
                  )}
                </div>
                
                {(localFileError || combinedErrors.proof_document_url) && (
                  <div className="text-[10px] font-bold text-rose-500 mt-3 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <FiAlertCircle size={12}/> {localFileError || combinedErrors.proof_document_url}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Remarks (Optional)</label>
                <textarea 
                  name="remarks" 
                  value={formData.remarks ?? ''} 
                  onChange={handleChange} 
                  rows="2" 
                  placeholder="Provide additional context..."
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none" 
                />
              </div>
            </div>
          </section>

          <div className="pt-8 sm:pt-10 flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 gap-6">
            <div className="flex items-start sm:items-center gap-3 text-slate-400">
                <FiInfo size={20} className="mt-0.5 sm:mt-0 flex-shrink-0" />
                <p className="text-[11px] sm:text-xs font-medium max-w-xs leading-relaxed">By submitting, you confirm that all provided data is true to the university records.</p>
            </div>
            
            <Button 
              variant={isRejected ? "danger" : "primary"} 
              onClick={validateAndSave} 
              className="w-full sm:w-auto px-10 sm:px-12 py-3.5 sm:py-4 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl"
              disabled={submitting || uploading || !!localFileError}
            >
              {submitting ? (
                <div className="flex items-center gap-2"><FiRefreshCw className="animate-spin" /> Processing</div>
              ) : (isRejected ? 'Resubmit Application' : 'Finalize & Update')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;