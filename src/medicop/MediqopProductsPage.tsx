import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ProductCard from "@/components/Homepage/ProductCard";
import { Product } from "@/Types/types";
import { MEDICOP_SHOWCASE_PRODUCTS } from "./data";

function getPageTitle(searchParams: URLSearchParams) {
  const department = searchParams.get("department");
  const speciality = searchParams.get("speciality");
  const packageType = searchParams.get("packageType");

  if (packageType) return packageType;
  if (speciality) return speciality;
  if (department) return department;
  return "All Products";
}

export default function MediqopProductsPage() {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const pageTitle = getPageTitle(searchParams);
  const products = MEDICOP_SHOWCASE_PRODUCTS as unknown as Product[];

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      product.name.toLowerCase().includes(term) ||
      String((product as any).category || "")
        .toLowerCase()
        .includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-[28px] border border-[#d9e7ec] bg-white p-5 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1C647C]">
                Mediqop Catalog
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#123d4d] md:text-3xl">
                {pageTitle}
              </h1>
            </div>

            <div className="w-full md:max-w-sm">
              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-[#d1dde2] px-4 py-3 text-sm text-[#123d4d] outline-none transition focus:border-[#1C647C]"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                mode="medicop"
              />
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <p className="mt-10 text-center text-base text-gray-500">
              No products found.
            </p>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}
