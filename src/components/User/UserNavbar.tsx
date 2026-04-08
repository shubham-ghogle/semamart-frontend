import { RxDashboard } from "react-icons/rx";
import SidebarNavlinks from "../UIComponents/SidebarNavlinks";
import { FaRegAddressBook } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { CiDeliveryTruck } from "react-icons/ci";
import { LuMessageSquare } from "react-icons/lu";
import { FiPhoneCall } from "react-icons/fi";
import { useUserStore } from "@/store/userStore";
import { isSubAccount } from "@/lib/utils";

export default function UserNavbar() {
  const user = useUserStore((state) => state.user);
  const canManageMembers = !!user && !isSubAccount(user);

  return (
    <nav className="w-full h-full px-6 pt-6 drop-shadow-sm bg-white flex flex-col">
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
        {canManageMembers && (
          <SidebarNavlinks
            icon={<FaUsers />}
            to="members"
            label="Members"
          />
        )}
        <SidebarNavlinks
          icon={<LuMessageSquare />}
          to="support"
          label="Support"
        />
      </ul>
      <ul className="mt-auto pb-6 w-full">
        <SidebarNavlinks
          icon={<FiPhoneCall />}
          to="contact-us"
          label="Contact Us"
        />
      </ul>
    </nav>
  );
}
