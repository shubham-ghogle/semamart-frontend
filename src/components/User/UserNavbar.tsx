import { RxDashboard } from "react-icons/rx";
import SidebarNavlinks from "../UI/SidebarNavlinks";
import { FaRegAddressBook } from "react-icons/fa";
import { CiDeliveryTruck } from "react-icons/ci";

export default function UserNavbar() {
  return (
    <nav className="w-full px-6 pt-6 drop-shadow bg-white">
      <ul className="flex flex-col gap-4 w-full">
        <SidebarNavlinks
          icon={<RxDashboard />}
          to="/user"
          end
          label="Profile"
        />
        <SidebarNavlinks icon={<FaRegAddressBook />}
          to="address"
          label="Address"
        />
        <SidebarNavlinks
          icon={<CiDeliveryTruck />}
          to="orders"
          label="All Orders"
        />
      </ul>
    </nav>
  );
}
