import React from 'react';
import { Button } from '../../components/ui/Button';
import { FiCheck, FiInfo, FiClock, FiAlertCircle, FiXCircle } from 'react-icons/fi';

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
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
      </div>
    </div>
    {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
  </div>
);

const MyApplications = ({ 
  user, formData, locked, formErrors, submitting, uploading, 
  saveMessage, handleChange, handleSave, hasSubmittedApplication,
  isRejected, rejectionDetails 
}) => {
  const fieldClass = 'w-full px-4 py-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500';

  // ✅ Show "Under Progress" message ONLY if submitted AND NOT rejected
  if (hasSubmittedApplication && !isRejected) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center justify-center animate-fade-in min-h-[500px]">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <FiClock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Your Application is Under Progress</h2>
        <p className="text-slate-500 max-w-lg mx-auto text-lg">
          Your application has been successfully submitted and is currently being processed by the respective departments.
        </p>
        <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 max-w-md w-full">
          <p className="text-sm text-blue-800 font-medium">
            Please check the "Track Status" tab for real-time updates on your clearance process.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 🛑 REJECTION ALERT CARD (Appears only if rejected) */}
      {isRejected && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
          <div className="p-3 bg-white rounded-full text-rose-600 shadow-sm flex-shrink-0">
             <FiXCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-800 mb-1">Application Rejected</h3>
            <p className="text-rose-700 text-sm mb-3">
              Your application was rejected by <span className="font-semibold">{rejectionDetails?.role?.toUpperCase()}</span>. 
              Please correct the details below and resubmit.
            </p>
            {rejectionDetails?.remarks && (
              <div className="bg-white/80 p-3 rounded-lg border border-rose-100 text-sm font-medium text-rose-900">
                Remark: "{rejectionDetails.remarks}"
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Form</h2>
            <p className="text-sm text-slate-500">Please fill in all required details correctly.</p>
          </div>
          {saveMessage && (
            <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg animate-pulse">
              {saveMessage}
            </div>
          )}
        </div>
        
        <div className="p-6 sm:p-8 space-y-8">
          {/* Academic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          </div>

          <hr className="border-slate-100" />

          {/* Personal Information */}
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
                  options={[{ v: 'Male', l: 'Male' }, { v: 'Female', l: 'Female' }, { v: 'Other', l: 'Other' }]} 
                />
                <SelectRow 
                  label="Category" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  fieldClass={fieldClass} 
                  editable={!locked.category} 
                  error={formErrors.category} 
                  options={['GEN', 'OBC', 'SC', 'ST'].map(c => ({ v: c, l: c }))} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Permanent Address</label>
                <textarea 
                  name="permanentAddress" 
                  value={formData.permanentAddress ?? ''} 
                  onChange={handleChange} 
                  disabled={locked.permanentAddress}
                  rows="3" 
                  className={`${fieldClass} resize-none ${formErrors.permanentAddress ? 'border-rose-300' : ''}`} 
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Hostel & Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectRow 
                label="Are you a Hosteller?" 
                name="isHosteller" 
                value={formData.isHosteller} 
                onChange={handleChange} 
                fieldClass={fieldClass} 
                editable={!locked.isHosteller} 
                error={formErrors.isHosteller} 
                options={[{ v: 'Yes', l: 'Yes' }, { v: 'No', l: 'No' }]} 
              />
              {formData.isHosteller === 'Yes' && (
                <>
                  <InputRow label="Hostel Name" name="hostelName" value={formData.hostelName} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelName} error={formErrors.hostelName} />
                  <InputRow label="Hostel Room" name="hostelRoom" value={formData.hostelRoom} onChange={handleChange} fieldClass={fieldClass} editable={!locked.hostelRoom} error={formErrors.hostelRoom} />
                </>
              )}
              
              <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">No Dues Proof (PDF)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    name="proof_document_url" 
                    accept="application/pdf" 
                    onChange={handleChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all"
                  />
                  {formData.proof_document_url && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-100">
                      <FiCheck className="text-base text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 truncate max-w-[200px]">File Uploaded</span>
                    </div>
                  )}
                </div>
                {uploading && <div className="text-xs text-blue-500 animate-pulse mt-1">Uploading document... please wait.</div>}
                {formErrors.proof_document_url && <div className="text-xs text-rose-500 mt-1">{formErrors.proof_document_url}</div>}
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <FiInfo /> Upload "No Dues" form or required proof in PDF.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Remarks (Optional)</label>
                <textarea 
                  name="remarks" 
                  value={formData.remarks ?? ''} 
                  onChange={handleChange} 
                  rows="2" 
                  placeholder="Any additional information..."
                  className={`${fieldClass} resize-none`} 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <Button 
              variant="primary" 
              onClick={handleSave} 
              className={`w-full sm:w-auto px-8 py-3 text-white rounded-xl shadow-lg transition-all ${
                isRejected 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
              disabled={submitting || uploading}
            >
              {submitting ? 'Processing...' : (isRejected ? 'Resubmit Application' : 'Save & Update')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;