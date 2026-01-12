import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAdminDashboardSummary, DashboardSummary, getAllOrders } from "./Admin.HooksAndUtils";
import { FaRegAddressCard, FaBuilding, FaShoppingCart } from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
import AdminMainWrapper from "@/components/Admin/AdminMainWrapper";
import AdminOrderTable from "@/components/Admin/AdminOrderTable";

const OVERVIEW_ITEMS = [
  { label: "New Vendors", color: "from-blue-500 to-indigo-500", IconComponent: IoPersonAdd },
  { label: "Vendors", color: "from-green-500 to-emerald-500", IconComponent: FaRegAddressCard },
  { label: "Institutes", color: "from-yellow-500 to-orange-500", IconComponent: FaBuilding },
  { label: "Orders", color: "from-pink-500 to-rose-500", IconComponent: FaShoppingCart },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Query for dashboard summary
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
    isError: dashboardIsError,
  } = useQuery<DashboardSummary, Error>({
    queryKey: ["admin-dashboard-summary"],
    queryFn: getAdminDashboardSummary,
    retry: 3,
  });

  // Query for all orders
  const {
    data: ordersData,
    error: ordersError,
    isLoading: ordersLoading,
    isError: ordersIsError,
    status: ordersStatus,
  } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: getAllOrders,
  });

  // Show loading if either query is loading
  if (dashboardLoading || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-500">
        Loading Dashboard...
      </div>
    );
  }

  // Show error if either query failed
  if (dashboardIsError || ordersIsError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-500">
        {dashboardIsError && <p>Error loading dashboard: {dashboardError?.message}</p>}
        {ordersIsError && <p>Error loading orders: {ordersError?.message}</p>}
      </div>
    );
  }

  // Map overview items to counts and trends
  const stockData = OVERVIEW_ITEMS.map((item) => {
    let count = 0;
    let trend = "0.0%";

    switch (item.label) {
      case "New Vendors":
        count = dashboardData?.newVendors ?? 0;
        trend = dashboardData?.vendorTrend ? `${(+dashboardData.vendorTrend).toFixed(1)}%` : trend;
        break;
      case "Vendors":
        count = dashboardData?.vendors ?? 0;
        trend = dashboardData?.vendorTrend ? `${(+dashboardData.vendorTrend).toFixed(1)}%` : trend;
        break;
      case "Institutes":
        count = dashboardData?.institutes ?? 0;
        trend = dashboardData?.instituteTrend ? `${(+dashboardData.instituteTrend).toFixed(1)}%` : trend;
        break;
      case "Orders":
        count = dashboardData?.orders ?? 0;
        trend = dashboardData?.orderTrend ? `${(+dashboardData.orderTrend).toFixed(1)}%` : trend;
        break;
    }

    return {
      ...item,
      count,
      trend,
    };
  });

  // Handle card click navigation
  const handleCardClick = (label: string) => {
    switch (label) {
      case "Vendors":
        navigate("/admin/sellers");
        break;
      case "New Vendors":
        navigate("/admin/requests");
        break;
      case "Institutes":
        navigate("/admin/users");
        break;
      case "Orders":
        navigate("/admin/orders");
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Welcome back, Admin 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {stockData.map((item, index) => {
            const Icon = item.IconComponent;
            return (
              <div
                key={index}
                className={`bg-gradient-to-r ${item.color} text-white rounded-2xl p-6 shadow-lg cursor-pointer relative overflow-hidden hover:scale-105 transition-transform`}
                onClick={() => handleCardClick(item.label)}
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
                <div className="flex items-center justify-between relative z-10">
                  <Icon className="text-4xl text-white" />
                  <span className="text-4xl font-bold">{item.count}</span>
                </div>
                <p className="text-lg mt-4 font-medium">{item.label}</p>
                {/* Uncomment if you want to show trend */}
                {/* <p className="text-sm mt-2 text-white/80">{item.trend} this month</p> */}
              </div>
            );
          })}
        </div>
      </div>


        <section className="mt-8">
          <h2 className="text-center text-2xl mb-4 text-gray-800 font-semibold">Recent Orders</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <AdminMainWrapper
                    status={ordersStatus}
                    heading="All Orders"
                  >
                  {ordersData && <AdminOrderTable orders={ordersData?.orders} />}
              </AdminMainWrapper>
            </div>
        </section>          
                 
    </div>
  );
};

export default AdminDashboard;
