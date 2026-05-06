import { Order, OrderRequest, OrderRequestResolution, OrderRequestStatus, OrderRequestType } from "@/Types/types";

export const ORDER_REQUEST_TYPE_OPTIONS: OrderRequestType[] = ["Cancel", "Return", "Replace"];

export function getLatestOrderRequest(order?: Order | null): OrderRequest | null {
  if (!order?.requestLog?.length) return null;
  return order.requestLog[order.requestLog.length - 1] ?? null;
}

export function getActiveOrderRequest(order?: Order | null): OrderRequest | null {
  if (!order?.requestLog?.length) return null;
  for (let i = order.requestLog.length - 1; i >= 0; i -= 1) {
    if (order.requestLog[i]?.isActive) return order.requestLog[i];
  }
  return null;
}

export function getVisibleOrderRequest(order?: Order | null): OrderRequest | null {
  return order?.requestSummary?.activeRequest ?? getActiveOrderRequest(order) ?? order?.requestSummary?.latestRequest ?? getLatestOrderRequest(order);
}

export function getEligibleOrderRequestTypes(order?: Order | null): OrderRequestType[] {
  return order?.requestSummary?.eligibleRequestTypes ?? [];
}

export function getOrderRequestStatusTone(status?: OrderRequestStatus | null) {
  switch (status) {
    case "Requested":
      return "bg-amber-100 text-amber-800";
    case "Sent To Seller":
      return "bg-sky-100 text-sky-800";
    case "Completed":
      return "bg-emerald-100 text-emerald-800";
    case "Admin Rejected":
    case "Seller Rejected":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function getOrderRequestLabel(request?: OrderRequest | null) {
  if (!request) return "No request";
  if (request.status === "Completed" && request.resolutionType && request.resolutionType !== "Pending") {
    return `${request.requestType} ${request.resolutionType}`;
  }
  return `${request.requestType} ${request.status}`;
}

export function getResolutionOptionsForRequestType(requestType?: OrderRequestType | null): OrderRequestResolution[] {
  if (requestType === "Cancel") return ["Cancelled"];
  if (requestType === "Return") return ["Refund"];
  if (requestType === "Replace") return ["Replacement"];
  return ["Pending"];
}
