import { Product } from "../../Types/types";

type ProductPriceProps = {
  product: Product;
  /** optional: override GST rate (default 18%) */
  gstRate?: number;
};

export default function ProductPrice({
  product,
  gstRate = 0.18,
}: ProductPriceProps) {
  const firstVariant = product?.variants?.[0];

  // If no variant available, show graceful fallback
  if (!firstVariant) {
    return (
      <div className="font-Roboto text-slate-700">
        <p className="text-sm text-dark-blue">Price: N/A</p>
      </div>
    );
  }

  const original = firstVariant.originalPrice ?? 0;
  const discount = firstVariant.discountPrice ?? null;

  // Use discounted price if present, otherwise original
  const priceExclGst = discount ?? original;
  const priceInclGst = +(priceExclGst * (1 + gstRate)).toFixed(2);

  const discountPct =
    discount && original > 0 ? Math.floor(((original - discount) / original) * 100) : 0;

  return (
    <>
      {/* show original as line-through if discount exists */}
      {original > 0 && discount ? (
        <p className="font-Roboto text-slate-600 pl-[76px] text-sm mb-1">
          Price:
          <span className="line-through pl-4 text-lg">₹{original}</span>
        </p>
      ) : null}

      <section className="font-Roboto text-slate-700 flex gap-4">
        <p className="mt-1 text-sm text-dark-blue font-semibold">
          {discount ? "Discounted Price:" : "Price:"}
        </p>

        <article>
          <p className="text-3xl text-red-600">
            ₹{priceExclGst} <span className="text-lg">excl. GST</span>
            {discountPct > 0 && (
              <span className="ml-2 text-sm text-green-600">-{discountPct}%</span>
            )}
          </p>

          <p className="text-2xl text-red-600">
            ₹{priceInclGst} <span className="text-sm">incl. GST</span>
          </p>
        </article>
      </section>
    </>
  );
}
