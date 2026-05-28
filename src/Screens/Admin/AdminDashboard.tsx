import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAdminDashboardSummary, DashboardSummary, getAllOrders } from "./Admin.HooksAndUtils";
import { FaRegAddressCard, FaBuilding, FaShoppingCart, FaTimes } from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
// import { FaPlus } from "react-icons/fa6";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import AdminOrderTable from "@/components/Admin/AdminOrderTable";
import { API_URL } from "@/data";
import { useUserStore } from "@/store/userStore";
import { toast } from "react-toastify";
import LoaderUi from "@/components/UIComponents/LoaderUi";


const OVERVIEW_ITEMS = [
  { label: "New Vendors", color: "from-blue-500 to-indigo-500", IconComponent: IoPersonAdd },
  { label: "Vendors", color: "from-green-500 to-emerald-500", IconComponent: FaRegAddressCard },
  { label: "Institutes", color: "from-yellow-500 to-orange-500", IconComponent: FaBuilding },
  { label: "Orders", color: "from-pink-500 to-rose-500", IconComponent: FaShoppingCart },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  // --- Modal & Form States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole] = useState(""); // "Product Manager" or "Accountant"
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const user = useUserStore((state) => state.user);

  // Query for dashboard summary
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    isError: dashboardIsError,
  } = useQuery<DashboardSummary, Error>({
    queryKey: ["admin-dashboard-summary"],
    queryFn: getAdminDashboardSummary,
  });

  // Query for all orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    status: ordersStatus,
    isError: ordersIsError,
  } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: getAllOrders,
  });

  // --- Handlers ---
  // const openModal = (role: string) => {
  //   setSelectedRole(role);
  //   setIsModalOpen(true);
  // };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}user/registerStaff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: selectedRole }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`${selectedRole} added successfully!`);
        setIsModalOpen(false);
        setFormData({ firstName: "", lastName: "", email: "", password: "" });
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (dashboardLoading || ordersLoading) {
    return <LoaderUi title="Loading dashboard..." />;
  }

  if (dashboardIsError || ordersIsError) {
    return <div className="text-red-500 p-10 text-center">Error loading data.</div>;
  }

  const stockData = OVERVIEW_ITEMS.map((item) => {
    let count = 0;
    if (item.label === "New Vendors") count = dashboardData?.newVendors ?? 0;
    if (item.label === "Vendors") count = dashboardData?.vendors ?? 0;
    if (item.label === "Institutes") count = dashboardData?.institutes ?? 0;
    if (item.label === "Orders") count = dashboardData?.orders ?? 0;
    return { ...item, count };
  });

return (
    <div className="bg-gradient-to-br from-white to-gray-100 p-2 sm:p-4 md:p-6 min-h-screen">
      <div className="w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 p-2 sm:p-4 rounded-xl">
          {/* 1. Welcome Message */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Welcome back {user?.firstName || "Admin"} 👋
            </h1>
          </div>

          {/* 3. Last Updated Message */}
          <div>
            <p className="text-gray-500 text-xs sm:text-sm italic">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
{/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
          {stockData.map((item, index) => (
            <div 
              key={index}
              onClick={() =>
                navigate(
                  item.label === "Vendors"
                    ? "/admin/sellers"
                    : item.label === "New Vendors"
                      ? "/admin/requests?tab=seller"
                      : item.label === "Institutes"
                        ? "/admin/users"
                        : "/admin/orders"
                )
              }
              className={`bg-gradient-to-r ${item.color} text-white rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-md lg:shadow-lg cursor-pointer hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between">
                <item.IconComponent className="text-2xl lg:text-4xl" />
                <span className="text-2xl lg:text-4xl font-bold">{item.count}</span>
              </div>
              <p className="text-sm lg:text-lg mt-2 lg:mt-4 font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <h2 className="text-center text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-4 text-gray-800 font-semibold">Recent Orders</h2>
        <AdminMainWrapper status={ordersStatus} heading="All Orders">
          {ordersData && <AdminOrderTable orders={ordersData?.orders} />}
        </AdminMainWrapper>

        {/* --- Registration Modal --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Add {selectedRole}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={20} />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="First Name" required
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Last Name" required
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                <input 
                  type="email" placeholder="Email Address" required
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="password" placeholder="Set Password" required
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={loading}
                    className="flex-1 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  >
                    {loading ? "Processing..." : "Save Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
