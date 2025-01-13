import { Link } from "react-router";
import { Product } from "../../Types/types";
import { IoMdCart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { FaRegEye } from "react-icons/fa";
// import RatingsStarView from "../UI/RatingStarView";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const productDiscount = Math.floor(
    ((product.originalPrice - product.discountPrice) / product.originalPrice) *
      100,
  );

  return (
    <article className="border rounded-lg bg-white shadow hover:shadow-lg transition group">
      <Link to={"/product/" + product._id}>
        <div className="relative">
          {productDiscount > 0 && (
            <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
              {productDiscount + "%"}
            </span>
          )}
          <img
            src={
              "/baseUrl" +
              "/" +
              (product.images.length !== 0 ? product.images[0] : "")
            }
            alt={product.name}
            className="w-full h-48 object-cover rounded"
          />
          {/* Add group-hover to control visibility */}
          {/* Add group-hover with transition and transform effects */}
          <div className="product-cart-hover-item">
            <button>
              <CiHeart size={20} />
            </button>
            <button>
              <FaRegEye size={20} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="mt-4 text-gray-800 font-semibold text-base truncate">
            {product.name}
          </h3>
          <div className="flex items-center space-x-2 mt-2">
            <span className="line-through text-gray-500 text-sm">
              ₹{product.originalPrice}
            </span>
            <span className="text-lg font-bold text-black">
              ₹{product.discountPrice}
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-medium flex justify-center items-center gap-2">
              <IoMdCart className="text-xl" />
              <span> Add to Cart</span>
            </button>
            <button className="w-full text-sm text-gray-500 hover:text-teal-600 flex justify-center items-center gap-2">
              <CiHeart className="text-xl" /> <span>Add to Wishlist</span>
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}

{
  /* <article className="grid grid-rows-[5fr_1fr_1fr_1fr_1fr] items-center h-96 bg-white border shadow-xl rounded-lg p-3 w-full"> */
}
{
  /*   <img */
}
{
  /*     className="object-contain h-[200px] justify-self-center self-center" */
}
{
  /*     src={ */
}
{
  /*       "/baseUrl" + */
}
{
  /*       "/" + */
}
{
  /*       (product.images.length !== 0 ? product.images[0] : "") */
}
{
  /*     } */
}
{
  /*   /> */
}
{
  /*   <p className="text-darkBlue">{product.shopId.name}</p> */
}
{
  /*   <p className="text-slate-900 font-semibold text-lg">{product.name}</p> */
}
{
  /*   <RatingsStarView rating={product.ratings || 0} /> */
}
{
  /*   <p className="text-slate-900 font-bold text-xl"> */
}
{
  /*     ${product.discountPrice} */
}
{
  /*     {"  "} */
}
{
  /*     <span className="line-through text-sm text-red-700"> */
}
{
  /*       ${product.originalPrice || 0} */
}
{
  /*     </span> */
}
{
  /*   </p> */
}
{
  /* </article> */
}
