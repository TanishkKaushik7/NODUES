// utils/applicationWorkflow.js
export const WORKFLOW_STAGES = ["exam", "sports", "library", "accounts"];

export function handleAction(application, action, remarks, updateApplication) {
  // 1. Update history (role-based stages removed)
  const updatedHistory = [
    ...(application.history || []),
    {
      stage: application.currentStage || null,
      action,
      remarks,
      timestamp: new Date().toISOString(),
    },
  ];

  let newStatus = application.status;

  // 2. Simplified Approve/Reject Logic
  if (action === "approved") {
    newStatus = "completed";
  } else if (action === "rejected") {
    newStatus = "rejected";
  }

  // 3. Call update function (to update in DB / state)
  updateApplication({
    ...application,
    status: newStatus,
    history: updatedHistory,
  });
}

// 🔔 Simple mock notification (replace with real API / toast)
function sendNotification(target, message) {
  console.log(`📢 Notification sent to ${target}: ${message}`);
}
