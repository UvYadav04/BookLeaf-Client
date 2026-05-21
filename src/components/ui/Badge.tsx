import { Ticket } from "@/lib/types";

function statusClass(status: Ticket["status"]) {
  switch (status) {
    case "Open":
      return "badge-open";
    case "In Progress":
      return "badge-progress";
    case "Resolved":
      return "badge-resolved";
    case "Closed":
      return "badge-closed";
    default:
      return "badge-closed";
  }
}

function priorityClass(priority: Ticket["priority"]) {
  switch (priority) {
    case "Critical":
      return "badge-critical";
    case "High":
      return "badge-high";
    case "Medium":
      return "badge-medium";
    case "Low":
      return "badge-low";
    default:
      return "badge-low";
  }
}

export function StatusBadge({ status }: { status: Ticket["status"] }) {
  return <span className={`badge ${statusClass(status)}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: Ticket["priority"] }) {
  return <span className={`badge ${priorityClass(priority)}`}>{priority}</span>;
}
