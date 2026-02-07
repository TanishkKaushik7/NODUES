import React, { useState } from 'react';
import { 
  FiAlertCircle, FiCheckCircle, FiDownload, FiRefreshCw, 
  FiUploadCloud, FiFile, FiTrash2, FiMapPin, FiCalendar, FiUser
} from 'react-icons/fi';

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- FULL INDIAN STATES & UT LIST ---
const DOMICILE_OPTIONS = [
  { v: "Andhra Pradesh", l: "Andhra Pradesh" },
  { v: "Arunachal Pradesh", l: "Arunachal Pradesh" },
  { v: "Assam", l: "Assam" },
  { v: "Bihar", l: "Bihar" },
  { v: "Chhattisgarh", l: "Chhattisgarh" },
  { v: "Goa", l: "Goa" },
  { v: "Gujarat", l: "Gujarat" },
  { v: "Haryana", l: "Haryana" },
  { v: "Himachal Pradesh", l: "Himachal Pradesh" },
  { v: "Jharkhand", l: "Jharkhand" },
  { v: "Karnataka", l: "Karnataka" },
  { v: "Kerala", l: "Kerala" },
  { v: "Madhya Pradesh", l: "Madhya Pradesh" },
  { v: "Maharashtra", l: "Maharashtra" },
  { v: "Manipur", l: "Manipur" },
  { v: "Meghalaya", l: "Meghalaya" },
  { v: "Mizoram", l: "Mizoram" },
  { v: "Nagaland", l: "Nagaland" },
  { v: "Odisha", l: "Odisha" },
  { v: "Punjab", l: "Punjab" },
  { v: "Rajasthan", l: "Rajasthan" },
  { v: "Sikkim", l: "Sikkim" },
  { v: "Tamil Nadu", l: "Tamil Nadu" },
  { v: "Telangana", l: "Telangana" },
  { v: "Tripura", l: "Tripura" },
  { v: "Uttar Pradesh", l: "Uttar Pradesh" },
  { v: "Uttarakhand", l: "Uttarakhand" },
  { v: "West Bengal", l: "West Bengal" },
  { v: "Andaman and Nicobar Islands", l: "Andaman and Nicobar Islands" },
  { v: "Chandigarh", l: "Chandigarh" },
  { v: "Dadra and Nagar Haveli and Daman and Diu", l: "Dadra and Nagar Haveli and Daman and Diu" },
  { v: "Delhi", l: "Delhi (NCT)" },
  { v: "Jammu and Kashmir", l: "Jammu and Kashmir" },
  { v: "Ladakh", l: "Ladakh" },
  { v: "Lakshadweep", l: "Lakshadweep" },
  { v: "Puducherry", l: "Puducherry" }
];

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
      className={cn("inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
});

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
          "w-full rounded-xl py-3.5 text-sm font-bold border outline-none transition-all placeholder:text-slate-300",
          Icon ? "pl-11 pr-4" : "px-4",
          editable 
            ? "bg-white border-slate-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" 
            : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed",
          error ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10" : ""
        )}
      />
    </div>
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1 animate-in slide-in-from-top-1">
        <FiAlertCircle size={12}/> {typeof error === 'string' ? error : "Field Required"}
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
        id={name}
        value={value ?? ''} 
        onChange={onChange} 
        disabled={!editable}
        className={cn(
            "w-full appearance-none rounded-xl px-4 py-3.5 text-sm font-bold border outline-none transition-all cursor-pointer",
            editable 
              ? "bg-white border-slate-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" 
              : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed",
            error ? "border-rose-400 bg-rose-50/30" : ""
        )}
      >
        <option value="">Select Option</option>
        {options ? options.map((o, idx) => <option key={idx} value={o.v}>{o.l}</option>) : null}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
      </div>
    </div>
    {error && (
      <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1 animate-in slide-in-from-top-1">
        <FiAlertCircle size={12}/> Field Required
      </span>
    )}
  </div>
);

