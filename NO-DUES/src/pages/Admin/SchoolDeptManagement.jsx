import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronDown, 
  ChevronRight, 
  Search,
  MoreVertical
} from 'lucide-react';

// Import Modals (Assuming they are in the same folder)
import CreateSchoolModal from './CreateSchoolModal';
import CreateDepartmentModal from './CreateDepartmentModal';

const SchoolDeptManagement = () => {
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // Mock Data: Schools with their nested Departments
  const [schools, setSchools] = useState([
    {
      id: 1,
      name: "School of Engineering (SOE)",
      dean: "Dr. Anjali Verma",
      departments: [
        { id: 101, name: "Computer Science & Engineering", code: "CSE", head: "Dr. R. Gupta" },
        { id: 102, name: "Electronics & Communication", code: "ECE", head: "Dr. S. Kumar" },
        { id: 103, name: "Mechanical Engineering", code: "ME", head: "Dr. A. Singh" },
        { id: 104, name: "Civil Engineering", code: "CE", head: "Dr. P. Sharma" },
      ]
    },
    {
      id: 2,
      name: "School of Management (SOM)",
      dean: "Dr. K. Mehta",
      departments: [
        { id: 201, name: "Business Administration", code: "MBA", head: "Dr. V. Rao" },
        { id: 202, name: "Finance & Commerce", code: "FC", head: "Dr. N. Jain" },
      ]
    },
    {
      id: 3,
      name: "School of Biotechnology (SOBT)",
      dean: "Dr. P. Chawla",
      departments: [
        { id: 301, name: "Biotechnology", code: "BT", head: "Dr. L. Das" },
      ]
    },
    {
      id: 4,
      name: "School of ICT (SOICT)",
      dean: "Dr. M. Khan",
      departments: [] // Empty school example
    }
  ]);

  const toggleSchool = (id) => {
    setExpandedSchool(expandedSchool === id ? null : id);
  };

  const handleDeleteSchool = (id) => {
    if (window.confirm("Are you sure? This will delete the School and ALL its departments.")) {
      setSchools(schools.filter(s => s.id !== id));
    }
  };

  const handleDeleteDept = (schoolId, deptId) => {
    if (window.confirm("Delete this department?")) {
      setSchools(schools.map(s => {
        if (s.id === schoolId) {
          return { ...s, departments: s.departments.filter(d => d.id !== deptId) };
        }
        return s;
      }));
    }
  };

  // Filter logic
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    school.departments.some(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">School & Department Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Organize the university structure. Departments must belong to a School.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsSchoolModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Building2 className="h-4 w-4 mr-2 text-indigo-600" />
            Add School
          </button>
          <button 
            onClick={() => setIsDeptModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search for schools or departments..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Schools List */}
      <div className="grid gap-4">
        {filteredSchools.map((school) => (
          <div 
            key={school.id} 
            className={`
              bg-white rounded-xl border transition-all duration-200 overflow-hidden
              ${expandedSchool === school.id ? 'border-blue-300 ring-1 ring-blue-100 shadow-md' : 'border-slate-200 shadow-sm hover:border-blue-200'}
            `}
          >
            {/* School Header (Click to Expand) */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => toggleSchool(school.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${expandedSchool === school.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">{school.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {school.departments.length} Depts
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Dean: {school.dean}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Action Buttons (Stop Propagation to prevent toggle) */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Edit School">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
                    title="Delete School"
                    onClick={() => handleDeleteSchool(school.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {expandedSchool === school.id ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>

            {/* Expanded Content: Departments List */}
            {expandedSchool === school.id && (
              <div className="border-t border-slate-100 bg-slate-50/30 p-4 animate-in slide-in-from-top-2 duration-200">
                {school.departments.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {school.departments.map((dept) => (
                      <div 
                        key={dept.id} 
                        className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between group hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-100">
                            {dept.code}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-800">{dept.name}</h4>
                            <p className="text-xs text-slate-500">HOD: {dept.head}</p>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                             <Edit2 className="h-3 w-3" />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                            onClick={() => handleDeleteDept(school.id, dept.id)}
                          >
                             <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Quick Add Dept Button inside grid */}
                    <button 
                      onClick={() => setIsDeptModalOpen(true)}
                      className="border-2 border-dashed border-slate-200 rounded-lg p-3 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Dept to {school.name.split('(')[1].replace(')', '')}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <p className="text-sm">No departments found in this school.</p>
                    <button 
                      onClick={() => setIsDeptModalOpen(true)}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Create the first department
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredSchools.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No schools found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or add a new school.</p>
          </div>
        )}
      </div>

      {/* Render Modals */}
      <CreateSchoolModal 
        isOpen={isSchoolModalOpen} 
        onClose={() => setIsSchoolModalOpen(false)} 
        onSuccess={() => console.log("Refresh Data")}
      />
      <CreateDepartmentModal 
        isOpen={isDeptModalOpen} 
        onClose={() => setIsDeptModalOpen(false)} 
        onSuccess={() => console.log("Refresh Data")}
      />
    </div>
  );
};

export default SchoolDeptManagement;