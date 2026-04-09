import { useState, useEffect } from "react";
import { API_URL } from "@/data";
import { useUserStore } from "../../store/userStore";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import AdminMemberTable, { Member } from "@/components/Admin/AdminMemberTable";
import { Check, X, ChevronDown, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

type PermissionsType = {
  UploadImage: boolean;
  AllOrders: boolean;
  AllSeller: boolean;
  AllSales: boolean;
  AllInstitutes: boolean;
  Requests: boolean;
  StockManagement: boolean;
  AllProducts: boolean;
};

const defaultPermissions: PermissionsType = {
  UploadImage: false,
  AllOrders: false,
  AllSeller: false,
  AllSales: false,
  AllInstitutes: false,
  Requests: false,
  StockManagement: false,
  AllProducts: false,
};

type RoleType = { _id: string; name: string };

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

  // ================= FETCH DATA =================
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

  // ================= ROLE ACTIONS =================
  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      toast.warning("Please enter a role name");
      return;
    }
    try {
      const res = await fetch(`${API_URL}user/create-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success("New role added successfully");
      setNewRoleName("");
      setShowRoleInput(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || "Failed to create role");
    }
  };

  // ================= PERMISSION CHANGE =================
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPermissions(prev => ({ ...prev, [name]: checked }));
  };

  // ================= ADD MEMBER =================
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}user/registerStaff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: selectedRole, permissions }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      toast.success("Member registered successfully!");
      
      // Reset everything and REMOVE FORM
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      setPermissions({ ...defaultPermissions });
      setSelectedRole(""); 
      setShowRoleInput(false);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT MEMBER =================
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
        body: JSON.stringify({ ...formData, role: selectedRole, permissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success("User updated successfully!");
      closeEditModal();
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      const res = await fetch(`${API_URL}user/delete-user/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setMembers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditUser(null);
    setFormData({ firstName: "", lastName: "", email: "", password: "" });
    setSelectedRole("");
    setPermissions({ ...defaultPermissions });
  };

  if (user?.role !== "Admin") {
    return <div className="p-10 text-center text-red-500 font-semibold">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-8">
      {/* ================= ADD MEMBER SECTION ================= */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-4 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Member Access Management</h1>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Select Role</label>
          <div className="relative flex flex-col gap-3">
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => {
                  if (e.target.value === "ADD_NEW") {
                    setShowRoleInput(true);
                    setSelectedRole("");
                  } else {
                    setSelectedRole(e.target.value);
                    setShowRoleInput(false);
                  }
                }}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 appearance-none bg-white pr-10"
              >
                <option value="">Choose Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role.name}>{role.name}</option>
                ))}
                <option value="ADD_NEW" className="text-indigo-600 font-bold">+ Add New Role</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={18} />
              </div>
            </div>

            {showRoleInput && (
              <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  autoFocus
                  placeholder="Role Name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <button onClick={handleAddRole} className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-sm"><Check size={20} /></button>
                <button onClick={() => { setShowRoleInput(false); setNewRoleName(""); }} className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-sm"><X size={20} /></button>
              </div>
            )}
          </div>
        </div>

        {selectedRole && !editModalOpen && (
          <form onSubmit={handleFormSubmit} className="space-y-4 border-t pt-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="p-3 border rounded-xl" />
              <input type="text" placeholder="Last Name" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="p-3 border rounded-xl" />
            </div>
            <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border rounded-xl" />
            <input type="password" placeholder="Password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 border rounded-xl" />

            <div className="bg-gray-50 p-4 rounded-xl">
               <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><ShieldCheck size={16}/> Assign Permissions</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(permissions).map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                      <input type="checkbox" name={perm} checked={permissions[perm as keyof PermissionsType]} onChange={handlePermissionChange} className="w-4 h-4 rounded text-indigo-600" />
                      {perm}
                    </label>
                  ))}
               </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold">{loading ? "Submitting..." : `Add ${selectedRole}`}</button>
          </form>
        )}
      </div>

      {/* ================= MEMBERS TABLE ================= */}
      <AdminMainWrapper status={status} heading="All Members" errorMeassage={errorMessage}>
        {status === "success" && <AdminMemberTable users={members} onDeleteUser={handleDeleteUser} onEditUser={handleEditUser} />}
      </AdminMainWrapper>

      {/* ================= EDIT MODAL ================= */}
      {editModalOpen && editUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={closeEditModal}><X size={24} /></button>
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Edit Member Details</h2>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="p-3 border rounded-xl" />
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="p-3 border rounded-xl" />
              </div>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border rounded-xl" />
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Role</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full p-3 border rounded-xl bg-white">
                  {roles.map((role) => (<option key={role._id} value={role.name}>{role.name}</option>))}
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Update Permissions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(defaultPermissions).map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                      <input type="checkbox" name={perm} checked={permissions[perm as keyof PermissionsType]} onChange={handlePermissionChange} className="w-4 h-4 rounded text-indigo-600" />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">{loading ? "Saving..." : "Save Changes"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMemberAccess;