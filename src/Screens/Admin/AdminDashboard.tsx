import { Link } from "react-router-dom";
import AdminMainWrapper from "../../components/Admin/AdminMainWrapper";
import { FaRegAddressCard } from "react-icons/fa6";
import { IoPersonAdd } from "react-icons/io5";
import { FaBuilding } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";

const AdminDashboard = () => {
  const stockData = [
    {
      label: "New Vendor",
      icon: <IoPersonAdd className="text-[2rem] m-2" />,
      link: "/admin/new-vendor", // specify the route
    },
    {
      label: "Vendor",
      icon: <FaRegAddressCard className="text-[2rem] m-2" />,
      link: "/admin/sellers",
    },
    {
      label: "Institute",
      icon: <FaBuilding className="text-[2rem] m-2" />,
      link: "/admin/users",
    },
    {
      label: "Orders",
      icon: <FaShoppingCart className="text-[2rem] m-2" />,
      link: "/admin/orders",
    },
  ];

  return (
    <AdminMainWrapper
      heading="Dashboard"
      status="success"
      errorMeassage="Error"
    >
      <div className="p-10 bg-white max-w-6xl mx-auto mt-8 rounded-xl drop-shadow-md ">
        <div className="flex flex-wrap justify-around gap-4 text-center drop-shadow-md ">
          {stockData.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-gray-100 p-4 rounded-lg shadow-xs flex flex-col items-center w-40 hover:bg-gray-200 transition"
            >
              {item.icon}
              <span className="text-xl font-semibold text-gray-600">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AdminMainWrapper>
  );
};

export default AdminDashboard;
