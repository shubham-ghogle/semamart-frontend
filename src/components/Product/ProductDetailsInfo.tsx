import { useState } from "react";
import { ProductDetailsRows } from "../UIComponents/Table";
import { Product, User } from "../../Types/types";
import { Link } from "react-router";
import { SecondryBtn } from "../UIComponents/Buttons";
import RatingStarView from "../UIComponents/RatingStarView";

type ProductDetailsInfoProps = {
  product: Product;
};

export default function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  const [activeTab, setActiveTab] = useState(1);

  const tabHeadings = [
    "Product Details",
    "Product Description",
    "Reviews",
    "Seller Information",
  ];

  return (
    <div className="bg-light-blue px-3 md:px-10 py-2 rounded-sm">
      <article className="w-full flex justify-between border-b pt-5 pb-2">
        {tabHeadings.map((el, i) => (
          <h5
            key={i}
            className={
              "text-dark-blue font-semibold text-lg md:text-xl hover:cursor-pointer " +
              (activeTab === i + 1 && "underline underline-offset-8")
            }
            onClick={() => setActiveTab(i + 1)}
          >
            {el}
          </h5>
        ))}
      </article>

      {/* --- Product Details --- */}
      {activeTab === 1 && (
        <section className="py-2 text-[18px] leading-8 pb-10 whitespace-pre-line">
          <table className="w-full mt-6 table-fixed">
            <tbody>
              <ProductDetailsRows
                label="Product Dimensions"
                value={`${product.dimension ?? ""}; ${product.weight ?? ""}`}
              />
              <ProductDetailsRows
                label="Date first available"
                value={
                  product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "N/A"
                }
              />
              <ProductDetailsRows
                label="Manufacturer"
                value={typeof product.manufacturer !=="string"? product.manufacturer?.manufacturerName : "N/A"}
              />
              <ProductDetailsRows
                label="Country of origin"
                value={typeof product.manufacturer !=="string" ? product.manufacturer.origin : "N/A"}
              />
              <ProductDetailsRows
                label="Category"
                value={Array.isArray(product.category) ? product.category.join(", ") : (product.category ?? "N/A")}
              />
              {product.attributes &&
                product.attributes.map((el, i) => {
                  const [label, value] = Object.entries(el)[0];
                  return (
                    <ProductDetailsRows
                      key={i}
                      label={label}
                      value={String(value)}
                    />
                  );
                })}
            </tbody>
          </table>
        </section>
      )}

      {/* --- Description --- */}
      {activeTab === 2 && (
        <div className="w-full min-h-[40vh] py-3 pt-6">
          <p className="font-Poppins text-lg text-dark-gray">
            {product.description ?? "No description available"}
          </p>
        </div>
      )}

      {/* --- Seller Information --- */}
      {activeTab === 4 && typeof product.shopId !== "string" && (
        <div className="w-full flex mt-6">
          <div className="flex items-center">
            <Link to="#">
              <div className="flex items-center">
                <img
                  src={
                    product.shopId?.profilePic
                      ? "/baseUrl/" + product.shopId.profilePic
                      : "/placeholder.png"
                  }
                  className="w-[50px] h-[50px] rounded-full"
                  alt=""
                />
                <div className="pl-3">
                  <h3>{product.shopId?.businessName ?? "Unknown Seller"}</h3>
                  <h5 className="pb-3 text-[15px]">(1/5) Ratings</h5>
                </div>
              </div>
            </Link>
          </div>
          <div className="w-full">
            <h5 className="font-semibold">
              Joined on:{" "}
              <span className="font-medium">
                {product.shopId?.createdAt
                  ? product.shopId.createdAt.slice(0, 10)
                  : "N/A"}
              </span>
            </h5>
          </div>
          <Link to="#">
            <SecondryBtn>Visit Shop</SecondryBtn>
          </Link>
        </div>
      )}

      {/* --- Reviews --- */}
      {activeTab === 3 && (
        <div className="space-y-4 pt-4 min-h-[40vh]">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, idx) => {
              if (typeof review === "string") {
                return null; // skip string IDs
              }
              return (
                <div key={review._id ?? idx}>
                  <h3 className="text-lg font-semibold">
                    {(review.user as User)?.firstName}{" "}
                    {(review.user as User)?.lastName}
                  </h3>
                  <RatingStarView rating={review.rating ?? 0} />
                  <p className="text-gray-700 mt-2">{review.comment ?? ""}</p>
                </div>
              );
            })
          ) : (
            <p className="text-dark-gray text-center text-lg">No reviews</p>
          )}
        </div>
      )}
    </div>
  );
}
