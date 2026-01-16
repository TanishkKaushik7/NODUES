import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios'; // ✅ Using the centralized API instance

import DashboardStats from './DashboardStats';
import ApplicationsTable from './ApplicationsTable';
import ApplicationActionModal from './ApplicationActionModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const LabDashboard = () => {
  const { user, logout } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isViewLoading, setIsViewLoading] = useState(false); 
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // --- 1. Fetch Lab-Specific Pending Applications ---
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      // ✅ Removed manual headers. Let axios.js handle the token injection.
      const res = await api.get('/api/approvals/pending');

      // ✅ FIX: FastAPI often returns { applications: [...] } or { data: [...] }
      const rawData = res.data?.applications || res.data?.data || res.data;
      
      if (!Array.isArray(rawData)) {
        console.warn("API did not return an array. Check backend response structure.");
        setApplications([]);
        return;
      }

      const mappedApplications = rawData.map(app => ({
        // Ensure 'id' is present for the table key and selection
        id: app.application_id || app.id, 
        displayId: app.display_id || '—',
        rollNo: app.roll_number || '',
        enrollment: app.enrollment_number || '',
        name: app.student_name || '',
        date: app.created_at || '',
        // Map status logic
        status: (app.status || 'Pending').toLowerCase().includes('progress') ? 'Pending' : (app.status || 'Pending'),
        current_location: app.current_location || 'Registry',
        active_stage: app.active_stage || null, 
        match: true, 
      }));

      setApplications(mappedApplications);
    } catch (err) {
      console.error('Failed to fetch Lab applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchApplications(); 
  }, [fetchApplications]);

  // --- 2. Fetch Detailed Application Info ---
  const handleViewApplication = async (listApp) => {
    // Check both id possibilities
    const targetId = listApp.id || listApp.application_id;
    if (!targetId) return;

    setIsViewLoading(true);
    setActionError(''); 

    try {
      const res = await api.get(`/api/approvals/enriched/${targetId}`);
      const details = res.data;

      // Unify the object structure
      const enrichedApp = {
        ...details,
        id: details.application_id || targetId,
        displayId: details.display_id || listApp.displayId,
        rollNo: details.roll_number || listApp.rollNo,
        enrollment: details.enrollment_number || listApp.enrollment,
        name: details.student_name || listApp.name,
        date: details.created_at || listApp.date,
        status: details.application_status || details.status || listApp.status,
        active_stage: details.actionable_stage || listApp.active_stage, 
        proof_url: details.proof_document_url
      };

      setSelectedApplication(enrichedApp);
    } catch (err) {
      console.error('Failed to fetch enriched details:', err);
      // Fallback to list data if enrichment fails
      setSelectedApplication(listApp);
    } finally {
      setIsViewLoading(false);
    }
  };

  // --- 3. Handle Lab Action ---
  const handleLabAction = async (application, action, remarksIn) => {
    if (!application) return;
    setActionError('');
    
    if (action === 'reject' && (!remarksIn || !remarksIn.trim())) {
      setActionError('Remarks are required when rejecting');
      return;
    }
  
    const stageId = application?.active_stage?.stage_id || application?.stage_id;
    if (!stageId) return setActionError('No actionable stage ID found.');
  
    const labId = user?.department_id || user?.school_id; 
    const verb = action === 'approve' ? 'approve' : 'reject';
    
    setActionLoading(true);
    try {
      await api.post(`/api/approvals/${stageId}/${verb}`, { 
        department_id: labId || null, 
        remarks: remarksIn || null 
      });

      // Update local state to show change immediately
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      setApplications(prev => prev.map(app =>
        app.id === application.id ? { ...app, status: newStatus } : app
      ));
      
      setSelectedApplication(null); 
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error processing request';
      setActionError(typeof msg === 'string' ? msg : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setApplications(prev => prev.map(a => ({
      ...a,
      match: (a.name + a.rollNo + a.displayId).toLowerCase().includes(q)
    })));
  };

  const filteredApplications = applications.filter(a => a.match !== false);
  
  const stats = { 
    total: applications.length, 
    pending: applications.filter(a => a.status.toLowerCase().includes('pending')).length, 
    approved: applications.filter(a => a.status.toLowerCase().includes('approve')).length, 
    rejected: applications.filter(a => a.status.toLowerCase().includes('reject')).length 
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                {user?.department_name || 'Laboratory Registry'} 
              </h1>
              <p className="text-slate-500 font-medium uppercase tracking-widest text-[11px] mt-1">
                Registry Management & Clearance Processing
              </p>
            </div>

            <DashboardStats stats={stats} />

            <ApplicationsTable 
              applications={filteredApplications} 
              isLoading={isLoading} 
              isViewLoading={isViewLoading} 
              onView={handleViewApplication} 
              onSearch={handleSearch} 
              onRefresh={fetchApplications}
            />
          </motion.div>
        </main>
      </div>

      {selectedApplication && (
        <ApplicationActionModal 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)}
          onAction={handleLabAction} 
          actionLoading={actionLoading} 
          actionError={actionError}
          userSchoolName={user?.department_name || 'Laboratories'}
        />
      )}
    </div>
  );
};

export default LabDashboard;