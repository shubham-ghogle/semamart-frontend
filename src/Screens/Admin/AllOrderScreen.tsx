import React from "react";
import {
  FaRegEye,
  FaFileInvoiceDollar,
  FaFileInvoice,
  FaFilter,
} from "react-icons/fa";
import { RiResetLeftLine } from "react-icons/ri";

const OrderManagement: React.FC = () => {
  const orders = [
    {
      id: 4781,
      total: "₹5,200.00",
      revenue: "₹4,680.0000",
      status: "Failed",
      customer: "Rahul kumar",
      date: "December 28, 2023",
      address:"rajasthan india"
    },
    {
      id: 4743,
      total: "₹6,700.00",
      revenue: "₹6,030.0000",
      status: "Completed",
      customer: "ashish sharma",
      date: "November 17, 2023",
      address:"rajasthan india"
    },
    
  ];

  const statusColors: Record<string, string> = {
    Failed: "text-red-500 bg-red-100",
    // Cancelled: "text-gray-500 bg-gray-100",
    Completed: "text-green-500 bg-green-100",
    // Processing: "text-blue-500 bg-blue-100",
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-3xl mb-8 text-darkBlue font-bold">
        ALL Orders
      </h1>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 mb-4 justify-center ">
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
          <FaFilter />
          <span>Filter</span>
        </button>
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex justify-center items-center gap-2">
          <RiResetLeftLine />
          <span>Reset</span>
        </button>
      </div>

      {/* Export Section */}

      {/* Bulk Actions */}
      <div className="flex items-center gap-2 mb-4 justify-between max-w-6xl mx-auto">
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
      <div className="p-6 bg-white max-w-6xl mx-auto rounded-xl drop-shadow-md">
      <table className="w-full border-collapse border border-darkBlue text-left text-sm bg-white ">
        <thead>
          <tr className=" text-darkBlue text-xl" style={{background:"#e7f9fe"}}>
            <th className="p-2 border border-darkBlue">Sr. No.</th>
            <th className="p-2 border border-darkBlue">Date</th>
            <th className="p-2 border border-darkBlue">Product</th>
            <th className="p-2 border border-darkBlue">Price</th>
            <th className="p-2 border border-darkBlue">Shipping Address</th>
            
            
            <th className="p-2 border border-darkBlue">Vendor</th>
            <th className="p-2 border border-darkBlue">Payment</th>

            <th className="p-2 border border-darkBlue">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order,index) => (
            <tr key={index} className="">
              <td className="p-2 border border-darkBlue font-bold text-xl text-gray-500">
                 {index+1}
              </td>
              <td className="p-2 border border-darkBlue">{order.date}</td>
              <td className="p-2 border border-darkBlue font-bold text-xl text-gray-500">
                 Order {order.id}
              </td>
              <td className="p-2 border border-darkBlue">{order.total}</td>
              <td className="p-2 border border-darkBlue">{order.address}</td>
              <td className="p-2 border border-darkBlue">{order.customer}</td>
              <td className={`p-2 border border-darkBlue `}>
                <span
                  className={`${
                    statusColors[order.status]
                  } p-1 rounded-lg text-center `}
                >
                  {order.status}
                </span>
              </td>
              

              <td className="p-2 border border-darkBlue flex gap-2">
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
    </div>
  );
};

export default OrderManagement;
