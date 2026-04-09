import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { API_URL } from "@/data";
import { useUserStore } from "@/store/userStore";
import { getAccountOwnerId, isSubAccount } from "@/lib/utils";
import type { User } from "@/Types/types";
import { toast } from "react-toastify";
import { FaTrash, FaUsers } from "react-icons/fa";

type Member = Omit<User, "password"> & {
  parentUser?: string | User | null;
  accountType?: "main" | "member";
};

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
};

export default function UserMembersScreen() {
  const user = useUserStore((state) => state.user);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const canManageMembers = !!user && !isSubAccount(user);
  const accountOwnerId = useMemo(() => getAccountOwnerId(user), [user]);
  const customMemberCount = Math.max(members.length - 1, 0);

  if (!user) {
    return <div className="p-6 text-slate-500">Loading account details...</div>;
  }

  useEffect(() => {
    if (!accountOwnerId) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}user/members`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load members");
        setMembers(Array.isArray(data.members) ? data.members : []);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [accountOwnerId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(emptyForm);

  const handleCreateMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManageMembers) return;

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}user/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          email: form.email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create member");

      toast.success("Member created successfully");
      setMembers((prev) => [...prev, data.member]);
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!canManageMembers) return;
    if (!window.confirm("Remove this member from your account?")) return;

    try {
      const res = await fetch(`${API_URL}user/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to remove member");

      setMembers((prev) => prev.filter((member) => member._id !== memberId));
      toast.success("Member removed");
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-600 font-semibold">Account Team</p>
            <h1 className="text-2xl font-bold text-slate-900">Custom Members</h1>
            <p className="text-sm text-slate-500">
              Add people to the same account so they can use the portal with the same shared access.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm text-sky-700">
            <FaUsers />
            {customMemberCount} member{customMemberCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {canManageMembers ? (
        <form onSubmit={handleCreateMember} className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <FaUsers className="text-sky-600" />
            Add New Member
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" className="rounded-xl border px-4 py-3" />
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" className="rounded-xl border px-4 py-3" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email address" type="email" className="rounded-xl border px-4 py-3" />
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone number" className="rounded-xl border px-4 py-3" />
            <input name="password" value={form.password} onChange={handleChange} placeholder="Temporary password" type="password" className="rounded-xl border px-4 py-3 md:col-span-2" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-sky-600 px-5 py-3 text-white font-medium disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Member"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-xl border px-5 py-3 font-medium text-slate-700">
              Reset
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl bg-sky-50 border border-sky-100 p-5 text-sky-900">
          This is a member login. Member management is available to the primary account holder only.
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Shared Access List</h2>
          <p className="text-sm text-slate-500">Account owner id: {accountOwnerId}</p>
        </div>

        {loading ? (
          <div className="p-6 text-slate-500">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="p-6 text-slate-500">No members added yet.</div>
        ) : (
          <div className="divide-y">
            {members.map((member) => (
              <div key={member._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                  <p className="text-xs text-slate-400">
                    {member.accountType === "member" ? "Member account" : "Primary account"}
                  </p>
                </div>
                {canManageMembers && member._id !== user?._id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(member._id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <FaTrash />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
