import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiSearch, FiDownload, FiEye, FiCheck, FiX, FiFilter, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ApplicationsList = ({ departmentName, departmentId }) => {
  const { authFetch } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const API_URL = '/api/approvals/all/enriched';
        const res = await authFetch(API_URL, { method: 'GET' });
        let data = [];
        try { data = await res.json(); } catch (e) { data = []; }
        const mapped = Array.isArray(data) ? data.map(app => ({
          id: app.application_id || app.id || app._id,
          rollNo: app.roll_number || app.rollNo || app.student_roll_no || '',
          enrollment: app.enrollment_number || app.enrollmentNumber || '',
          name: app.student_name || app.name || app.full_name || '',
          date: app.created_at || app.application_date || app.date || '',
          status: app.application_status || app.status || '',
          course: app.course || app.student_course || '',
          email: app.student_email || app.email || '',
          mobile: app.student_mobile || app.mobile || '',
          department: app.department_name || app.department || ''
        })) : [];

        let filtered = mapped;
        if (departmentId) {
          // try match by department id if available in raw data
          filtered = mapped.filter(a => Number(a.department_id) === Number(departmentId) || String(a.department).toLowerCase().includes(String(departmentName || '').toLowerCase()));
        } else if (departmentName) {
          filtered = mapped.filter(a => String(a.department).toLowerCase().includes(String(departmentName).toLowerCase()));
        }

        setApps(filtered);
      } catch (e) {
        console.error('Failed to fetch applications', e);
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [authFetch, departmentName, departmentId]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    } catch (e) { return iso; }
  };

  const renderStatusBadge = (status) => {
    const s = (status || '').toString();
    const key = s.toLowerCase();
    if (['cleared', 'approved'].includes(key)) {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiCheckCircle className="mr-1" /> {s}</span>;
    }
    if (['inprogress', 'in_progress', 'in-progress', 'in progress'].includes(key)) {
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiClock className="mr-1" /> {s}</span>;
    }
    if (['pending'].includes(key)) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiClock className="mr-1" /> {s}</span>;
    }
    if (['rejected', 'denied'].includes(key)) {
      return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiXCircle className="mr-1" /> {s}</span>;
    }
    return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">{s}</span>;
  };

  const filteredApps = apps.filter(app => {
    // search filter
    const q = (query || '').toLowerCase().trim();
    if (q) {
      const inText = [app.rollNo, app.enrollment, app.name, app.email].join(' ').toLowerCase();
      if (!inText.includes(q)) return false;
    }
    // status filter
    if (filterStatus === 'approved') return (app.status || '').toLowerCase() === 'approved';
    if (filterStatus === 'pending') return (app.status || '').toLowerCase() === 'pending';
    if (filterStatus === 'rejected') return (app.status || '').toLowerCase() === 'rejected';
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by roll, enrollment, name or email" className="w-full border border-gray-300 rounded px-3 py-2" />
            <FiSearch className="absolute right-3 top-2 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-2 py-1">
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{app.rollNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.enrollment ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.course ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(app.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(app.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <button className="text-indigo-600 hover:text-indigo-900 flex items-center"><FiEye className="mr-1" /> View</button>
                      <button className="text-indigo-600 hover:text-indigo-900 flex items-center"><FiDownload className="mr-1" /> Download</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
