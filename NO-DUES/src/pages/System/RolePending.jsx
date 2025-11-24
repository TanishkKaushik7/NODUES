import React from 'react';

const RolePending = ({ role }) => {
  const title = role ? `${role.charAt(0).toUpperCase() + role.slice(1)} - Pending` : 'Pending';
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">This is a role-specific Pending page placeholder for <strong>{role}</strong>. Create a dedicated page at <code>src/pages/{role.charAt(0).toUpperCase() + role.slice(1)}/PendingPage.jsx</code> to replace this.</p>
      <div className="mt-4 p-4 bg-white border border-gray-100 rounded-lg text-sm text-slate-700">No pending items to display (placeholder).</div>
    </div>
  );
};

export default RolePending;
