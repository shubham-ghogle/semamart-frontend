import { useState } from "react";
import { ProductDetailsRows } from "../UI/Table";
import { Product } from "../../Types/types";
import { Link } from "react-router";
import { SecondryBtn } from "../UI/Buttons";

type ProductDetailsInfoProps = {
  product: Product
}
export default function ProductDetailsInfo({ product }: ProductDetailsInfoProps) {
  const [activeTab, setActiveTab] = useState(1);

  const tabHeadings = [
    "Product Details",
    "Product Description",
    "Reviews",
    "Seller Information",
  ];

  return (
    <div className="bg-lightBlue px-3 md:px-10 py-2 rounded">
      <article className="w-full flex justify-between border-b pt-5 pb-2">
        {tabHeadings.map((el, i) => (
          <h5
            key={i}
            className={
              "text-darkBlue font-semibold text-lg md:text-xl hover:cursor-pointer " +
              (activeTab === i + 1 && "underline underline-offset-8")
            }
            onClick={() => setActiveTab(i + 1)}
          >
            {el}
          </h5>
        ))}
      </article>
      {activeTab === 1 &&
        <section className="py-2 text-[18px] leading-8 pb-10 whitespace-pre-line  ">
          <table className="w-full mt-6 table-fixed">
            <tbody>
              <ProductDetailsRows
                label="Product Dimensions"
                value={product.dimension + "; " + product.weight}
              />
              <ProductDetailsRows
                label="Date first available"
                value={new Date(product.createdAt).toLocaleDateString()}
              />
              <ProductDetailsRows
                label="Manufacturer"
                value={product.manufacturerName}
              />
              <ProductDetailsRows
                label="Country of origin"
                value={product.origin}
              />
              <ProductDetailsRows label="Category" value={product.category} />
              {product.attributes && product.attributes.map((el, i) => {
                const [label, value] = Object.entries(el)[0]
                return <ProductDetailsRows key={i} label={label} value={value} />
              })}
            </tbody>
          </table>
        </section>
      }
      {activeTab === 2 &&
        <div className="w-full min-h-[40vh] py-3 pt-6">
          <p className="font-Poppins text-lg text-darkGray">
            {product.description}
          </p>
        </div>
      }
      {activeTab === 4 && typeof product.shopId !== "string" && (
        <div className="w-full flex mt-6">
          <div className="flex items-center">
            <Link to="#">
              <div className="flex items-center">
                <img
                  src={product.shopId.profilePic ? "/baseUrl" + "/" + product.shopId.profilePic : "/placeholder.png"}
                  className="w-[50px] h-[50px] rounded-full"
                  alt=""
                />
                <div className="pl-3">
                  <h3 className="">
                    {product.shopId.businessName}
                  </h3>
                  <h5 className="pb-3 text-[15px]">
                    (1/5) Ratings
                  </h5>
                </div>
              </div>
            </Link>
          </div>
          <div className="w-full">
            <h5 className="font-[600]">
              Joined on:{" "}
              <span className="font-[500]">
                {product.shopId?.createdAt?.slice(0, 10)}
              </span>
            </h5>
          </div>
          <Link to="#">
            <SecondryBtn>
              Visit Shop
            </SecondryBtn>
          </Link>
        </div>
      )}
      {activeTab === 3 && (
        <div>
          {(product.reviews && product.reviews.length === 0) && (
            <p className="mt-6 min-h-[40vh] text-center text-darkGray text-xl">No reviews</p>
          )}
        </div>
      )}
    </div>
  );
}
