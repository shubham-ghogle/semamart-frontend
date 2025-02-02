import { useQuery } from "@tanstack/react-query";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import { getAllOrders } from "./Admin.HooksAndUtils";
import { FaRegAddressCard } from "react-icons/fa6";
import { IoPersonAdd } from "react-icons/io5";
import { FaBuilding } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";

const AdminDashboard = () => {
  const { data, error, status } = useQuery({
    queryKey: ["verifiedOrders"],
    queryFn: getAllOrders,
    retry: 3,
  });
  const stockData = [
    { label: "New Vendor", icon: <IoPersonAdd className="text-[2rem] m-2" /> },
    { label: "Vendor", icon: <FaRegAddressCard className="text-[2rem] m-2" /> },
    { label: "Instiute", icon: <FaBuilding className="text-[2rem] m-2" /> },
    { label: "Orders", icon: <FaShoppingCart className="text-[2rem] m-2" /> },
  ];

  return (
    <AdminMainWrapper
      heading="Dashboard"
      status={status}
      errorMeassage={error?.message}
    >
      <div className="p-10 bg-white max-w-6xl mx-auto mt-8 rounded-xl drop-shadow-md ">
        <div className="flex flex-wrap justify-around gap-4 text-center drop-shadow-md ">
          {stockData.map((item, index) => (
            <button
              key={index}
              className="bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col items-center w-40"
            >
              {item.icon}
              <span className="text-xl font-semibold text-gray-600">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </AdminMainWrapper>
  );
};

export default AdminDashboard;

