import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"; // <== import this
import { getAdminDashboardSummary, DashboardSummary } from "./Admin.HooksAndUtils";
import { FaRegAddressCard, FaBuilding, FaShoppingCart } from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

const RANGE_OPTIONS = ["Last 6 Months", "This Year", "All Time"] as const;
type RangeOption = typeof RANGE_OPTIONS[number];

const OVERVIEW_ITEMS = [
  { label: "New Vendors", color: "from-blue-500 to-indigo-500", IconComponent: IoPersonAdd },
  { label: "Vendors", color: "from-green-500 to-emerald-500", IconComponent: FaRegAddressCard },
  { label: "Institutes", color: "from-yellow-500 to-orange-500", IconComponent: FaBuilding },
  { label: "Orders", color: "from-pink-500 to-rose-500", IconComponent: FaShoppingCart },
];

const AdminDashboard = () => {
  const navigate = useNavigate(); // <== initialize navigate

  const { data, error, isLoading, isError } = useQuery<DashboardSummary, Error>({
    queryKey: ["admin-dashboard-summary"],
    queryFn: getAdminDashboardSummary,
    retry: 3,
  });

  const [selectedRange, setSelectedRange] = useState<RangeOption>("Last 6 Months");

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-500">
        Loading Dashboard...
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error?.message}
      </div>
    );

  const stockData = OVERVIEW_ITEMS.map((item) => {
    let count = 0;
    let trend = "0.0%";

    switch (item.label) {
      case "New Vendors":
        count = data?.newVendors ?? 0;
        trend = data?.vendorTrend ? `${(+data.vendorTrend).toFixed(1)}%` : trend;
        break;
      case "Vendors":
        count = data?.vendors ?? 0;
        trend = data?.vendorTrend ? `${(+data.vendorTrend).toFixed(1)}%` : trend;
        break;
      case "Institutes":
        count = data?.institutes ?? 0;
        trend = data?.instituteTrend ? `${(+data.instituteTrend).toFixed(1)}%` : trend;
        break;
      case "Orders":
        count = data?.orders ?? 0;
        trend = data?.orderTrend ? `${(+data.orderTrend).toFixed(1)}%` : trend;
        break;
    }

    return {
      ...item,
      count,
      trend,
    };
  });

  // Handle card clicks
  const handleCardClick = (label: string) => {
    switch (label) {
      case "Vendors":
      case "New Vendors": // if you want same route for both
        navigate("/admin/sellers");
        break;
      case "Institutes":
        navigate("/admin/users");
        break;
      case "Orders":
        navigate("/admin/orders");
        break;
      default:
        // no redirect
        break;
    }
  };

  const allOrdersData = data?.monthlyOrders ?? [];

  const filteredChartData = (() => {
    switch (selectedRange) {
      case "Last 6 Months":
        return allOrdersData.slice(-6);
      case "This Year":
        return allOrdersData;
      case "All Time":
        return [
          ...allOrdersData,
        ];
      default:
        return allOrdersData;
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Welcome back, Admin 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Overview
        </h2> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stockData.map((item, index) => {
            const Icon = item.IconComponent;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`bg-gradient-to-r ${item.color} text-white rounded-2xl p-6 shadow-lg cursor-pointer relative overflow-hidden`}
                onClick={() => handleCardClick(item.label)} // <== here!
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
                <div className="flex items-center justify-between relative z-10">
                  <Icon className="text-4xl text-white" />
                  <span className="text-4xl font-bold">{item.count}</span>
                </div>
                <p className="text-lg mt-4 font-medium">{item.label}</p>
                <p className="text-sm mt-2 text-white/80">{item.trend} this month</p>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Monthly Orders Overview
            </h3>

            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as RangeOption)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none"
            >
              {RANGE_OPTIONS.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <motion.div
            key={selectedRange}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
