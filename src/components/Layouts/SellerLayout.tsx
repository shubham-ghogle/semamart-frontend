import { Outlet } from "react-router-dom";
import SellerHeader from "../Seller/SellerHeader";
import SellerNavbar from "../Seller/SellerNavbar";

export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader />
      <SellerNavbar />

      {/* main content - on md+ we make room for the fixed sidebar using CSS variable */}
      <main className="transition-all duration-200 overflow-y-auto" style={{ minHeight: "calc(100vh - var(--seller-header-height, 80px))" }}>
        <div className="px-4 md:px-6 py-8 w-full">
          <Outlet />
        </div>

        <style>{`
          /* apply left padding for the fixed sidebar on md+ so content is not covered */
          @media (min-width: 768px) {
            main > div {
              padding-left: calc(var(--seller-sidebar-width, 250px) + 1rem);
            }
          }
        `}</style>
      </main>
    </div>
  );
}
