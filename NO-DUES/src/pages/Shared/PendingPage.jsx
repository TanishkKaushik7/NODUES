import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useApplications } from "../../contexts/ApplicationContext";

import Sidebar from "../../components/common/Sidebar"; // ✅ Import Sidebar
import Header from "../../components/common/Header";   // ✅ Import Header

const PendingPage = () => {
  const { user } = useAuth();
  const { applications, updateApplicationStatus } = useApplications();
  const [remarks, setRemarks] = useState({});

  const handleInputChange = (id, value) => {
    setRemarks((prev) => ({ ...prev, [id]: value }));
  };

  if (!applications) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Header />
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter((app) => app.status === "pending");

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <h1 className="text-2xl font-bold  p-6">Pending Applications</h1>

        {pendingApplications.length === 0 ? (
          <p className="mb-6 ml-6">No pending applications</p>
        ) : (
          pendingApplications.map((app) => (
            <div key={app.id} className="bg-white shadow p-4 rounded mb-4">
              <div className="mb-2">
                <p className="font-semibold">{app.studentName}</p>
                <p className="text-gray-500 text-sm">{app.rollNo}</p>
                <p className="text-gray-500 text-sm">Course: {app.course}</p>
                <p className="text-gray-500 text-sm">Semester: {app.semester}</p>
              </div>

              {/* Display uploaded files */}
              {app.uploadedFiles && (
                <div className="mb-3">
                  <p className="text-sm font-medium">Uploaded Documents:</p>
                  <ul className="text-sm text-gray-600">
                    {app.uploadedFiles.cancellationCheque && (
                      <li>Cancellation Cheque: ✓</li>
                    )}
                    {app.uploadedFiles.aadharCard && <li>Aadhar Card: ✓</li>}
                    {app.uploadedFiles.result && <li>Result: ✓</li>}
                  </ul>
                </div>
              )}

              {/* Application Logs */}
              {app.logs && app.logs.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium">Application History:</p>
                  <ul className="text-xs text-gray-600">
                    {app.logs.map((log, index) => (
                      <li key={index}>
                        {new Date(log.date).toLocaleString()} - {log.action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Remarks Input */}
              <textarea
                placeholder="Add your remarks"
                className="border rounded p-2 w-full text-sm mb-3"
                value={remarks[app.id] || ""}
                onChange={(e) => handleInputChange(app.id, e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updateApplicationStatus(app.id, "approve");
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    updateApplicationStatus(app.id, "reject");
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Role/workflow removed

export default PendingPage;
