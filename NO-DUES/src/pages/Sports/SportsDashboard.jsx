import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { FiSearch, FiUser, FiMail, FiBook, FiDollarSign, FiCheckCircle, FiXCircle, FiUpload, FiDownload } from 'react-icons/fi';

const SportsDashboard = () => {
  const { user, logout } = useAuth();
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

              {/* Document Upload Section */}
              <h3 className="font-semibold mb-3">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="shadow shadow-gray-400  rounded-md p-4">
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
                
                <div className="shadow shadow-gray-400  rounded-md p-4">
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
            <h2 className="text-lg font-semibold mb-4">Recent No-Dues Applications</h2>
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">GBU2023001</td>
                    <td className="px-6 py-4 whitespace-nowrap">Rahul Sharma</td>
                    <td className="px-6 py-4 whitespace-nowrap">2025-09-01</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <FiDownload className="mr-1" /> Download
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">GBU2023002</td>
                    <td className="px-6 py-4 whitespace-nowrap">Priya Singh</td>
                    <td className="px-6 py-4 whitespace-nowrap">2025-09-02</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <FiDownload className="mr-1" /> Download
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SportsDashboard;