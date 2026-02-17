import { useState, useEffect } from "react";
import { API_URL } from "@/data";
import { useUserStore } from "../../store/userStore";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import AdminMemberTable from "@/components/Admin/AdminMemberTable";

type PermissionsType = {
  uploadImage: boolean;
  allOrders: boolean;
  allSeller: boolean;
  allSales: boolean;
  allInstitutes: boolean;
  requests: boolean;
  stockmanagement: boolean;
  allproducts: boolean;
};

const defaultPermissions: PermissionsType = {
  uploadImage: false,
  allOrders: false,
  allSeller: false,
  allSales: false,
  allInstitutes: false,
  requests: false,
  stockmanagement: false,
  allproducts: false,
};

type RoleType = {
  _id: string;
  name: string;
};

type Member = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  permissions?: PermissionsType;
};

const AdminMemberAccess = () => {
  const user = useUserStore((state) => state.user);

  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [showRoleInput, setShowRoleInput] = useState(false);

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [permissions, setPermissions] = useState<PermissionsType>({ ...defaultPermissions });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<Member | null>(null);

  // =============================== FETCH MEMBERS ===============================
  const fetchMembers = async () => {
    try {
      setStatus("pending");
      const res = await fetch(`${API_URL}user/getmemberuser`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMembers(Array.isArray(data.users) ? data.users : []);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to fetch members");
      setStatus("error");
    }
  };

  // =============================== FETCH ROLES ===============================
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}user/get-roles`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRoles(data.roles || []);
    } catch (err) {
      console.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchRoles();
  }, []);

  // =============================== CREATE ROLE ===============================
  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      const res = await fetch(`${API_URL}user/create-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setNewRoleName("");
      setShowRoleInput(false);
      fetchRoles(); // Refresh roles list
    } catch (err: any) {
      alert(err.message || "Failed to create role");
    }
  };

  // =============================== DELETE MEMBER ===============================
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}user/delete-user/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setMembers((prev) => prev.filter((u) => u._id !== id));
      alert("User deleted successfully");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // =============================== EDIT MEMBER ===============================
  const handleEditUser = (user: Member) => {
    setEditUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "",
    });
    setSelectedRole(user.role || "");
    setPermissions({ ...defaultPermissions, ...(user.permissions || {}) });
    setEditModalOpen(true);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}user/updateStaff/${editUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
          permissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("User updated successfully!");
      setEditModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // =============================== PERMISSION CHANGE ===============================
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPermissions({ ...permissions, [name]: checked });
  };

  // =============================== ADD NEW MEMBER ===============================
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}user/registerStaff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
          permissions,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(`Member added successfully!`);
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      setPermissions({ ...defaultPermissions });
      fetchMembers();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "Admin") {
    return <div className="p-10 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-10">
      {/* ================= ADD MEMBER FORM ================= */}
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6">Member Access Management</h1>

        {/* ================= SELECT ROLE ================= */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Select Role</label>
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Choose Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowRoleInput(!showRoleInput)}
              className="px-4 bg-gray-200 rounded-xl outline-green-400"
            >
              Add
            </button>
          </div>

          {showRoleInput && (
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="New role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full p-3 border rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="px-4 bg-indigo-600 text-white rounded-xl"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* ================= CREATE MEMBER FORM ================= */}
        {selectedRole && !editModalOpen && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="p-3 border rounded-xl"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="p-3 border rounded-xl"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
            />

          <div className="space-y-2 pt-4">
  <h3 className="font-semibold text-gray-700">Permissions</h3>
  <div className="grid grid-cols-3 gap-4">
    {Object.keys(permissions)
      .sort()
      .map((perm) => (
        <label key={perm} className="flex items-center gap-2">
          <input
            type="checkbox"
            name={perm}
            checked={permissions[perm as keyof PermissionsType]}
            onChange={handlePermissionChange}
          />
          {perm}
        </label>
      ))}
  </div>
</div>



            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl mt-4"
            >
              {loading ? "Processing..." : `Add ${selectedRole}`}
            </button>
          </form>
        )}
      </div>

      {/* ================= TABLE ================= */}
      <AdminMainWrapper
        status={status}
        heading="All Members"
        errorMeassage={errorMessage}
      >
        {status === "success" && (
          <AdminMemberTable
            users={members}
            onDeleteUser={handleDeleteUser}
            onEditUser={handleEditUser}
          />
        )}
      </AdminMainWrapper>

      {/* ================= EDIT MODAL ================= */}
      {editModalOpen && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500"
              onClick={() => setEditModalOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Edit Member</h2>

            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="p-3 border rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="p-3 border rounded-xl"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 border rounded-xl"
              />

              <div className="mb-4">
                <label className="block mb-2 font-medium">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                >
                  {roles.map((role) => (
                    <option key={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="font-semibold text-gray-700">Permissions</h3>
                {Object.keys(permissions).map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={perm}
                      checked={permissions[perm as keyof PermissionsType]}
                      onChange={handlePermissionChange}
                    />
                    {perm}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl mt-4"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMemberAccess;
