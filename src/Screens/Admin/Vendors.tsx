import React from "react";
import {
  FaRegEye,
  FaFileInvoiceDollar,
  FaFileInvoice,
  FaFilter,
} from "react-icons/fa";
import { RiResetLeftLine } from "react-icons/ri";

const Vendors: React.FC = () => {
    const vendors = [
        {
          srNo: 1,
          name: "Rahul Kumar",
          productsCount: 10, // Example count, update accordingly
          ordersCount: 1,
          sale: "15 %",
          returns: "₹520.00", // Example return, update accordingly
          commission: "₹468.00", // Example commission (10% of revenue)
        },
        {
          srNo: 2,
          name: "Ashish Sharma",
          productsCount: 15, // Example count, update accordingly
          ordersCount: 1,
          sale: "30 %",
          returns: "₹0.00", // Example return, update accordingly
          commission: "₹603.00", // Example commission (10% of revenue)
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
        ALL Vendors
      </h1>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 mb-4 justify-center">
        <input
          type="text"
          placeholder="Search vendor"
          className="border rounded-lg p-2 w-48"
        />
        
        <button className="bg-blue-400 text-white px-4 py-2 rounded-lg flex justify-center items-center gap-2">
          
          <span>Search</span>
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
            <option className="hover:bg-grey-500">sort by</option>
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
      <table className="w-full border-collapse border border-blue-100 text-left text-sm bg-white ">
        <thead>
          <tr className=" text-darkBlue text-xl" style={{background:"#e7f9fe"}}>
            <th className="p-2 border border-darkBlue">Sr. No.</th>
            <th className="p-2 border border-darkBlue">Name</th>
            <th className="p-2 border border-darkBlue">Products (Count)</th>
            <th className="p-2 border border-darkBlue">Orders (Count)</th>
            <th className="p-2 border border-darkBlue">Sale</th>
            <th className="p-2 border border-darkBlue">Returns</th>
            <th className="p-2 border border-darkBlue">Comission</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((order,index) => (
            <tr key={index} className="">
              <td className="p-2 border border-darkBlue font-bold text-xl text-gray-500">
                 {index+1}
              </td>
              <td className="p-2 border border-darkBlue">{order.name}</td>
              <td className="p-2 border border-darkBlue">{order.productsCount}</td>
              <td className="p-2 border border-darkBlue">{order.ordersCount}</td>
              <td className="p-2 border border-darkBlue f  ">
                  {order.sale}
              </td>
              <td className="p-2 border border-darkBlue">{order.returns}</td>
              <td className="p-2 border border-darkBlue">{order.commission}</td>
              
              
              

             
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Vendors;
