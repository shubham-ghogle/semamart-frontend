import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { API_URL } from "@/data";
import { useSellerSession, SELLER_MEMBER_PERMISSION_KEYS } from "./sellerSession";

type Member = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  createdAt?: string;
  permissions?: Record<string, boolean>;
};

const defaultPermissions = SELLER_MEMBER_PERMISSION_KEYS.reduce<Record<string, boolean>>(
  (acc, key) => {
    acc[key] = key === "Dashboard" || key === "MyAccount";
    return acc;
  },
  {},
);

export default function SellerMembersScreen() {
  const { shopId, canAccess } = useSellerSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    ...defaultPermissions,
  });

  const fetchMembers = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}shop/members`, { credentials: "include" });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Failed to load members");
      setMembers(Array.isArray(body?.members) ? body.members : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [shopId]);

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    });
    setPermissions({ ...defaultPermissions });
    setEditingMember(null);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setForm({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email || "",
      phoneNumber: member.phoneNumber || "",
      password: "",
    });
    setPermissions({ ...defaultPermissions, ...(member.permissions || {}) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingMember ? `${API_URL}shop/members/${editingMember._id}` : `${API_URL}shop/members`;
      const res = await fetch(url, {
        method: editingMember ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          permissions,
        }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Failed to save member");

      toast.success(editingMember ? "Member updated" : "Member created");
      resetForm();
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to save member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      const res = await fetch(`${API_URL}shop/members/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Failed to delete member");
      toast.success("Member deleted");
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete member");
    }
  };

  if (!canAccess("ManageMembers")) {
    return (
      <SellerMainWrapper heading="Team Members" status="success">
        <div className="rounded-xl border bg-white p-4 text-gray-600">
          You do not have access to manage members.
        </div>
      </SellerMainWrapper>
    );
  }

  return (
    <SellerMainWrapper heading="Team Members" status="success">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingMember ? "Edit Member" : "Create Member"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              placeholder="First name"
              className="rounded-xl border px-3 py-2"
              required
            />
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              placeholder="Last name"
              className="rounded-xl border px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email"
              type="email"
              className="rounded-xl border px-3 py-2"
              required
            />
            <input
              value={form.phoneNumber}
              onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              placeholder="Phone number"
              className="rounded-xl border px-3 py-2"
            />
          </div>

          <input
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder={editingMember ? "New password (optional)" : "Temporary password"}
            type="password"
            className="w-full rounded-xl border px-3 py-2"
            required={!editingMember}
          />

          <div className="rounded-xl border bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Feature permissions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SELLER_MEMBER_PERMISSION_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={permissions[key] ?? false}
                    onChange={(e) =>
                      setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#1C647C] px-4 py-2 text-white font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : editingMember ? "Update Member" : "Create Member"}
            </button>
            {editingMember && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border px-4 py-2 font-medium text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Existing members</h2>
            <button onClick={fetchMembers} className="text-sm text-[#1C647C] font-medium">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-gray-500">No members created yet.</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member._id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-gray-800">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString("en-IN") : "-"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(member)}
                        className="rounded-lg border px-3 py-1.5 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member._id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(member.permissions || {})
                      .filter(([, enabled]) => enabled)
                      .map(([key]) => (
                        <span key={key} className="rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-700">
                          {key}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SellerMainWrapper>
  );
}
