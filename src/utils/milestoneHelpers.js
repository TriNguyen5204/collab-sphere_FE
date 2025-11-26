export const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "text-green-600 bg-green-50 border-green-200";
    case "Pending":
    default:
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "Completed":
      return "CheckCircle";
    case "Pending":
    default:
      return "Clock";
  }
};

export const normalizeMilestoneStatus = (status) => {
  if (status === null || status === undefined) {
    return "Pending";
  }

  if (typeof status === "number") {
    return status === 1 ? "Completed" : "Pending";
  }

  const normalized = status.toString().trim().toLowerCase();

  if (["1", "true", "completed", "complete", "done", "finished"].includes(normalized)) {
    return "Completed";
  }

  if (["pending", "processing", "in_progress", "in progress", "ongoing", "0", "false", "not_started", "open", "locked", "lock"].includes(normalized)) {
    return "Pending";
  }

  return status.toString().trim() || "Pending";
};

export const getDaysRemaining = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
