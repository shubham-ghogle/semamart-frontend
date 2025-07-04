// src/components/Homepage/ProductShowcase.tsx

import { useQueryClient } from "@tanstack/react-query";
import { Product } from "../../Types/types";
import EquipmentProductCard from "../Product/EquipmentProductCard";

type ProductShowcaseProps = {
  status: "error" | "success" | "pending";
  title: string;
};

export default function ProductShowcase({
  status,
  title,
}: ProductShowcaseProps) {
  const qc = useQueryClient();
  const all = qc.getQueryData<Product[]>(["products"]) || [];
  const sorted = all.slice().sort((a, b) => b.sold_out - a.sold_out);
  const isBest = title.toLowerCase().startsWith("best seller");
  const items = sorted.slice(0, isBest ? 6 : 4);

  const container = "mx-4 md:mx-12 mb-16";
  const header    = "text-2xl font-bold font-jakarta text-[#1C170D] mb-4";

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

  return (
    <article className={container}>
      <h2 className={header}>{title}</h2>

      {isBest ? (
        <div className="grid grid-cols-4 gap-1">
          {/* 1) Wide: spans cols 1–2, row 1 */}
          <div className="col-span-2 row-start-1">
            <EquipmentProductCard
              product={items[0]}
              variant="wide"
              key={items[0]._id}
            />
          </div>

          {/* 2) Tall: col 3, spans both rows */}
          <div className="col-start-3 row-span-2">
            <EquipmentProductCard
              product={items[1]}
              variant="tall"
              key={items[1]._id}
            />
          </div>

          {/* 3) Square: col 4, row 1 */}
          <div className="col-start-4 row-start-1">
            <EquipmentProductCard
              product={items[2]}
              variant="square"
              key={items[2]._id}
            />
          </div>

          {/* 4) Square: col 1, row 2 */}
          <div className="col-start-1 row-start-2">
            <EquipmentProductCard
              product={items[3]}
              variant="square"
              key={items[3]._id}
            />
          </div>

          {/* 5) Square: col 2, row 2 */}
          <div className="col-start-2 row-start-2">
            <EquipmentProductCard
              product={items[4]}
              variant="square"
              key={items[4]._id}
            />
          </div>

          {/* 6) Square: col 4, row 2 */}
          <div className="col-start-4 row-start-2">
            <EquipmentProductCard
              product={items[5]}
              variant="square"
              key={items[5]._id}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {items.map((p) => (
            <EquipmentProductCard
              key={p._id}
              product={p}
              variant="default"
            />
          ))}
        </div>
      )}
    </article>
  );
}
