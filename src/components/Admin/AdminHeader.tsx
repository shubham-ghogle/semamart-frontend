"use client";
import { Link, useNavigate } from "react-router";
import { CiMoneyBill } from "react-icons/ci";
import { GrWorkshop } from "react-icons/gr";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useUserStore } from "../../store/userStore";

export default function AdminHeader() {
  const user = useUserStore((state) => state.user);
  const removeUser = useUserStore((state) => state.removeUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    removeUser(); // clears user + localStorage
    navigate("/admin-login"); // redirect back to login
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 left-0 z-30 px-4">
      <div className="container mx-auto h-[80px] flex items-center justify-between">
        {/* Logo */}
        <div>
          <Link to="/admin">
            <img src="/logo.svg" alt="brand-logo" width={250} />
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <Link to="/admin-withdraw-request" className="800px:block hidden">
              <CiMoneyBill
                color="#555"
                size={30}
                className="mx-5 cursor-pointer"
              />
            </Link>
            <Link to="/admin-events" className="800px:block hidden">
              <MdOutlineLocalOffer
                color="#555"
                size={30}
                className="mx-5 cursor-pointer"
              />
            </Link>
            <Link to="/admin-sellers" className="800px:block hidden">
              <GrWorkshop
                color="#555"
                size={30}
                className="mx-5 cursor-pointer"
              />
            </Link>

            {/* Avatar */}
            <img
              src={
                user?.avatar
                  ? `/baseUrl/${user.avatar}`
                  : "/placeholder.png"
              }
              width={40}
              alt="admin avatar"
              className="w-[50px] h-[50px] rounded-full object-cover"
            />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-[#1C647C] hover:bg-[#14506A] text-white text-sm font-semibold rounded-md transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
