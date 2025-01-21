import { RxDashboard } from "react-icons/rx";
import { GrWorkshop } from "react-icons/gr";
import { TiDocumentAdd } from "react-icons/ti";
import SidebarNavlinks from "../UI/SidebarNavlinks";

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
          icon={<GrWorkshop />}
          to="products"
          label="All Products"
        />
      </ul>
    </nav>
  );
}
