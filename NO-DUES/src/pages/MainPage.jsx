import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building, FileCheck, GraduationCap } from 'lucide-react';

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header section - center aligned */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
                <FileCheck className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-blue-600 mb-3">No Dues Management System</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gautam Buddha University</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Please select your portal to access the system
            </p>
          </div>

          {/* Login cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Portal */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Student Portal</h3>
                    <p className="text-sm text-gray-500 mt-0.5">For enrolled students</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Track Clearance Status</p>
                      <p className="text-xs text-gray-500 mt-0.5">Monitor your clearance progress in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Submit Documents</p>
                      <p className="text-xs text-gray-500 mt-0.5">Upload required documentation securely</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Download Certificate</p>
                      <p className="text-xs text-gray-500 mt-0.5">Get your clearance certificate once approved</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 px-4 py-2.5 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => navigate('/student/login')}
                  >
                    Login
                  </button>
                  <button 
                    className="flex-1 px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => navigate('/student/register')}
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>

            {/* System Portal */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">System Portal</h3>
                    <p className="text-sm text-gray-500 mt-0.5">For staff and administrators</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Process Requests</p>
                      <p className="text-xs text-gray-500 mt-0.5">Review and approve student clearances</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Department Management</p>
                      <p className="text-xs text-gray-500 mt-0.5">Configure departments and requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Generate Reports</p>
                      <p className="text-xs text-gray-500 mt-0.5">Access analytics and detailed reports</p>
                    </div>
                  </div>
                </div>

                <button 
                  className="w-full px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => navigate('/login')}
                >
                  System Login
                </button>
              </div>
            </div>
          </div>

          {/* Footer information */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <p className="text-sm text-gray-700">
                Need assistance? Contact <span className="font-medium text-blue-600">support@gbu.ac.in</span> or visit the administration office
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}