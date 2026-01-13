import { Outlet } from "react-router-dom";
import SellerHeader from "../Seller/SellerHeader";
import SellerNavbar from "../Seller/SellerNavbar";

export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader />
      <SellerNavbar />

      {/* main content - on md+ we make room for the fixed sidebar using CSS variable */}
      <main className="min-h-[calc(100vh-120px)] transition-all duration-200">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Outlet />
        </div>
      </main>

      <style>{`
        /* apply left padding for the fixed sidebar on md+ so content is not covered */
        @media (min-width: 768px) {
          main {
            padding-left: var(--seller-sidebar-width, 250px);
          }
        }
      `}</style>
    </div>
  );
}
