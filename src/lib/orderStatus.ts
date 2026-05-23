import { Order } from "@/Types/types";
import { getVisibleOrderRequest, getOrderRequestLabel } from "./orderRequests";

export function getDisplayOrderStatus(order?: Order | null) {
  if (!order) return "-";

  const visibleRequest = getVisibleOrderRequest(order);
  if (visibleRequest) {
    if (
      visibleRequest.status === "Completed" &&
      visibleRequest.requestType === "Cancel" &&
      visibleRequest.resolutionType === "Cancelled"
    ) {
      return "Cancelled";
    }

    return getOrderRequestLabel(visibleRequest);
  }

  const paymentMethod = (order.paymentInfo?.method || "").toLowerCase();
  const paymentStatus = (order.paymentInfo?.status || "").toLowerCase();
  const isOnlinePaid =
    ["hdfc", "online", "razorpay"].includes(paymentMethod) ||
    paymentStatus === "paid";

  if (order.status === "Paid") {
    return isOnlinePaid ? "Processing" : "Verify Payment";
  }

  return order.status || "-";
}

export function getOrderStatusBucket(order?: Order | null) {
  const status = getDisplayOrderStatus(order);

  if (
    status === "Cancelled" ||
    status.startsWith("Cancel ")
  ) {
    return "Cancelled";
  }

  if (
    status === "Refund Requested" ||
    status === "Refund Success" ||
    status.startsWith("Return ")
  ) {
    return "Return";
  }

  if (status === "Delivered") return "Delivered";
  if (status === "Pending" || status === "Verify Payment") return "Pending";
  if (
    status === "Processing" ||
    status === "Packed" ||
    status === "Shipped"
  ) {
    return "Processing";
  }

  return status;
}

export function isRevenueRecognizedOrder(order?: Order | null) {
  if (!order) return false;

  if (order.status !== "Delivered") return false;

  const visibleRequest = getVisibleOrderRequest(order);
  if (
    visibleRequest?.status === "Completed" &&
    visibleRequest.requestType === "Return" &&
    visibleRequest.resolutionType === "Refund"
  ) {
    return false;
  }

  return true;
}
