import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplications } from '../../contexts/ApplicationContext'; // ✅ Import context
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { FiSearch, FiUser, FiMail, FiBook, FiCheckCircle, FiXCircle, FiUpload, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';

const OfficeDashboard = () => {
  const { user, logout } = useAuth();
  const { submitApplication } = useApplications(); // ✅ Get submit function

  const [rollNo, setRollNo] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    cancellationCheque: null,
    aadharCard: null,
    result: null
  });

  // Mock student database
  const mockStudentDatabase = [
    {
      id: 1,
      rollNo: 'GBU2023001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gbu.ac.in',
      course: 'B.Tech Computer Science',
      semester: '8th',
      phone: '+91 9876543210',
      feesStatus: 'Paid',
      libraryStatus: 'Cleared',
      hostelStatus: 'Cleared',
      noDuesStatus: 'Pending'
    },
    {
      id: 2,
      rollNo: 'GBU2023002',
      name: 'Priya Singh',
      email: 'priya.singh@gbu.ac.in',
      course: 'MBA',
      semester: '4th',
      phone: '+91 9876543211',
      feesStatus: 'Pending',
      libraryStatus: 'Cleared',
      hostelStatus: 'Pending',
      noDuesStatus: 'Pending'
    }
  ];

  const officeMenuItems = [
    { id: 1, label: 'Dashboard', path: '/office/dashboard' },
    { id: 2, label: 'Student Search', path: '/office/search' },
    { id: 3, label: 'Document Verification', path: '/office/verification' },
    { id: 4, label: 'No-Dues Status', path: '/office/status' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!rollNo) return;

    setIsLoading(true);

    setTimeout(() => {
      const student = mockStudentDatabase.find(s => s.rollNo === rollNo);
      setStudentData(student || null);
      setIsLoading(false);
    }, 800);
  };

  const handleFileUpload = (fileType, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleSubmitNoDues = () => {
    if (!studentData) return;

    // ✅ Build Application Object
    const application = {
      id: `APP-${Date.now()}`,
      rollNo: studentData.rollNo,
      studentName: studentData.name,
      studentEmail: studentData.email,
      course: studentData.course,
      semester: studentData.semester,
      status: 'pending',
      currentRole: 'exam', // ✅ First goes to exam
      uploadedFiles,
      logs: [
        { role: 'office', action: 'submitted', date: new Date().toISOString() }
      ]
    };

    // ✅ Add to context
    submitApplication(application);

    // ✅ Notify user
    toast.success('No-Dues application submitted and sent to Exam section.');

    // Reset form
    setStudentData(null);
    setRollNo('');
    setUploadedFiles({
      cancellationCheque: null,
      aadharCard: null,
      result: null
    });
  };

  const renderStatusBadge = (status) => {
    return status === 'Cleared' ? (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
        <FiCheckCircle className="mr-1" /> Cleared
      </span>
    ) : (
      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
        <FiXCircle className="mr-1" /> Pending
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={officeMenuItems} user={user} logout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Office Dashboard</h1>
            <p className="text-gray-600">No-Dues Management System</p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Student Search</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Enter Student Roll Number"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                disabled={isLoading}
              >
                <FiSearch className="mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Student Details */}
          {studentData && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Student Details</h2>
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center"><FiUser className="text-gray-500 mr-2" /><span className="font-medium">Name:</span><span className="ml-2">{studentData.name}</span></div>
                <div className="flex items-center"><FiMail className="text-gray-500 mr-2" /><span className="font-medium">Email:</span><span className="ml-2">{studentData.email}</span></div>
                <div className="flex items-center"><FiBook className="text-gray-500 mr-2" /><span className="font-medium">Course:</span><span className="ml-2">{studentData.course}</span></div>
                <div className="flex items-center"><span className="font-medium">Semester:</span><span className="ml-2">{studentData.semester}</span></div>
              </div>

              {/* Required Docs + Checklist + Submit */}
              {/* (Unchanged from your original, only the submit button now calls handleSubmitNoDues) */}

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitNoDues}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                >
                  <FiCheckCircle className="mr-2" />
                  Submit No-Dues Application
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OfficeDashboard;
