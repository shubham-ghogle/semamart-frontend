import React, { useEffect, useState } from "react";
import { User, getAllUsers, deleteUser } from "./Admin.HooksAndUtils";

const AllUserScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers(); // <-- using API helper
      setUsers(usersData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id); // <-- using API helper
      setUsers((prev) => prev.filter((user) => user._id !== id));
      alert("User deleted successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
<tbody>
  {users.length > 0 ? (
    users.map((user) => (
      <tr key={user._id} className="text-center">
        {/* Display full name */}
        <td className="py-2 px-4 border-b">{`${user.firstName} ${user.lastName}`}</td>

        <td className="py-2 px-4 border-b">{user.email}</td>
        <td className="py-2 px-4 border-b">{user.role}</td>
        <td className="py-2 px-4 border-b">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="py-2 px-4 border-b">
          <button
            onClick={() => handleDeleteUser(user._id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5} className="py-4">
        No users found.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default AllUserScreen;
