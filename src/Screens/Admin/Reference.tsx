import React from "react";
import { FaRegEye, FaFileInvoiceDollar, FaFileInvoice,FaFilter } from "react-icons/fa";
import { RiResetLeftLine } from "react-icons/ri";


const OrderManagement: React.FC = () => {
  const orders = [
    {
      id: 4781,
      total: "₹5,200.00",
      revenue: "₹4,680.0000",
      status: "Failed",
      customer: "demo1 we",
      date: "December 28, 2023",
    },
    {
      id: 4743,
      total: "₹6,700.00",
      revenue: "₹6,030.0000",
      status: "Cancelled",
      customer: "ashish sharma",
      date: "November 17, 2023",
    },
    {
      id: 4587,
      total: "₹5,200.00",
      revenue: "₹4,680.0000",
      status: "Cancelled",
      customer: "demo1 we",
      date: "November 3, 2023",
    },
    {
      id: 4581,
      total: "₹5,000.00",
      revenue: "₹4,500.0000",
      status: "Failed",
      customer: "demo1 we",
      date: "November 2, 2023",
    },
    {
      id: 3649,
      total: "₹5,400.00",
      revenue: "₹4,860.0000",
      status: "Completed",
      customer: "demo1 we",
      date: "October 3, 2023",
    },
    {
      id: 3603,
      total: "₹7,600.00",
      revenue: "₹6,840.0000",
      status: "Processing",
      customer: "Test Test",
      date: "October 3, 2023",
    },
    {
      id: 3514,
      total: "₹7,600.00",
      revenue: "₹6,840.0000",
      status: "Processing",
      customer: "demo1 we",
      date: "October 2, 2023",
    },
    {
      id: 3512,
      total: "₹7,300.00",
      revenue: "₹6,570.0000",
      status: "Processing",
      customer: "demo1 we",
      date: "October 2, 2023",
    },
  ];

  const statusColors: Record<string, string> = {
    Failed: "text-red-500 bg-red-100",
    Cancelled: "text-gray-500 bg-gray-100",
    Completed: "text-green-500 bg-green-100",
    Processing: "text-blue-500 bg-blue-100",
  };

  return (
    <div className="p-4">
       <h1 className="text-center text-3xl mb-8 text-darkBlue font-bold">
        ALL Orders
      </h1>
      <span className="text-xs text-gray-700">All (8) | Pending payment (0) | Processing (3) | On hold (0) | Completed (1) | Cancelled (2) | Refunded (0) | Failed (2) | On Pre Ordered (0)</span>
      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 mb-4 justify-center">
        <input
          type="text"
          placeholder="Filter by registration"
          className="border rounded-lg p-2 w-48"
        />
        <input
          type="text"
          placeholder="Search Orders"
          className="border rounded-lg p-2 w-48"
        />
        <input type="date" className="border rounded-lg p-2 w-48" />
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex justify-center items-center gap-2">
        <FaFilter /><span>Filter</span>
        </button>
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex justify-center items-center gap-2">
          <RiResetLeftLine />
          <span>Reset</span>
        </button>
      </div>

      {/* Export Section */}

      {/* Bulk Actions */}
      <div className="flex items-center gap-2 mb-4 justify-between ">
        <div className="flex items-center gap-2 justify-between">
          <select className="border rounded-lg p-2">
            <option className="hover:bg-grey-500">Bulk Actions</option>
          </select>
          <button className="hover:bg-orange-500 text-white px-4 py-2 rounded-lg bg-yellow-500">
            Apply
          </button>
        </div>
        <div className="flex justify-end gap-2 ">
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-orange-500">
            Export All
          </button>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-orange-500">
            Export Filtered
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <table className="w-full border-collapse border border-blue-100 text-left text-sm bg-white">
        <thead>
          <tr className="bg-blue-100 text-xl">
            <th className="p-2 border border-blue-200">Order</th>
            <th className="p-2 border border-blue-200">Order Total</th>
            <th className="p-2 border border-blue-200">Revenue</th>
            <th className="p-2 border border-blue-200">Status</th>
            <th className="p-2 border border-blue-200">Customer</th>
            <th className="p-2 border border-blue-200">Date</th>
            <th className="p-2 border border-blue-200">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-blue-50">
              <td className="p-2 border border-blue-200 font-bold text-xl text-gray-500">
                Order {order.id}
              </td>
              <td className="p-2 border border-blue-200">{order.total}</td>
              <td className="p-2 border border-blue-200">{order.revenue}</td>
              <td className={`p-2 border border-blue-200 `}>
                <span
                  className={`${
                    statusColors[order.status]
                  } p-1 rounded-lg text-center`}
                >
                  {order.status}
                </span>
              </td>
              <td className="p-2 border border-blue-200">{order.customer}</td>
              <td className="p-2 border border-blue-200">{order.date}</td>
              <td className="p-2 border border-blue-200 flex gap-2">
                <button className="text-blue-500 text-xl">
                  <FaRegEye />
                </button>
                <button className="text-yellow-500 text-xl">
                  <FaFileInvoiceDollar />
                </button>
                <button className="text-red-500 text-xl">
                  <FaFileInvoice />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderManagement;
