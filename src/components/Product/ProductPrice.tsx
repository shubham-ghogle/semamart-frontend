import { Product } from "../../Types/types";

type ProductPriceProps = {
  product: Product;
};

export default function ProductPrice({ product }: ProductPriceProps) {
  return (
    <>
      {product?.originalPrice && (
        <p className="font-Roboto text-slate-600 pl-[76px] text-sm mb-1">
          Price:
          <span className="line-through pl-4 text-lg">
            ₹{product.originalPrice}
          </span>
        </p>
      )}
      <section className="font-Roboto text-slate-700 flex gap-4">
        <p className="mt-1 text-sm text-darkBlue font-semibold">
          Discounted Price:{" "}
        </p>
        <article className="">
          <p className="text-3xl text-red-600">
            ₹{product.discountPrice} <span className="text-lg">excl. GST</span>
          </p>
          <p className="text-2xl text-red-600">
            ₹54 <span className="text-sm">incl. GST</span>
          </p>
        </article>
      </section>
    </>
  );
}
