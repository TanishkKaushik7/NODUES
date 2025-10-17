import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useApplications } from "../../contexts/ApplicationContext";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

// ✅ Import Header and Sidebar
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";

const HistoryPage = () => {
  const { user } = useAuth();
  const { applications } = useApplications();

  if (!applications) {
    return (
      <div className="">
        <Sidebar /> {/* Sidebar on the left */}
        <div className="flex-1 p-6">
          <Header /> {/* Header on top */}
          <h1 className="text-2xl font-bold mb-6">Application History</h1>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  const filteredApplications =
    user.role === "student"
      ? applications.filter((app) => app.studentEmail === user.email)
      : applications;

  return (
    <div className="flex">
      <Sidebar /> {/* Sidebar on the left */}
      <div className="flex-1">
        <Header /> {/* Header on top */}
        <h1 className="text-2xl font-bold overflow-y-auto  p-6">Application History</h1>

        {filteredApplications.length === 0 ? (
          <p className="text-gray-600 overflow-y-auto ml-6 ">No applications found.</p>
        ) : (
          filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-200"
            >
              <h2 className="text-lg font-semibold mb-2">{app.studentName}</h2>
              <p className="text-sm text-gray-500 mb-4">
                Roll No: {app.rollNo} | Submitted On:{" "}
                {app.logs && app.logs[0]
                  ? new Date(app.logs[0].date).toLocaleDateString()
                  : "N/A"}
              </p>

              {/* Timeline */}
              <div className="relative pl-6">
                {app.logs &&
                  app.logs.map((step, idx) => {
                    const isLast = idx === app.logs.length - 1;
                    const icon =
                      step.action === "approved" ? (
                        <FiCheckCircle className="text-green-600" />
                      ) : step.action === "rejected" ? (
                        <FiXCircle className="text-red-600" />
                      ) : (
                        <FiClock className="text-yellow-500" />
                      );

                    return (
                      <div key={idx} className="relative pb-6">
                        {!isLast && (
                          <span className="absolute left-[6px] top-6 w-[2px] h-full bg-gray-300"></span>
                        )}
                        <div className="absolute left-0">{icon}</div>
                        <div className="ml-6">
                          <p className="font-medium">
                            {step.role} -{" "}
                            <span
                              className={
                                step.action === "approve"
                                  ? "text-green-600"
                                  : step.action === "reject"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }
                            >
                              {step.action.toUpperCase()}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(step.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
