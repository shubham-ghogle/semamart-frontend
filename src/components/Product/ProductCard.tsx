import { Link } from "react-router";
import { Product } from "../../Types/types";
import RatingsStarView from "../UI/RatingStarView";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={"/product/" + product._id}>
      <article className="grid grid-rows-[5fr_1fr_1fr_1fr_1fr] items-center h-96 bg-white border shadow-xl rounded-lg p-3 w-full">
        <img
          className="object-contain h-[200px] justify-self-center self-center"
          src={
            "/baseUrl" +
            "/" +
            (product.images.length !== 0 ? product.images[0] : "")
          }
        />
        <p className="text-darkBlue">{product.shopId.name}</p>
        <p className="text-slate-900 font-semibold text-lg">{product.name}</p>
        <RatingsStarView rating={product.ratings || 0} />
        <p className="text-slate-900 font-bold text-xl">
          ${product.discountPrice}
          {"  "}
          <span className="line-through text-sm text-red-700">
            ${product.originalPrice || 0}
          </span>
        </p>
      </article>
    </Link>
  );
}
