import { Product } from "../../Types/types";
import EquipmentProductCard from "../Product/EquipmentProductCard.tsx";

type ProductShowcaseProps = {
  status: "error" | "success" | "pending";
  title: string;
  products: Product[];
};

export default function ProductShowcase({ status, title, products }: ProductShowcaseProps) {
  const container = "w-full mb-16";
  const header = "text-2xl font-bold font-jakarta text-[#1C170D] mb-4 pl-4";

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

  // Shuffle and take up to 8 products for a more standard ecom look
  const shuffled = products.slice().sort(() => 0.5 - Math.random());
  const items = shuffled.slice(0, 10);

  return (
    <article className={container}>
      <h2 className={header}>{title}</h2>
      {items.length === 0 ? (
        <div className="h-80 flex justify-center items-center text-secondary text-lg">
          No Data Found
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div
            className="flex gap-4 pl-4 pb-2"
            style={{
              minHeight: "320px",
            }}
          >
            {items.map((product) => (
              <div
                key={product._id}
                className="min-w-[180px] sm:min-w-[220px] max-w-[240px] bg-white rounded-lg shadow hover:shadow-lg border border-gray-200 transition-all duration-200 flex-shrink-0 flex flex-col"
              >
                <EquipmentProductCard
                  product={product}
                  variant="default"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}