import { RxDashboard } from "react-icons/rx";
// import { GrWorkshop } from "react-icons/gr";
import { TiDocumentAdd } from "react-icons/ti";
import SidebarNavlinks from "../UI/SidebarNavlinks";
import { FaRegAddressBook } from "react-icons/fa";

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
        <SidebarNavlinks icon={<TiDocumentAdd />} to="nina" label="Test" />
        {/* <SidebarNavlinks */}
        {/*   icon={<GrWorkshop />} */}
        {/*   to="products" */}
        {/*   label="All Products" */}
        {/* /> */}
      </ul>
    </nav>
  );
}