const MyApplications = ({ 
  user, formData, locked, formErrors: externalErrors, submitting, uploading, uploadProgress,
  handleChange, handleSave, hasSubmittedApplication,
  isRejected, rejectionDetails, stepStatuses, isCompleted 
}) => {
  const [certDownloading, setCertDownloading] = useState(false);
  const [localFileError, setLocalFileError] = useState(''); 
  const [validationError, setValidationError] = useState('');
  const [localFieldErrors, setLocalFieldErrors] = useState({});

  const isFullyCleared = isCompleted || (stepStatuses?.length > 0 && stepStatuses?.every(s => s.status === 'completed'));
  const combinedErrors = { ...externalErrors, ...localFieldErrors };

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
      setValidationError('Please complete all required fields highlighted below.');
      
      // ✅ SCROLL TO FIRST ERROR FIELD
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = document.getElementsByName(firstErrorKey)[0];
      
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Briefly focus the field so the user can see it
        setTimeout(() => errorElement.focus(), 500);
      }
      return;
    }

    const payload = {
      proof_document_url: formData.proof_document_url,
      remarks: !isRejected ? (formData.remarks || "Student Application") : undefined,
      student_remarks: isRejected ? (formData.remarks || "") : undefined,
      father_name: formData.fatherName,
      mother_name: formData.motherName,
      gender: formData.gender,
      category: formData.category,
      dob: formData.dob,
      permanent_address: formData.permanentAddress,
      domicile: formData.domicile, 
      department_code: formData.departmentCode,
      is_hosteller: formData.isHosteller === 'Yes',
      hostel_name: formData.isHosteller === 'Yes' ? formData.hostelName : null,
      hostel_room: formData.isHosteller === 'Yes' ? formData.hostelRoom : null,
      section: formData.section,
      admission_year: parseInt(formData.admissionYear),
      admission_type: formData.admissionType
    };

    handleSave(payload);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setLocalFileError('File size exceeds 5MB limit');
      e.target.value = null; 
      return;
    }
    setLocalFileError('');
    handleChange(e); 
  };

  if (isFullyCleared) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <FiCheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Clearance Completed</h2>
        <p className="text-slate-500 max-w-md mb-8">Congratulations! All departments have approved your request.</p>
        <Button onClick={() => {}} disabled={certDownloading} variant="success" className="w-full max-w-xs py-4 shadow-emerald-200 shadow-xl">
          {certDownloading ? <FiRefreshCw className="animate-spin" /> : <FiDownload size={18} />} Download Certificate
        </Button>
      </div>
    );
  }

  if (hasSubmittedApplication && !isRejected) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center flex flex-col items-center animate-in fade-in">
        <div className="relative mb-8">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                <FiRefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Processing Application</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">Your application has been submitted and is currently being reviewed by the respective departments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {(isRejected || validationError) && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex gap-4 animate-in slide-in-from-top-2">
          <FiAlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-black text-rose-900">{validationError ? 'Form Incomplete' : 'Action Required'}</h3>
            <p className="text-sm text-rose-800 mt-1">{validationError ? validationError : (rejectionDetails?.remarks || "Please correct the highlighted errors.")}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Clearance Form</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Academic Session 2025-2026</p>
          </div>
        </div>
        
        <div className="p-8 lg:p-12 space-y-12">
          <section className="space-y-8">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">01</span>
                Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputRow label="Enrollment Number" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleChange} editable={!locked.enrollmentNumber} error={getSafeErrorMsg(combinedErrors.enrollmentNumber)} />
              <InputRow label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} editable={!locked.rollNumber} error={getSafeErrorMsg(combinedErrors.rollNumber)} />
              <SelectRow label="Department" name="departmentCode" value={formData.departmentCode} onChange={handleChange} editable={!locked.departmentCode} error={getSafeErrorMsg(combinedErrors.departmentCode)} options={DEPARTMENT_OPTIONS} required />
              <div className="grid grid-cols-2 gap-4">
                  <InputRow label="Admission Year" name="admissionYear" type="number" value={formData.admissionYear} onChange={handleChange} editable={!locked.admissionYear} error={getSafeErrorMsg(combinedErrors.admissionYear)} />
                  <SelectRow label="Section" name="section" value={formData.section} onChange={handleChange} editable={!locked.section} error={getSafeErrorMsg(combinedErrors.section)} options={[{v:'A',l:'A'}, {v:'B',l:'B'}, {v:'C',l:'C'}, {v:'D',l:'D'}]} />
              </div>
              <SelectRow label="Admission Type" name="admissionType" value={formData.admissionType} onChange={handleChange} editable={!locked.admissionType} error={getSafeErrorMsg(combinedErrors.admissionType)} options={[{v:'Regular',l:'Regular'}, {v:'Lateral Entry',l:'Lateral Entry'}]} />
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">02</span>
                Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ReadOnlyField label="Full Name" value={formData.fullName || user?.full_name} icon={FiUser} />
                <ReadOnlyField label="Email" value={formData.email || user?.email} />
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

          <section className="space-y-8">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-lg flex items-center justify-center text-[10px]">03</span>
                Logistics & Proof
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SelectRow label="Are you a Hosteller?" name="isHosteller" value={formData.isHosteller} onChange={handleChange} editable={!locked.isHosteller} error={getSafeErrorMsg(combinedErrors.isHosteller)} options={[{v:'Yes',l:'Yes'}, {v:'No',l:'No'}]} />
                    {formData.isHosteller === 'Yes' && (
                        <>
                            <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} editable={!locked.hostelName} error={getSafeErrorMsg(combinedErrors.hostelName)} />
                            <InputRow label="Room Number" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} editable={!locked.hostelRoom} error={getSafeErrorMsg(combinedErrors.hostelRoom)} />
                        </>
                    )}
                </div>

                <div className="md:col-span-2">
                    <Label required>Clearance Proof (PDF)</Label>
                    <div className={cn(
                        "mt-2 border-2 border-dashed rounded-2xl transition-all relative overflow-hidden",
                        uploading ? "border-blue-400 bg-blue-50/30" : 
                        combinedErrors.proof_document_url || localFileError ? "border-rose-300 bg-rose-50/30" : 
                        formData.proof_document_url ? "border-emerald-300 bg-emerald-50/30" :
                        "border-slate-300 hover:border-blue-400 hover:bg-blue-50/20"
                    )}>
                        {!formData.proof_document_url && !uploading && (
                            <input 
                                type="file" 
                                name="proof_document_url"
                                onChange={onFileChange} 
                                accept="application/pdf" 
                                disabled={uploading} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                        )}
                        <div className="p-8">
                            {uploading ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <FiUploadCloud className="w-7 h-7 text-blue-600 animate-pulse" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-blue-900">Uploading Document...</p>
                                            <p className="text-xs text-blue-600 font-bold mt-0.5">{uploadProgress}% Complete</p>
                                        </div>
                                    </div>
                                    <div className="relative w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                                        <div 
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/50"
                                            style={{ width: `${uploadProgress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ) : formData.proof_document_url ? (
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center animate-in zoom-in duration-300">
                                        <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-black text-emerald-900">Document Uploaded Successfully</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FiFile className="w-3.5 h-3.5 text-emerald-600" />
                                            <p className="text-xs text-emerald-700 font-bold">Clearance_Proof.pdf</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                                        <FiUploadCloud size={28} className="group-hover:animate-bounce" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-700">Drop your PDF here or click to browse</p>
                                        <p className="text-xs text-slate-500 font-medium mt-1.5">Maximum file size: 5MB</p>
                                    </div>
                                    <div className="pt-2">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                                            <FiFile size={14} />
                                            <span>Select PDF File</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {(combinedErrors.proof_document_url || localFileError) && (
                        <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 flex items-center gap-1 animate-in slide-in-from-top-1">
                            <FiAlertCircle size={12}/> {localFileError || getSafeErrorMsg(combinedErrors.proof_document_url)}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <Label required={isRejected}>{isRejected ? "Correction Remarks" : "Additional Remarks"}</Label>
                    <textarea 
                        name="remarks" 
                        value={formData.remarks||''} 
                        onChange={handleChange} 
                        rows="3" 
                        className="w-full rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 placeholder:font-normal" 
                        placeholder={isRejected ? "Please explain the changes made..." : "Any additional context for the admin..."} 
                    />
                </div>
            </div>
          </section>

          <div className="pt-6 flex justify-end border-t border-slate-50">
            <Button onClick={validateAndSave} disabled={submitting || uploading} className="px-12 py-4 text-base">
                {submitting ? <FiRefreshCw className="animate-spin mr-2" /> : (isRejected ? 'Resubmit Application' : 'Submit Application')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;