import { RxDashboard } from "react-icons/rx";
import { LuMessageSquare } from "react-icons/lu";
import { GrWorkshop } from "react-icons/gr";
import SidebarNavlinks from "../UI/SidebarNavlinks";
import { IoIosPeople } from "react-icons/io";
import { PiBuildingsFill } from "react-icons/pi";
export default function AdminNavbar() {
  return (
    <nav className="w-full px-6 pt-6 drop-shadow bg-white">
      <ul className="flex flex-col gap-4 w-full">
        <SidebarNavlinks
          icon={<RxDashboard />}
          to="/admin"
          end
          label="Dashboard"
        />
         <SidebarNavlinks
          icon={<GrWorkshop />}
          to="orders"
          label="All Orders"
        />
        <SidebarNavlinks
          icon={<IoIosPeople />}
          to="vendors"
          label="All Vendors"
        />
        <SidebarNavlinks
          icon={<PiBuildingsFill />}
          to="institutes"
          label="All Institutes"
        />
        <SidebarNavlinks
          icon={<LuMessageSquare />}
          to="requests"
          label="Requests"
        />

        <SidebarNavlinks
          icon={<GrWorkshop />}
          to="sellers"
          label="All Sellers"
        />
        <SidebarNavlinks
          icon={<GrWorkshop />}
          to="users"
          label="All USrrs"
        />
      </ul>
    </nav>
  );
}
