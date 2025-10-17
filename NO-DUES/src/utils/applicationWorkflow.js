// utils/applicationWorkflow.js
export const WORKFLOW_STAGES = ["exam", "sports", "library", "accounts"];

export function handleAction(application, action, remarks, currentRole, updateApplication) {
  // 1. Update history
  const updatedHistory = [
    ...(application.history || []),
    {
      stage: currentRole,
      action,
      remarks,
      timestamp: new Date().toISOString(),
    },
  ];

  let newStatus = application.status;
  let newStage = application.currentStage;

  // 2. Handle Approve/Reject Logic
  if (action === "approved") {
    const currentIndex = WORKFLOW_STAGES.indexOf(currentRole);
    if (currentIndex < WORKFLOW_STAGES.length - 1) {
      // Move to next stage
      newStage = WORKFLOW_STAGES[currentIndex + 1];
      newStatus = "pending";
      sendNotification(newStage, `New application pending: ${application.rollNo}`);
    } else {
      // Last stage - Mark as completed
      newStage = "office";
      newStatus = "completed";
      sendNotification("office", `Application completed: ${application.rollNo}`);
      sendNotification(application.studentEmail, `🎉 Your No-Dues is approved!`);
    }
  } else if (action === "rejected") {
    newStatus = "rejected";
    newStage = "office"; // Send back to office or keep in rejected list
    sendNotification(application.studentEmail, `❌ Your No-Dues was rejected. Remarks: ${remarks}`);
  }

  // 3. Call update function (to update in DB / state)
  updateApplication({
    ...application,
    currentStage: newStage,
    status: newStatus,
    history: updatedHistory,
  });
}

// 🔔 Simple mock notification (replace with real API / toast)
function sendNotification(target, message) {
  console.log(`📢 Notification sent to ${target}: ${message}`);
}
