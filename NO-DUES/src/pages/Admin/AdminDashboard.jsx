import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { 
  FiSearch, FiUser, FiMail, FiBook, FiDollarSign, FiCheckCircle, 
  FiXCircle, FiUpload, FiDownload, FiCheck, FiX, FiMessageSquare, 
  FiClock, FiArchive, FiList, FiEdit3, FiFilter, FiEye 
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rollNo, setRollNo] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    cancellationCheque: null,
    aadharCard: null,
    result: null
  });

  // State for applications
  const [applications, setApplications] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Checklist state
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: 'Verify all documents are submitted', status: null, comment: '', showComment: false },
    { id: 2, text: 'Confirm fee payment status', status: null, comment: '', showComment: false },
    { id: 3, text: 'Check library book return status', status: null, comment: '', showComment: false },
    { id: 4, text: 'Verify hostel clearance', status: null, comment: '', showComment: false },
    { id: 5, text: 'Confirm no pending lab dues', status: null, comment: '', showComment: false }
  ]);

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
      noDuesStatus: 'Pending',
      applicationDate: '2025-09-01',
      applicationStatus: 'Approved'
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
      noDuesStatus: 'Pending',
      applicationDate: '2025-09-02',
      applicationStatus: 'Pending'
    },
    {
      id: 3,
      rollNo: 'GBU2023003',
      name: 'Amit Kumar',
      email: 'amit.kumar@gbu.ac.in',
      course: 'B.Tech Electronics',
      semester: '8th',
      phone: '+91 9876543212',
      feesStatus: 'Paid',
      libraryStatus: 'Pending',
      hostelStatus: 'Cleared',
      noDuesStatus: 'Pending',
      applicationDate: '2025-09-03',
      applicationStatus: 'Rejected'
    }
  ];

  const officeMenuItems = [
    { id: 1, label: 'Dashboard', path: '/Admin/dashboard', icon: FiList },
    { id: 2, label: 'Pending Applications', path: '/Admin/pending', icon: FiClock },
    { id: 3, label: 'Application History', path: '/Admin/history', icon: FiArchive },
  ];

  // Load applications on component mount
  useEffect(() => {
    // In a real app, this would be an API call
    const allApplications = mockStudentDatabase.map(student => ({
      id: student.id,
      rollNo: student.rollNo,
      name: student.name,
      date: student.applicationDate,
      status: student.applicationStatus,
      course: student.course,
      feesStatus: student.feesStatus,
      libraryStatus: student.libraryStatus,
      hostelStatus: student.hostelStatus,
      noDuesStatus: student.noDuesStatus
    }));
    
    setApplications(allApplications);
    setPendingApplications(allApplications.filter(app => app.status === 'Pending' || app.status === 'Rejected'));
    setApprovedApplications(allApplications.filter(app => app.status === 'Approved'));
  }, []);

  // Checklist handlers
  const handleStatusChange = (id, status) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status, showComment: status === 'disapprove' ? true : item.showComment }
        : item
    ));
  };

  const toggleComment = (id) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, showComment: !item.showComment }
        : item
    ));
  };

  const updateComment = (id, comment) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, comment }
        : item
    ));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!rollNo) return;
    
    setIsLoading(true);
    
    // Simulate API call with timeout
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
    // In a real application, this would submit the data to the backend
    alert('No-Dues application submitted successfully!');
    // Reset form
    setStudentData(null);
    setRollNo('');
    setUploadedFiles({
      cancellationCheque: null,
      aadharCard: null,
      result: null
    });
    // Reset checklist
    setChecklistItems([
      { id: 1, text: 'Verify all documents are submitted', status: null, comment: '', showComment: false },
      { id: 2, text: 'Confirm fee payment status', status: null, comment: '', showComment: false },
      { id: 3, text: 'Check library book return status', status: null, comment: '', showComment: false },
      { id: 4, text: 'Verify hostel clearance', status: null, comment: '', showComment: false },
      { id: 5, text: 'Confirm no pending lab dues', status: null, comment: '', showComment: false }
    ]);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    // Find the student data for this application
    const student = mockStudentDatabase.find(s => s.rollNo === application.rollNo);
    setStudentData(student);
  };

  const handleUpdateApplicationStatus = (applicationId, status) => {
    // Update the application status
    const updatedApplications = applications.map(app => 
      app.id === applicationId ? { ...app, status } : app
    );
    
    setApplications(updatedApplications);
    setPendingApplications(updatedApplications.filter(app => app.status === 'Pending' || app.status === 'Rejected'));
    setApprovedApplications(updatedApplications.filter(app => app.status === 'Approved'));
    
    // If we're viewing this application, update it
    if (selectedApplication && selectedApplication.id === applicationId) {
      setSelectedApplication({ ...selectedApplication, status });
    }
    
    alert(`Application status updated to ${status}`);
  };

  const renderStatusBadge = (status) => {
    if (status === 'Cleared' || status === 'Approved') {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiCheckCircle className="mr-1" /> {status}
        </span>
      );
    } else if (status === 'Pending') {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiClock className="mr-1" /> {status}
        </span>
      );
    } else {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">
          <FiXCircle className="mr-1" /> {status}
        </span>
      );
    }
  };

  const renderApplicationsTable = (applicationsList) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applicationsList.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{app.rollNo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.course}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatusBadge(app.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewApplication(app)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <FiEye className="mr-1" /> View
                    </button>
                    {app.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateApplicationStatus(app.id, 'Approved')}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <FiCheck className="mr-1" /> Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateApplicationStatus(app.id, 'Rejected')}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <FiX className="mr-1" /> Reject
                        </button>
                      </>
                    )}
                    <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                      <FiDownload className="mr-1" /> Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <FiUser className="text-gray-500 mr-2" />
                <span className="font-medium">Name:</span>
                <span className="ml-2">{studentData.name}</span>
              </div>
              
              <div className="flex items-center">
                <FiMail className="text-gray-500 mr-2" />
                <span className="font-medium">Email:</span>
                <span className="ml-2">{studentData.email}</span>
              </div>
              
              <div className="flex items-center">
                <FiBook className="text-gray-500 mr-2" />
                <span className="font-medium">Course:</span>
                <span className="ml-2">{studentData.course}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">Semester:</span>
                <span className="ml-2">{studentData.semester}</span>
              </div>
            </div>

            {/* No-Dues Status */}
            <h3 className="font-semibold mb-3">No-Dues Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex justify-between items-center">
                <span>Fees Status:</span>
                {renderStatusBadge(studentData.feesStatus)}
              </div>
              
              <div className="flex justify-between items-center">
                <span>Library Status:</span>
                {renderStatusBadge(studentData.libraryStatus)}
              </div>
              
              <div className="flex justify-between items-center">
                <span>Hostel Status:</span>
                {renderStatusBadge(studentData.hostelStatus)}
              </div>
              
              <div className="flex justify-between items-center">
                <span>Overall No-Dues:</span>
                {renderStatusBadge(studentData.noDuesStatus)}
              </div>
            </div>

            {/* Document Upload Section */}
            <h3 className="font-semibold mb-3">Required Documents</h3>
            <div className="grid  grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="shadow shadow-gray-400 rounded-md p-4">
                <h4 className="font-medium mb-2">Cancellation Cheque</h4>
                <div className="flex items-center justify-between">
                  {uploadedFiles.cancellationCheque ? (
                    <span className="text-sm text-green-600">Uploaded</span>
                  ) : (
                    <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100">
                      <FiUpload className="inline mr-1" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload('cancellationCheque', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="shadow shadow-gray-400 rounded-md p-4">
                <h4 className="font-medium mb-2">Aadhar Card</h4>
                <div className="flex items-center justify-between">
                  {uploadedFiles.aadharCard ? (
                    <span className="text-sm text-green-600">Uploaded</span>
                  ) : (
                    <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100">
                      <FiUpload className="inline mr-1" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload('aadharCard', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="shadow shadow-gray-400 rounded-md p-4">
                <h4 className="font-medium mb-2">Final Result</h4>
                <div className="flex items-center justify-between">
                  {uploadedFiles.result ? (
                    <span className="text-sm text-green-600">Uploaded</span>
                  ) : (
                    <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100">
                      <FiUpload className="inline mr-1" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload('result', e.target.files[0])}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* No-Dues Process Checklist */}
            <h3 className="font-semibold mb-3">No-Dues Process Checklist</h3>
            <div className="space-y-1 mb-6">
              {checklistItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-700 cursor-pointer">
                        {item.text}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Approve Button */}
                      <button
                        onClick={() => handleStatusChange(item.id, 'approve')}
                        className={`p-2 rounded-md border transition-colors ${
                          item.status === 'approve'
                            ? 'bg-green-50 border-green-300 text-green-600'
                            : 'bg-gray-50 border-gray-300 text-gray-400 hover:bg-green-50 hover:border-green-300 hover:text-green-600'
                        }`}
                        title="Approve"
                      >
                        <FiCheck size={16} />
                      </button>

                      {/* Disapprove Button */}
                      <button
                        onClick={() => handleStatusChange(item.id, 'disapprove')}
                        className={`p-2 rounded-md border transition-colors ${
                          item.status === 'disapprove'
                            ? 'bg-red-50 border-red-300 text-red-600'
                            : 'bg-gray-50 border-gray-300 text-gray-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
                        }`}
                        title="Disapprove"
                      >
                        <FiX size={16} />
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() => toggleComment(item.id)}
                        className={`p-2 rounded-md border transition-colors ${
                          item.showComment
                            ? 'bg-blue-50 border-blue-300 text-blue-600'
                            : 'bg-gray-50 border-gray-300 text-gray-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                        }`}
                        title="Add Comment"
                      >
                        <FiMessageSquare size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Comment Box */}
                  {item.showComment && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <textarea
                        value={item.comment}
                        onChange={(e) => updateComment(item.id, e.target.value)}
                        placeholder="Add your comment..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
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

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent No-Dues Applications</h2>
            <div className="flex items-center">
              <FiFilter className="text-gray-500 mr-2" />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Applications</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {renderApplicationsTable(
            filterStatus === 'all' 
              ? applications 
              : applications.filter(app => 
                  filterStatus === 'approved' ? app.status === 'Approved' :
                  filterStatus === 'pending' ? app.status === 'Pending' :
                  app.status === 'Rejected'
                )
          )}
        </div>
      </>
    );
  };

  const renderPendingApplications = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Pending Applications</h2>
        {pendingApplications.length > 0 ? (
          renderApplicationsTable(pendingApplications)
        ) : (
          <p className="text-gray-500 text-center py-8">No pending applications</p>
        )}
      </div>
    );
  };

  const renderApplicationHistory = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Application History</h2>
        {approvedApplications.length > 0 ? (
          renderApplicationsTable(approvedApplications)
        ) : (
          <p className="text-gray-500 text-center py-8">No application history</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        menuItems={officeMenuItems} 
        user={user} 
        logout={logout} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6">
          </div>

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'pending' && renderPendingApplications()}
          {activeTab === 'history' && renderApplicationHistory()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;