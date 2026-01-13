import React, { useEffect, useState } from "react";
import { User, getAllUsers, deleteUser } from "./Admin.HooksAndUtils";
import AdminUserTable from "@/components/Admin/AdminUserTable";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";

const AllUserScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [error, setError] = useState<string>("");

  const fetchUsers = async () => {
    try {
      setStatus("pending");
      const usersData = await getAllUsers();

      // support both shapes: (1) { users: [...] } or (2) [...users]
      const list: User[] = Array.isArray(usersData)
        ? usersData
        : [];

      setUsers(list);
      setStatus("success");
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
      setUsers([]);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      // optionally show toast instead of alert
      alert("User deleted successfully!");
    } catch (err: any) {
      alert(err?.message || "Failed to delete user");
    }
  };

  return (
    <AdminMainWrapper status={status} heading="All Institute" errorMeassage={error}>
      {status === "success" && (
        <AdminUserTable users={users} onDeleteUser={handleDeleteUser} />
      )}
    </AdminMainWrapper>
  );
};

export default AllUserScreen;
