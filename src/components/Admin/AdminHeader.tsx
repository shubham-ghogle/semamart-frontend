import { Link } from "react-router";
import { CiMoneyBill } from "react-icons/ci";
import { GrWorkshop } from "react-icons/gr";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useUserStore } from "../../store/userStore";

export default function AdminHeader() {
  const user = useUserStore((state) => state.user);

  return (
    <header className="w-full bg-white shadow sticky top-0 left-0 z-30  px-4">
      <div className="container mx-auto h-[80px]  flex items-center justify-between">
        <div>
          <Link to="/">
            <img src="/logo.svg" alt="brand-logo" width={250} />
          </Link>
        </div>
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
            <img
              src={
                user && user.avatar
                  ? "/baseUrl" + "/" + user.avatar
                  : "/placeholder.png"
              }
              width={40}
              alt="admin avatar"
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
