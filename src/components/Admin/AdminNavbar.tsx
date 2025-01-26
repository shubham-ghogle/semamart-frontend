import { RxDashboard } from "react-icons/rx";
import { LuMessageSquare } from "react-icons/lu";
import { GrWorkshop } from "react-icons/gr";
import SidebarNavlinks from "../UI/SidebarNavlinks";

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
          icon={<LuMessageSquare />}
          to="requests"
          label="Requests"
        />
        <SidebarNavlinks
          icon={<GrWorkshop />}
          to="sellers"
          label="All Sellers"
        />
      </ul>
    </nav>
  );
}
