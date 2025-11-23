import React from 'react';
import { FiUser, FiLogOut, FiFileText } from 'react-icons/fi';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboardLayout = ({ children, active, setActive, formData }) => {
    const { student: user, logout } = useStudentAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg font-semibold shadow">
                        {(formData.fullName || user?.full_name) ? ((formData.fullName || user.full_name).charAt(0).toUpperCase()) : <FiUser />}
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Signed in as</div>
                        <div className="font-medium text-slate-900">{user?.full_name || formData.fullName || 'Student'}</div>
                        <div className="text-xs text-slate-400">{user?.roll_number || formData.rollNumber || ''}</div>
                    </div>
                </div>

                <nav className="mt-4 flex-1">
                    <ul className="space-y-2 p-2">
                        <li>
                            <button
                                className={`w-full text-left px-4 py-2 rounded-xl text-sm flex items-center gap-3 ${active === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-50'}`}
                                onClick={() => setActive('dashboard')}
                            >
                                <FiFileText className="text-lg" />
                                <span>Dashboard</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full text-left px-4 py-2 rounded-xl text-sm flex items-center gap-3 ${active === 'form' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-50'}`}
                                onClick={() => setActive('form')}
                            >
                                <FiFileText className="text-lg" />
                                <span>Application</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full text-left px-4 py-2 rounded-xl text-sm flex items-center gap-3 ${active === 'status' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-50'}`}
                                onClick={() => setActive('status')}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /></svg>
                                <span>Status</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <FiLogOut /> Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default StudentDashboardLayout;
