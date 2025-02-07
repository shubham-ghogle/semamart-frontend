import { FaRegAddressCard } from "react-icons/fa6";
import { IoPersonAdd } from "react-icons/io5";
import { FaBuilding } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const stockData = [
    { label: "New Vendor", icon: <IoPersonAdd className="text-[2rem] m-2" />, path: "/new-vendor" },
    { label: "Vendor", icon: <FaRegAddressCard className="text-[2rem] m-2" />, path: "/admin/vendors" },
    { label: "Institute", icon: <FaBuilding className="text-[2rem] m-2" />, path: "/admin/institutes" },
    { label: "Orders", icon: <FaShoppingCart className="text-[2rem] m-2" />, path: "/admin/orders" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-center text-3xl mb-8 text-darkBlue font-bold">
        ALL Vendors
      </h1>
      <div className="p-10 bg-white max-w-6xl mx-auto mt-8 rounded-xl drop-shadow-md">
        <div className="flex flex-wrap justify-around gap-4 text-center drop-shadow-md">
          {stockData.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)} // Navigate on click
              className="bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col items-center w-40 cursor-pointer hover:bg-gray-200 transition"
            >
              {item.icon}
              <span className="text-xl font-semibold text-gray-600">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
