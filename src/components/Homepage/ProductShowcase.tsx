// src/components/Homepage/ProductShowcase.tsx

// import { useQueryClient } from "@tanstack/react-query";
import { Product } from "../../Types/types";
import EquipmentProductCard from "../Product/EquipmentProductCard";

type ProductShowcaseProps = {
  status: "error" | "success" | "pending";
  title: string;
  products: Product[];
};


export default function ProductShowcase({ status, title, products }: ProductShowcaseProps) {
  const container = "mx-4 md:mx-12 mb-16";
  const header = "text-2xl font-bold font-jakarta text-[#1C170D] mb-4";

  if (status === "pending") {
    return (
      <article className={container}>
        <h2 className={header}>{title}</h2>
        <div className="h-80 text-xl grid place-items-center">Loading…</div>
      </article>
    );
  }

  if (status === "error") {
    return (
      <article className={container}>
        <h2 className={header}>{title}</h2>
        <div className="h-80 text-red-500 grid place-items-center">
          Failed to load products.
        </div>
      </article>
    );
  }

  // Sort and take top 4 by sold_out
  const sorted = products.slice().sort((a, b) => b.sold_out - a.sold_out);
  const items = sorted.slice(0, 4);

  return (
    <article className={container}>
      <h2 className={header}>{title}</h2>
      {items.length === 0 ? (
        <div className="h-80 d-flex justify-content-center align-items-center text-secondary fs-4">
          No Data Found
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {items.map((product) => (
            <EquipmentProductCard
              key={product._id}
              product={product}
              variant="default"
            />
          ))}
        </div>
      )}
    </article>
  );
}