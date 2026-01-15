import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { 
  FiCheck, FiInfo, FiClock, FiAlertCircle, 
  FiXCircle, FiBookOpen, FiUser, FiHome, 
  FiFileText, FiUploadCloud, FiRefreshCw, FiCheckCircle, FiDownload 
} from 'react-icons/fi';

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS                                                             */
/* -------------------------------------------------------------------------- */

const ReadOnlyField = ({ label, value, error }) => (
  <div className="group">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </label>
    <div className="w-full px-4 py-3 bg-slate-50/80 border border-slate-100 rounded-xl text-slate-600 text-sm font-bold flex items-center gap-2 group-hover:border-slate-200 transition-all">
      <span className="truncate">{value || '—'}</span>
    </div>
    {error && <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1"><FiAlertCircle size={12}/> {error}</span>}
  </div>
);

const InputRow = ({ label, name, value, onChange, type = 'text', fieldClass, editable = true, error }) => (
  <div className="group">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </label>
    <input 
      name={name} 
      value={value ?? ''} 
      onChange={onChange} 
      type={type}
      disabled={!editable}
      className={`${fieldClass} rounded-xl px-4 py-3 text-sm font-bold transition-all ${
        editable ? 'bg-white border-slate-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500' : 'bg-slate-50 text-slate-400 border-slate-100'
      } ${error ? 'border-rose-300 bg-rose-50/30' : ''}`} 
    />
    {error && <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1"><FiAlertCircle size={12}/> {error}</span>}
  </div>
);

const SelectRow = ({ label, name, value, onChange, fieldClass, editable = true, options, error }) => (
  <div className="group">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </label>
    <div className="relative">
      <select 
        name={name} 
        value={value ?? ''} 
        onChange={onChange} 
        disabled={!editable}
        className={`${fieldClass} appearance-none rounded-xl px-4 py-3 text-sm font-bold transition-all ${
            editable ? 'bg-white border-slate-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500' : 'bg-slate-50 text-slate-400 border-slate-100'
        } ${error ? 'border-rose-300' : ''}`}
      >
        <option value="">Select Option</option>
        {options ? options.map((o, idx) => <option key={idx} value={o.v}>{o.l}</option>) : null}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
      </div>
    </div>
    {error && <span className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1"><FiAlertCircle size={12}/> {error}</span>}
  </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const MyApplications = ({ 
  user, formData, locked, formErrors, submitting, uploading, 
  saveMessage, handleChange, handleSave, hasSubmittedApplication,
  isRejected, rejectionDetails, stepStatuses, applicationId, token,
  isCompleted 
}) => {
  const [certDownloading, setCertDownloading] = useState(false);
  const [localFileError, setLocalFileError] = useState(''); 
  const fieldClass = 'w-full border outline-none transition-all';

  const isFullyCleared = isCompleted || (stepStatuses?.length > 0 && stepStatuses?.every(s => s.status === 'completed'));

  // ✅ ENHANCED FILE HANDLER
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      setLocalFileError(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 5MB.`);
      e.target.value = null; // Reset input
      return;
    }

    setLocalFileError('');
    
    // Pass the event to the parent.
    // NOTE: The parent (StudentDashboard) MUST handle the API call and use "file" as the key.
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
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-emerald-900/5 p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 min-h-[550px]">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <FiCheckCircle className="w-10 h-10" />
            </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Clearance Completed</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-base font-medium leading-relaxed">
          Congratulations! Your digital clearance process is 100% complete and verified by all departments.
        </p>
        
        <div className="mt-10 flex flex-col items-center gap-6 w-full max-w-xs">
          <Button 
            onClick={handleDownloadCertificate}
            disabled={certDownloading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3"
          >
            {certDownloading ? <FiRefreshCw className="animate-spin" /> : <FiDownload size={18} />}
            Download Certificate
          </Button>
          
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Registry Archive Reference: {applicationId?.slice(0, 8)}
          </p>
        </div>
      </div>
    );
  }

  if (hasSubmittedApplication && !isRejected) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 min-h-[550px]">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40">
                <FiClock className="w-10 h-10" />
            </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Application Processing</h2>
        <p className="text-slate-500 max-sm mx-auto text-base font-medium leading-relaxed">
          Your digital clearance is currently being reviewed by the administrative heads.
        </p>
        <div className="mt-10 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 max-w-md w-full">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
          <p className="text-xs text-slate-600 font-black uppercase tracking-widest">
            Check "Track Status" for real-time updates
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 mt-[-50px] animate-in fade-in duration-700">
      
      {isRejected && (
        <div className="relative group overflow-hidden bg-rose-50/50 border border-rose-100 rounded-3xl p-8 flex flex-col sm:flex-row gap-6 items-start shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <FiXCircle size={120} />
          </div>
          <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200 flex-shrink-0">
              <FiXCircle className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">Correction Required</h3>
            <p className="text-rose-700/80 text-sm font-bold mb-4 uppercase tracking-wide">
              Rejected by <span className="bg-rose-200/50 px-2 py-0.5 rounded text-rose-900">{rejectionDetails?.role?.toUpperCase()}</span>
            </p>
            {rejectionDetails?.remarks && (
              <div className="bg-white p-4 rounded-xl border border-rose-100 text-sm font-bold text-rose-800 shadow-sm italic">
                "{rejectionDetails.remarks}"
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <FiFileText size={24}/>
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Application Form</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Clearance Registry</p>
            </div>
          </div>
          {saveMessage && (
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
              {saveMessage}
            </div>
          )}
        </div>
        
        <div className="p-8 sm:p-10 space-y-12">
          {/* SECTION: ACADEMIC */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <FiBookOpen className="text-blue-600" size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Academic Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputRow label="Enrollment Number" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleChange} fieldClass={fieldClass} editable={!locked.enrollmentNumber} error={formErrors.enrollmentNumber} />
              <InputRow label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} fieldClass={fieldClass} editable={!locked.rollNumber} error={formErrors.rollNumber} />
              <InputRow label="Admission Year" name="admissionYear" type="number" value={formData.admissionYear} onChange={handleChange} fieldClass={fieldClass} editable={!locked.admissionYear} error={formErrors.admissionYear} />
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="Batch" name="batch" value={formData.batch} onChange={handleChange} fieldClass={fieldClass} editable={!locked.batch} error={formErrors.batch} />
                <InputRow label="Section" name="section" value={formData.section} onChange={handleChange} fieldClass={fieldClass} editable={!locked.section} error={formErrors.section} />
              </div>
              <SelectRow 
                label="Admission Type" 
                name="admissionType" 
                value={formData.admissionType} 
                onChange={handleChange} 
                fieldClass={fieldClass} 
                editable={!locked.admissionType} 
                error={formErrors.admissionType} 
                options={[{ v: 'Regular', l: 'Regular' }, { v: 'Lateral Entry', l: 'Lateral Entry' }, { v: 'Transfer', l: 'Transfer' }]} 
              />
            </div>
          </section>

          {/* SECTION: PERSONAL */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <FiUser className="text-blue-600" size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadOnlyField label="Full Name" value={formData.fullName || user?.full_name} error={formErrors.fullName} />
              <ReadOnlyField label="Email Address" value={formData.email || user?.email} error={formErrors.email} />
              <ReadOnlyField label="Mobile Number" value={formData.mobile || user?.mobile_number} error={formErrors.mobile} />
              <InputRow label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} fieldClass={fieldClass} editable={!locked.dob} error={formErrors.dob} />
              <InputRow label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.fatherName} error={formErrors.fatherName} />
              <InputRow label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.motherName} error={formErrors.motherName} />
              <div className="grid grid-cols-2 gap-4">
                <SelectRow label="Gender" name="gender" value={formData.gender} onChange={handleChange} fieldClass={fieldClass} editable={!locked.gender} error={formErrors.gender} options={[{ v: 'Male', l: 'Male' }, { v: 'Female', l: 'Female' }, { v: 'Other', l: 'Other' }]} />
                <SelectRow label="Category" name="category" value={formData.category} onChange={handleChange} fieldClass={fieldClass} editable={!locked.category} error={formErrors.category} options={['GEN', 'OBC', 'SC', 'ST'].map(c => ({ v: c, l: c }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Permanent Address</label>
                <textarea 
                  name="permanentAddress" 
                  value={formData.permanentAddress ?? ''} 
                  onChange={handleChange} 
                  disabled={locked.permanentAddress}
                  rows="3" 
                  className={`w-full rounded-xl px-4 py-3 text-sm font-bold border outline-none transition-all resize-none ${
                    !locked.permanentAddress ? 'bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' : 'bg-slate-50 text-slate-400 border-slate-100'
                  } ${formErrors.permanentAddress ? 'border-rose-300' : ''}`} 
                />
              </div>
            </div>
          </section>

          {/* SECTION: LOGISTICS & FILE UPLOAD */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <FiHome className="text-blue-600" size={18} />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Additional Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectRow label="Are you a Hosteller?" name="isHosteller" value={formData.isHosteller} onChange={handleChange} fieldClass={fieldClass} editable={!locked.isHosteller} error={formErrors.isHosteller} options={[{ v: 'Yes', l: 'Yes' }, { v: 'No', l: 'No' }]} />
              {formData.isHosteller === 'Yes' && (
                <>
                  <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelName} error={formErrors.hostelName} />
                  <InputRow label="Hostel Room" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelRoom} error={formErrors.hostelRoom} />
                </>
              )}
              
              <div className="md:col-span-2 bg-blue-50/30 p-8 rounded-3xl border border-blue-100/50">
                <label className="block text-xs font-black text-blue-900 uppercase tracking-widest mb-4">Verification Document (PDF)</label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group cursor-pointer">
                    <input 
                      type="file" 
                      name="proof_document_url" 
                      accept="application/pdf" 
                      onChange={onFileChange}
                      disabled={uploading} // Disable while uploading
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                      <FiUploadCloud size={16} /> {uploading ? 'Uploading...' : 'Choose PDF File'}
                    </div>
                  </div>
                  
                  {formData.proof_document_url && !localFileError && (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 animate-in slide-in-from-left-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <FiCheck size={14} />
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Document Secured</span>
                    </div>
                  )}
                </div>
                
                {(localFileError || formErrors.proof_document_url) && (
                  <div className="text-[10px] font-bold text-rose-500 mt-3 flex items-center gap-1">
                    <FiAlertCircle size={12}/> {localFileError || formErrors.proof_document_url}
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

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 gap-6">
            <div className="flex items-center gap-3 text-slate-400">
                <FiInfo size={20} />
                <p className="text-xs font-medium max-w-xs">By submitting, you confirm that all provided data is true to the university records.</p>
            </div>
            
            <Button 
              variant="primary" 
              onClick={handleSave} 
              className={`w-full sm:w-auto px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white rounded-2xl shadow-2xl transition-all active:scale-95 ${
                isRejected ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
              }`}
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