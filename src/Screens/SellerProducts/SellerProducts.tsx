// src/Screens/SellerProducts/SellerProducts.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BestSellerShowcase from "../../components/Homepage/BestSellerShowcase";
import { GiCrown } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import { fetchShopInfo, getProductsByShop } from "./SellerProducts.hooks";
import { Product } from "@/Types/types";
import CategoryNav, { Category as CategoryType } from "./CategoryNav";

type BestSellerStatus = "pending" | "error" | "success";

type ShopPayload = {
  success: boolean;
  shop?: {
    _id?: string;
    businessName?: string;
    banner?: string;
    profilePic?: string;
  };
};

export default function SellerProducts(): JSX.Element {
  const { shopId } = useParams<{ shopId?: string }>();
  const navigate = useNavigate();

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsFetchError,
  } = useQuery<Product[], Error>({
    queryKey: ["products", "shop", shopId],
    queryFn: async () => getProductsByShop(shopId ?? ""),
    enabled: !!shopId,
    staleTime: Infinity,
  });

  const {
    data: shopData,
    isLoading: shopLoading,
    isError: shopError,
    error: shopFetchError,
  } = useQuery<ShopPayload, Error>({
    queryKey: ["shop", shopId],
    queryFn: async () => fetchShopInfo(shopId ?? ""),
    enabled: !!shopId,
    staleTime: Infinity,
  });

  // New: fetch orders for this shop (uses the backend route you provided)
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersFetchError,
  } = useQuery<{ success: boolean; orders: any[] }, Error>({
    queryKey: ["shopOrders", shopId],
    queryFn: async () => {
      if (!shopId) return { success: false, orders: [] };
      const res = await fetch(`/api/v2/order/get-seller-all-orders/${encodeURIComponent(shopId)}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!shopId,
    staleTime: Infinity,
  });

  const status: BestSellerStatus = productsLoading ? "pending" : productsError ? "error" : "success";

  const bannerSrc =
    shopData?.shop?.banner && shopData.shop.banner.length > 0
      ? shopData.shop.banner
      : "/banner_Consumables.png";

  const shopName = shopData?.shop?.businessName ?? "Shop";

  // ---- demo categories array (replace with real data or fetch categories from API) ----
  const categories: CategoryType[] = [
    { id: "c1", name: "Home", slug: "/shop/home" },
    {
      id: "c2",
      name: "What's New",
      slug: "/shop/whats-new",
      subcategories: [
        { id: "c2s1", name: "All Models", slug: "/shop/whats-new/all" },
        { id: "c2s2", name: "New Arrivals", slug: "/shop/whats-new/arrivals" },
      ],
    },
    { id: "c3", name: "Shop Deals", slug: "/shop/deals" },
    {
      id: "c4",
      name: "iPhone",
      slug: "/shop/iphone",
      subcategories: [
        { id: "c4s1", name: "iPhone 15", slug: "/shop/iphone/15" },
        { id: "c4s2", name: "Cases", slug: "/shop/iphone/cases" },
      ],
    },
    { id: "c5", name: "iPad", slug: "/shop/ipad" },
    { id: "c6", name: "Apple Watch", slug: "/shop/watch" },
    { id: "c7", name: "AirPods", slug: "/shop/airpods" },
    { id: "c8", name: "Mac Laptops", slug: "/shop/mac-laptops" },
    { id: "c9", name: "Accessories", slug: "/shop/accessories" },
  ];
  // -------------------------------------------------------

  // onSearch handler: navigate to search route with q + shopId as query params
  const handleSearch = (q: string) => {
    if (!shopId) return;
    navigate(`/shop/${encodeURIComponent(shopId)}/search?q=${encodeURIComponent(q)}&shopId=${encodeURIComponent(shopId)}`);
  };

  // Derived counts + hardcoded rating for now
  const productsCount = Array.isArray(products) ? products.length : 0;
  const ordersCount = ordersData?.orders ? ordersData.orders.length : 0;
  const rating = 4.3; // hardcoded for now, will be replaced by API later

  const renderStars = (value: number) => {
    const full = Math.floor(value);
    const max = 5;
    const stars = [] as JSX.Element[];
    for (let i = 0; i < max; i++) {
      stars.push(
        <span key={i} className={`text-sm ${i < full ? "text-yellow-500" : "text-gray-300"}`}>
          ★
        </span>
      );
    }
    return <span className="inline-flex items-center">{stars}</span>;
  };

  return (
    <section className="max-w-[1460px] mx-auto bg-gray-100">
      {/* Shop name above banner - reduced top padding and tighter heading */}
      <div className="w-full text-center pt-2 pb-1 mt-10">
        <h1 className="text-4xl md:text-5xl lg:text-5xl font-semibold text-black leading-tight">{shopName}</h1>

        {/* quick stats row */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="bg-white shadow rounded-md px-4 py-2 flex flex-col items-center">
            <span className="text-xs text-gray-500">Products</span>
            <span className="text-lg font-medium text-gray-900">{productsLoading ? "..." : productsCount}</span>
          </div>

          <div className="bg-white shadow rounded-md px-4 py-2 flex flex-col items-center">
            <span className="text-xs text-gray-500">Orders</span>
            <span className="text-lg font-medium text-gray-900">{ordersLoading ? "..." : ordersCount}</span>
          </div>

          <div className="bg-white shadow rounded-md px-4 py-2 flex flex-col items-center">
            <span className="text-xs text-gray-500">Ratings</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-gray-900">{rating.toFixed(1)}</span>
              {renderStars(rating)}
            </div>
          </div>
        </div>
      </div>

      {/* Category navigation: pulled up slightly to reduce gap between name and bar */}
      <div className="-mt-2">
        <CategoryNav categories={categories} maxVisible={8} onSearch={handleSearch} />
      </div>

      {/* Top image banner */}
      <div className="w-full">
        <div className="w-full h-[28vh] sm:h-[36vh] md:h-[44vh] lg:h-[60vh] xl:h-[72vh] 2xl:h-[92vh] overflow-hidden">
          <img
            src={bannerSrc}
            alt={`${shopName} banner`}
            className="w-full h-full object-cover object-top sm:object-center"
            loading="lazy"
          />
        </div>
      </div>

      <div className="w-full px-6 pt-8 space-y-12 mx-auto">
        <div id="shop-products" />

        <BestSellerShowcase
          products={products}
          status={status}
          title="Shop Products"
          badgeText="From this seller"
          subText="Products listed by this shop — newest first"
          icon={<GiCrown className="text-[#3B0B68]" size={18} />}
          bgFrom="#2a0450"
          bgTo="#39104f"
          iconBg="#fbbf24"
          accentBg="#ec4899"
          textColor="#fff"
          maxItems={12}
        />

        <div id="top-equipment" />
        <BestSellerShowcase
          products={products}
          status={status}
          title="Top Equipment"
          badgeText="Limited stock"
          subText="Picked by pros."
          icon={<FaShippingFast size={18} />}
          bgFrom="#0ea5e9"
          bgTo="#0369a1"
          iconBg="#ffffff"
          accentBg="#06b6d4"
          textColor="#04263a"
          maxItems={8}
        />

        {(productsLoading || shopLoading || ordersLoading) && (
          <div className="text-sm text-gray-600">Loading…</div>
        )}

        {productsError && (
          <div className="text-sm text-red-600">Error loading products: {productsFetchError?.message ?? "Unknown error"}</div>
        )}

        {shopError && (
          <div className="text-sm text-red-600">Error loading shop info: {shopFetchError?.message ?? "Unknown error"}</div>
        )}

        {ordersError && (
          <div className="text-sm text-red-600">Error loading orders: {ordersFetchError?.message ?? "Unknown error"}</div>
        )}
      </div>
    </section>
  );
}
