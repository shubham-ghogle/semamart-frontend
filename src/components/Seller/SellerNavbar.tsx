import { RxDashboard } from "react-icons/rx";
import { TiDocumentAdd } from "react-icons/ti";
import SidebarNavlinks from "../UI/SidebarNavlinks";
import { AiOutlineProduct } from "react-icons/ai";
import { CiDeliveryTruck } from "react-icons/ci";

export default function SellerNavbar() {
  return (
    <nav className="w-full px-6 pt-6 drop-shadow bg-white">
      <ul className="flex flex-col gap-4 w-full">
        <SidebarNavlinks
          icon={<RxDashboard />}
          to="/seller"
          end
          label="Dashboard"
        />
        <SidebarNavlinks
          icon={<TiDocumentAdd />}
          to="add-product"
          label="Add Product"
        />
        <SidebarNavlinks
          icon={<AiOutlineProduct />}
          to="products"
          label="All Products"
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
