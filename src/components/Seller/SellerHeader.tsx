// src/components/Seller/SellerHeader.tsx
import { Link } from "react-router-dom";
import { useSellerStore } from "../../store/sellerStore";

export default function SellerHeader() {
  const { seller } = useSellerStore((state) => state);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 left-0 z-30 px-4">
      <div className="container mx-auto h-[80px] flex items-center justify-between">
        <div>
          <Link to="/">
            <img src="/logo.png" alt="brand-logo" width={250} />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Removed avatar image as requested — only show seller/business name */}
          <Link to="/seller" className="inline-flex items-center gap-3">
            <div className="hidden sm:block text-sm text-gray-700">
              {seller?.businessName}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
