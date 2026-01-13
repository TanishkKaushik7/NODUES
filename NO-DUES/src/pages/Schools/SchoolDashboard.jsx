import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

// Child Components
import DashboardStats from './DashboardStats';
import ApplicationsTable from './ApplicationsTable';
import ApplicationActionModal from './ApplicationActionModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const SchoolDashboard = () => {
  const { user, logout, authFetch } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus] = useState('all'); 
  
  const [isLoading, setIsLoading] = useState(true); 
  const [isViewLoading, setIsViewLoading] = useState(false); 
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // --- 1. Fetch List Data ---
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/approvals/pending', { method: 'GET' });
      let data = [];
      try { data = await res.json(); } catch (e) { data = []; }

      const mappedApplications = Array.isArray(data)
        ? data.map(app => {
            let displayStatus = app.status || 'Pending';
            if (displayStatus.toLowerCase() === 'in_progress') displayStatus = 'Pending';

            return {
                id: app.application_id,
                displayId: app.display_id || '—',
                rollNo: app.roll_number || '',
                enrollment: app.enrollment_number || '',
                name: app.student_name || '',
                date: app.created_at || '',
                status: displayStatus,
                current_location: app.current_location || '',
                active_stage: app.active_stage || null, 
                match: true, 
            };
          })
        : [];

      setApplications(mappedApplications);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [authFetch]);

  // --- 2. Fetch Enriched Details (View Action) ---
  const handleViewApplication = async (listApp) => {
    if (!listApp?.id) return;
    setIsViewLoading(true);
    setActionError(''); 

    try {
      const res = await authFetch(`/api/approvals/enriched/${listApp.id}`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to load details');
      const details = await res.json();

      const enrichedApp = {
        ...details,
        id: details.application_id,
        displayId: details.display_id,
        rollNo: details.roll_number,
        enrollment: details.enrollment_number,
        name: details.student_name,
        date: details.created_at,
        status: details.application_status || details.status,
        active_stage: details.actionable_stage || listApp.active_stage, 
        proof_url: details.proof_document_url
      };

      setSelectedApplication(enrichedApp);
    } catch (err) {
      console.error('Failed to fetch details:', err);
      setSelectedApplication(listApp);
    } finally {
      setIsViewLoading(false);
    }
  };

  // --- 3. Handle Actions ---
  const handleSchoolAction = async (application, action, remarksIn) => {
    if (!application) return;
    setActionError('');
    if (action === 'reject' && (!remarksIn || !remarksIn.trim())) {
      setActionError('Remarks are required when rejecting');
      return;
    }
  
    const stageId = application?.active_stage?.stage_id;
    if (!stageId) return setActionError('No actionable stage found.');
  
    const schoolId = user?.department_id || user?.school_id; 
    const verb = action === 'approve' ? 'approve' : 'reject';
    
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/approvals/${stageId}/${verb}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ department_id: schoolId || null, remarks: remarksIn || null }) 
      });
  
      if (!res.ok) throw new Error(`Action failed: ${res.status}`);
  
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      setApplications(applications.map(app =>
        app.id === application.id ? { ...app, status: newStatus } : app
      ));
      setSelectedApplication(null); 
    } catch (err) {
      setActionError(err?.message || 'Error processing action');
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
  const getStatusCount = (s) => applications.filter(a => a.status.toLowerCase() === s).length;
  const stats = { total: applications.length, pending: getStatusCount('pending'), approved: getStatusCount('approved'), rejected: getStatusCount('rejected') };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar user={user} logout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-extrabold text-gray-900">{user?.school_name || 'School'} Dashboard</h1>
              <p className="text-gray-600 mb-6">Process pending No-Dues requests.</p>
            </motion.div>
            <DashboardStats stats={stats} />
            <ApplicationsTable 
              applications={filteredApplications} isLoading={isLoading} isViewLoading={isViewLoading} 
              onView={handleViewApplication} onSearch={handleSearch} onRefresh={fetchApplications}
            />
          </motion.div>
        </main>
      </div>
      {selectedApplication && (
        <ApplicationActionModal 
          application={selectedApplication} onClose={() => setSelectedApplication(null)}
          onAction={handleSchoolAction} actionLoading={actionLoading} actionError={actionError}
          userSchoolName={user?.school_name || 'School'}
        />
      )}
    </div>
  );
};

export default SchoolDashboard;