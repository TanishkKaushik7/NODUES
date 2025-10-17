import { createContext, useContext, useState } from "react";

const ApplicationContext = createContext();

export const useApplications = () => useContext(ApplicationContext);

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);

  // Submit a new application
  const submitApplication = (appData) => {
    setApplications(prev => [...prev, appData]);
  };

  // Approve or reject application
  const updateApplicationStatus = (id, action, nextRole) => {
    setApplications(prev => 
      prev.map(app => app.id === id 
        ? {
            ...app,
            status: action === "approve" ? "pending" : "rejected",
            currentRole: action === "approve" ? nextRole : app.currentRole,
            logs: [...app.logs, { role: app.currentRole, action, date: new Date().toISOString() }]
          }
        : app
      )
    );
  };

  return (
    <ApplicationContext.Provider value={{ applications, submitApplication, updateApplicationStatus }}>
      {children}
    </ApplicationContext.Provider>
  );
};
