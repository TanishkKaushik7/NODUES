import React, { useState, useEffect } from 'react';
import { 
  FiAlertCircle, FiCheckCircle, FiDownload, FiRefreshCw, 
  FiUploadCloud, FiFile, FiMapPin, FiCalendar, FiUser, FiBookOpen
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- FULL INDIAN STATES & UT LIST (Universal) ---
const DOMICILE_OPTIONS = [
  { v: "Andhra Pradesh", l: "Andhra Pradesh" }, { v: "Arunachal Pradesh", l: "Arunachal Pradesh" },
  { v: "Assam", l: "Assam" }, { v: "Bihar", l: "Bihar" }, { v: "Chhattisgarh", l: "Chhattisgarh" },
  { v: "Goa", l: "Goa" }, { v: "Gujarat", l: "Gujarat" }, { v: "Haryana", l: "Haryana" },
  { v: "Himachal Pradesh", l: "Himachal Pradesh" }, { v: "Jharkhand", l: "Jharkhand" },
  { v: "Karnataka", l: "Karnataka" }, { v: "Kerala", l: "Kerala" }, { v: "Madhya Pradesh", l: "Madhya Pradesh" },
  { v: "Maharashtra", l: "Maharashtra" }, { v: "Manipur", l: "Manipur" }, { v: "Meghalaya", l: "Meghalaya" },
  { v: "Mizoram", l: "Mizoram" }, { v: "Nagaland", l: "Nagaland" }, { v: "Odisha", l: "Odisha" },
  { v: "Punjab", l: "Punjab" }, { v: "Rajasthan", l: "Rajasthan" }, { v: "Sikkim", l: "Sikkim" },
  { v: "Tamil Nadu", l: "Tamil Nadu" }, { v: "Telangana", l: "Telangana" }, { v: "Tripura", l: "Tripura" },
  { v: "Uttar Pradesh", l: "Uttar Pradesh" }, { v: "Uttarakhand", l: "Uttarakhand" },
  { v: "West Bengal", l: "West Bengal" }, { v: "Delhi", l: "Delhi (NCT)" }, { v: "Jammu and Kashmir", l: "Jammu and Kashmir" }
];

// --- REUSABLE UI COMPONENTS ---
const Label = ({ children, required }) => (
  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
    {children} {required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

const ReadOnlyField = ({ label, value, icon: Icon }) => (
  <div className="group">
    <Label>{label}</Label>
    <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-sm font-bold flex items-center gap-3 select-none">
      {Icon && <Icon className="text-slate-400" size={16} />}
      <span className="truncate">{value || '—'}</span>
    </div>
  </div>
);

const InputRow = ({ label, name, value, onChange, type = 'text', editable = true, error, required = true, placeholder = "", icon: Icon }) => (
  <div className="group relative">
    <Label required={required}>{label}</Label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-blue-500" size={16} />}
      <input 
        name={name} 
        value={value ?? ''} 
        onChange={onChange} 
        type={type}
        placeholder={placeholder}
        disabled={!editable}
        className={cn(
          "w-full rounded-xl py-3.5 text-sm font-bold border outline-none transition-all",
          Icon ? "pl-11 pr-4" : "px-4",
          editable ? "bg-white border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed",
          error ? "border-rose-400 bg-rose-50/30" : ""
        )}
      />
    </div>
    {error && <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1"><FiAlertCircle size={12}/> {error}</span>}
  </div>
);

const SelectRow = ({ label, name, value, onChange, editable = true, options, error, required = true, loading = false }) => (
  <div className="group">
    <Label required={required}>{label}</Label>
    <div className="relative">
      <select 
        name={name} 
        id={name}
        value={value ?? ''} 
        onChange={onChange} 
        disabled={!editable || loading}
        className={cn(
            "w-full appearance-none rounded-xl px-4 py-3.5 text-sm font-bold border outline-none transition-all cursor-pointer",
            editable ? "bg-white border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed",
            error ? "border-rose-400 bg-rose-50/30" : ""
        )}
      >
        <option value="">{loading ? 'Fetching List...' : 'Select Option'}</option>
        {options?.map((o, idx) => <option key={idx} value={o.v}>{o.l}</option>)}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
        {loading ? <FiRefreshCw className="animate-spin w-4 h-4" /> : <FiBookOpen className="w-4 h-4" />}
      </div>
    </div>
    {error && <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1"><FiAlertCircle size={12}/> {error}</span>}
  </div>
);

// --- MAIN COMPONENT ---
const MyApplications = ({ 
  user, formData, locked, formErrors: externalErrors, submitting, uploading, uploadProgress,
  handleChange, handleSave, hasSubmittedApplication,
  isRejected, rejectionDetails, stepStatuses, isCompleted 
}) => {
  const { authFetch } = useAuth();
  const [certDownloading, setCertDownloading] = useState(false);
  const [localFileError, setLocalFileError] = useState(''); 
  const [validationError, setValidationError] = useState('');
  const [localFieldErrors, setLocalFieldErrors] = useState({});

  // Dynamic Department State
  const [deptOptions, setDeptOptions] = useState([]);
  const [isDeptsLoading, setIsDeptsLoading] = useState(false);

  // ✅ 1. Fetch departments linked strictly to this student's school
  useEffect(() => {
    const fetchLinkedDepartments = async () => {
      const studentSchoolId = user?.student?.school_id || user?.school_id;
      if (!studentSchoolId) return;

      setIsDeptsLoading(true);
      try {
        const res = await authFetch(`/api/common/departments?type=academic&school_id=${studentSchoolId}`);
        if (res.ok) {
          const data = await res.json();
          setDeptOptions(data.map(d => ({ v: d.code, l: `${d.name} (${d.code})` })));
        }
      } catch (err) {
        console.error("Failed to fetch departments", err);
      } finally {
        setIsDeptsLoading(false);
      }
    };
    fetchLinkedDepartments();
  }, [user, authFetch]);

  const combinedErrors = { ...externalErrors, ...localFieldErrors };
  const isFullyCleared = isCompleted || (stepStatuses?.length > 0 && stepStatuses?.every(s => s.status === 'completed'));

  const getSafeErrorMsg = (msg) => {
    if (!msg) return null;
    return typeof msg === 'object' ? (msg.msg || msg.detail || 'Error') : msg;
  };

 const validateAndSave = () => {
    setValidationError('');
    setLocalFieldErrors({});
    
    const mandatoryKeys = [
      'enrollmentNumber', 'rollNumber', 'admissionYear', 'section', 
      'admissionType', 'dob', 'fatherName', 'motherName', 'gender', 
      'category', 'permanentAddress', 'domicile', 'proof_document_url', 'departmentCode'
    ];

    if (formData.isHosteller === 'Yes') mandatoryKeys.push('hostelName', 'hostelRoom');
    if (isRejected) mandatoryKeys.push('remarks');

    const newErrors = {};
    mandatoryKeys.forEach(key => {
      if (!formData[key] || String(formData[key]).trim() === '') {
        newErrors[key] = `Field Required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setLocalFieldErrors(newErrors);
      setValidationError('Please complete all required fields.');
      // ... (keep your scrolling logic here)
      return;
    }

    // ✅ FIXED PAYLOAD: Explicitly map camelCase (UI) to snake_case (Backend)
    const payload = {
      // Academic
      enrollment_number: formData.enrollmentNumber,
      roll_number: formData.rollNumber,
      department_code: formData.departmentCode,
      admission_year: parseInt(formData.admissionYear),
      admission_type: formData.admissionType,
      section: formData.section,

      // Personal
      full_name: formData.fullName || user?.full_name,
      email: formData.email || user?.email,
      father_name: formData.fatherName, // Fixed typo: was looking for 'father_naame' in your logs
      mother_name: formData.motherName,
      dob: formData.dob,
      gender: formData.gender,
      category: formData.category,
      domicile: formData.domicile,
      permanent_address: formData.permanentAddress,

      // Logistics
      is_hosteller: formData.isHosteller === 'Yes',
      hostel_name: formData.isHosteller === 'Yes' ? formData.hostelName : null,
      hostel_room: formData.isHosteller === 'Yes' ? formData.hostelRoom : null,
      
      // Proof & Remarks
      proof_document_url: formData.proof_document_url,
      remarks: formData.remarks || "No additional remarks",
      student_remarks: isRejected ? formData.remarks : undefined
    };

    handleSave(payload);
  };
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setLocalFileError('File size exceeds 5MB limit');
      e.target.value = null;
      return;
    }
    setLocalFileError('');
    handleChange(e); 
  };

  // --- RENDERING LOGIC ---

  if (isFullyCleared) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center flex flex-col items-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <FiCheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Clearance Completed</h2>
        <p className="text-slate-500 max-w-md mb-8">All departments have approved your request. You may now download your official clearance certificate.</p>
        <button onClick={() => {}} className="w-full max-w-xs py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 transition-all hover:bg-emerald-700">
          <FiDownload size={18} /> Download Certificate
        </button>
      </div>
    );
  }

  if (hasSubmittedApplication && !isRejected) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center flex flex-col items-center animate-in fade-in">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <FiRefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Under Review</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Your application is being processed by the administration. You will be notified of any status updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {(isRejected || validationError) && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex gap-4 animate-in slide-in-from-top-2">
          <FiAlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">{validationError ? 'Form Incomplete' : 'Correction Required'}</h3>
            <p className="text-sm text-rose-800 mt-1 font-bold">{validationError ? validationError : (rejectionDetails?.remarks || "Please address the comments provided below.")}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Clearance Application Form</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Academic Session 2025-2026</p>
          </div>
        </div>
        
        <div className="p-8 lg:p-12 space-y-12">
          {/* Section 01: Academic */}
          <section className="space-y-8">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">01</span>
                Academic Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputRow label="Enrollment Number" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleChange} editable={!locked.enrollmentNumber} error={getSafeErrorMsg(combinedErrors.enrollmentNumber)} />
              <InputRow label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} editable={!locked.rollNumber} error={getSafeErrorMsg(combinedErrors.rollNumber)} />
              
              <SelectRow 
                label="Batch" 
                name="departmentCode" 
                value={formData.departmentCode} 
                onChange={handleChange} 
                editable={!locked.departmentCode} 
                error={getSafeErrorMsg(combinedErrors.departmentCode)} 
                options={deptOptions} 
                loading={isDeptsLoading}
                required 
              />

              <div className="grid grid-cols-2 gap-4">
                  <InputRow label="Admission Year" name="admissionYear" type="number" value={formData.admissionYear} onChange={handleChange} editable={!locked.admissionYear} error={getSafeErrorMsg(combinedErrors.admissionYear)} />
                  <SelectRow label="Section" name="section" value={formData.section} onChange={handleChange} editable={!locked.section} error={getSafeErrorMsg(combinedErrors.section)} options={[{v:'A',l:'A'}, {v:'B',l:'B'}, {v:'C',l:'C'}, {v:'D',l:'D'}]} />
              </div>
              <SelectRow label="Admission Type" name="admissionType" value={formData.admissionType} onChange={handleChange} editable={!locked.admissionType} error={getSafeErrorMsg(combinedErrors.admissionType)} options={[{v:'Regular',l:'Regular'}, {v:'Lateral Entry',l:'Lateral Entry'}]} />
            </div>
          </section>

          {/* Section 02: Personal Details */}
          <section className="space-y-8">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">02</span>
                Student Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ReadOnlyField label="Full Name" value={formData.fullName || user?.full_name} icon={FiUser} />
                <ReadOnlyField label="Official Email" value={formData.email || user?.email} />
                <InputRow label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} editable={!locked.fatherName} error={getSafeErrorMsg(combinedErrors.fatherName)} />
                <InputRow label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} editable={!locked.motherName} error={getSafeErrorMsg(combinedErrors.motherName)} />
                <div className="grid grid-cols-2 gap-4">
                    <InputRow label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} editable={!locked.dob} error={getSafeErrorMsg(combinedErrors.dob)} icon={FiCalendar} />
                    <SelectRow label="Gender" name="gender" value={formData.gender} onChange={handleChange} editable={!locked.gender} error={getSafeErrorMsg(combinedErrors.gender)} options={[{v:'Male',l:'Male'}, {v:'Female',l:'Female'}]} />
                </div>
                <SelectRow label="Category" name="category" value={formData.category} onChange={handleChange} editable={!locked.category} error={getSafeErrorMsg(combinedErrors.category)} options={[{v:'GEN',l:'GEN'}, {v:'OBC',l:'OBC'}, {v:'SC',l:'SC'}, {v:'ST',l:'ST'}]} />
                <SelectRow label="Domicile State" name="domicile" value={formData.domicile} onChange={handleChange} editable={!locked.domicile} error={getSafeErrorMsg(combinedErrors.domicile)} options={DOMICILE_OPTIONS} required />
                <InputRow label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} editable={!locked.permanentAddress} error={getSafeErrorMsg(combinedErrors.permanentAddress)} icon={FiMapPin} />
            </div>
          </section>

          {/* Section 03: Logistics & Proof */}
          <section className="space-y-8">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">03</span>
                Uploads & Logistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SelectRow label="Hosteller Status" name="isHosteller" value={formData.isHosteller} onChange={handleChange} editable={!locked.isHosteller} error={getSafeErrorMsg(combinedErrors.isHosteller)} options={[{v:'Yes',l:'Yes'}, {v:'No',l:'No'}]} />
                    {formData.isHosteller === 'Yes' && (
                        <>
                            <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} editable={!locked.hostelName} error={getSafeErrorMsg(combinedErrors.hostelName)} />
                            <InputRow label="Room Number" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} editable={!locked.hostelRoom} error={getSafeErrorMsg(combinedErrors.hostelRoom)} />
                        </>
                    )}
                </div>

                <div className="md:col-span-2">
                    <Label required>Clearance Proof (PDF Only)</Label>
                    <div className={cn(
                        "mt-2 border-2 border-dashed rounded-3xl transition-all relative overflow-hidden",
                        uploading ? "border-blue-400 bg-blue-50/30" : 
                        combinedErrors.proof_document_url || localFileError ? "border-rose-300 bg-rose-50/30" : 
                        formData.proof_document_url ? "border-emerald-300 bg-emerald-50/30" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/10"
                    )}>
                        {!formData.proof_document_url && !uploading && (
                            <input type="file" name="proof_document_url" onChange={onFileChange} accept="application/pdf" disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        )}
                        <div className="p-10 text-center">
                            {uploading ? (
                                <div className="space-y-4">
                                    <FiUploadCloud className="w-10 h-10 text-blue-600 animate-bounce mx-auto" />
                                    <p className="text-sm font-black text-blue-900 uppercase">Uploading... {uploadProgress}%</p>
                                    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden max-w-xs mx-auto">
                                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            ) : formData.proof_document_url ? (
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><FiCheckCircle size={24} /></div>
                                    <div className="text-left"><p className="text-sm font-black text-emerald-900 uppercase">File Attached</p><p className="text-[10px] text-emerald-600 font-bold">CLEARANCE_PROOF.PDF</p></div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <FiUploadCloud size={32} className="text-slate-300 mx-auto" />
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Click to upload clearance proof</p>
                                    <p className="text-[9px] text-slate-400 font-bold italic">Max size: 5MB (PDF format only)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <Label required={isRejected}>{isRejected ? "Revision Notes" : "Additional Remarks"}</Label>
                    <textarea 
                        name="remarks" value={formData.remarks || ''} onChange={handleChange} rows="3" 
                        className="w-full rounded-2xl px-5 py-4 text-sm font-bold border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:font-medium placeholder:text-slate-300"
                        placeholder={isRejected ? "Explain the changes made for approval..." : "Provide any additional context for the approving officer..."} 
                    />
                </div>
            </div>
          </section>

          <div className="pt-8 flex justify-end border-t border-slate-100">
            <button 
              onClick={validateAndSave} 
              disabled={submitting || uploading || isDeptsLoading} 
              className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-xl active:scale-95 flex items-center gap-3"
            >
                {submitting ? <FiRefreshCw className="animate-spin" /> : (isRejected ? 'Resubmit Application' : 'Submit Application')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;