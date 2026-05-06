import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BASE_URL, API_URL } from "@/data";
import { Order, OrderRequestResolution, OrderRequestType } from "@/Types/types";
import {
  getEligibleOrderRequestTypes,
  getOrderRequestLabel,
  getOrderRequestStatusTone,
  getResolutionOptionsForRequestType,
  getVisibleOrderRequest,
} from "@/lib/orderRequests";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type PanelRole = "user" | "admin" | "seller";

type OrderRequestPanelProps = {
  order: Order;
  role: PanelRole;
};

export default function OrderRequestPanel({ order, role }: OrderRequestPanelProps) {
  const qc = useQueryClient();
  const visibleRequest = getVisibleOrderRequest(order);
  const eligibleTypes = getEligibleOrderRequestTypes(order);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [requestType, setRequestType] = useState<OrderRequestType | "">("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [resolutionType, setResolutionType] = useState<OrderRequestResolution | "">("");

  const availableResolutions = useMemo(
    () => getResolutionOptionsForRequestType(visibleRequest?.requestType),
    [visibleRequest?.requestType],
  );

  const invalidateOrderQueries = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["user-order-detail"] }),
      qc.invalidateQueries({ queryKey: ["user-orders"] }),
      qc.invalidateQueries({ queryKey: ["seller-order-detail"] }),
      qc.invalidateQueries({ queryKey: ["seller-orders"] }),
      qc.invalidateQueries({ queryKey: ["seller-order-requests"] }),
      qc.invalidateQueries({ queryKey: ["admin-order-detail"] }),
      qc.invalidateQueries({ queryKey: ["admin-all-orders"] }),
      qc.invalidateQueries({ queryKey: ["admin-order-requests"] }),
    ]);
  };

  const createRequest = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("requestType", requestType);
      formData.append("reason", reason);
      formData.append("description", description);
      Array.from(files ?? []).forEach((file) => formData.append("request_files", file));

      const res = await fetch(`${API_URL}order/request/${order._id}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Failed to raise request");
      return body;
    },
    onSuccess: async (data) => {
      await invalidateOrderQueries();
      toast.success(data?.message || "Request raised successfully");
      setShowCreateForm(false);
      setRequestType("");
      setReason("");
      setDescription("");
      setFiles(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to raise request");
    },
  });

  const adminAction = useMutation({
    mutationFn: async (action: "forward_to_seller" | "reject") => {
      const res = await fetch(`${API_URL}order/admin-order-request/${order._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Unable to update request");
      return body;
    },
    onSuccess: async (data) => {
      await invalidateOrderQueries();
      toast.success(data?.message || "Request updated");
      setNote("");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to update request"),
  });

  const sellerAction = useMutation({
    mutationFn: async (action: "complete" | "reject") => {
      const res = await fetch(`${API_URL}order/seller-order-request/${order._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note, resolutionType }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Unable to update request");
      return body;
    },
    onSuccess: async (data) => {
      await invalidateOrderQueries();
      toast.success(data?.message || "Request updated");
      setNote("");
      setResolutionType("");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to update request"),
  });

  return (
    <section className="mt-6 rounded-sm border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Order Request</h4>
          <p className="text-sm text-slate-500">
            Cancel before shipment. Return or replace within {order.requestSummary?.requestWindowDays ?? 7} days after delivery.
          </p>
        </div>
        {visibleRequest && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getOrderRequestStatusTone(visibleRequest.status)}`}>
            {getOrderRequestLabel(visibleRequest)}
          </span>
        )}
      </div>

      {visibleRequest ? (
        <div className="mt-4 space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Request Type</p>
              <p className="mt-1 font-medium text-slate-900">{visibleRequest.requestType}</p>
            </div>
            <div className="rounded-sm border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-1 font-medium text-slate-900">{visibleRequest.status}</p>
            </div>
          </div>

          <div className="rounded-sm border bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</p>
            <p className="mt-1 text-slate-900">{visibleRequest.reason}</p>
            {visibleRequest.description && (
              <>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">{visibleRequest.description}</p>
              </>
            )}
          </div>

          {(visibleRequest.adminDecisionNote || visibleRequest.sellerDecisionNote) && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-sm border bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Note</p>
                <p className="mt-1 text-slate-700">{visibleRequest.adminDecisionNote || "No admin note added"}</p>
              </div>
              <div className="rounded-sm border bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seller Note</p>
                <p className="mt-1 text-slate-700">{visibleRequest.sellerDecisionNote || "No seller note added"}</p>
              </div>
            </div>
          )}

          {visibleRequest.evidenceFiles && visibleRequest.evidenceFiles.length > 0 && (
            <div className="rounded-sm border bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {visibleRequest.evidenceFiles.map((file) => (
                  <a
                    key={file}
                    href={`${BASE_URL}payment-docs/${file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50"
                  >
                    View file
                  </a>
                ))}
              </div>
            </div>
          )}

          {role === "admin" && visibleRequest.status === "Requested" && (
            <div className="rounded-sm border bg-white p-3">
              <Label htmlFor="admin-request-note">Admin note</Label>
              <Textarea
                id="admin-request-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add note for seller or rejection reason"
                className="mt-2 min-h-24"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => adminAction.mutate("forward_to_seller")}
                  disabled={adminAction.isPending}
                  className="bg-sky-700 text-white hover:bg-sky-800"
                >
                  {adminAction.isPending ? "Updating..." : "Send To Seller"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => adminAction.mutate("reject")}
                  disabled={adminAction.isPending}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  Reject Request
                </Button>
              </div>
            </div>
          )}

          {role === "seller" && visibleRequest.status === "Sent To Seller" && (
            <div className="rounded-sm border bg-white p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Resolution</Label>
                  <Select value={resolutionType} onValueChange={(value) => setResolutionType(value as OrderRequestResolution)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableResolutions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seller-request-note">Seller note</Label>
                  <Textarea
                    id="seller-request-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Mention what action was taken"
                    className="mt-2 min-h-24"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => sellerAction.mutate("complete")}
                  disabled={sellerAction.isPending || !resolutionType}
                  className="bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  {sellerAction.isPending ? "Updating..." : "Complete Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => sellerAction.mutate("reject")}
                  disabled={sellerAction.isPending}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-sm border bg-white p-3 text-sm text-slate-600">
          No request has been raised for this order item yet.
        </div>
      )}

      {role === "user" && !visibleRequest?.isActive && eligibleTypes.length > 0 && (
        <div className="mt-4">
          {!showCreateForm ? (
            <Button type="button" variant="outline" onClick={() => setShowCreateForm(true)}>
              Raise Request
            </Button>
          ) : (
            <div className="rounded-sm border bg-white p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Request type</Label>
                  <Select value={requestType} onValueChange={(value) => setRequestType(value as OrderRequestType)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="request-reason">Reason</Label>
                  <Input
                    id="request-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Short reason"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="request-description">Description</Label>
                <Textarea
                  id="request-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share details for admin and seller"
                  className="mt-2 min-h-24"
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="request-files">Photos or supporting files</Label>
                <Input
                  id="request-files"
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="mt-2"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => createRequest.mutate()}
                  disabled={createRequest.isPending || !requestType || !reason.trim()}
                >
                  {createRequest.isPending ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setRequestType("");
                    setReason("");
                    setDescription("");
                    setFiles(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
