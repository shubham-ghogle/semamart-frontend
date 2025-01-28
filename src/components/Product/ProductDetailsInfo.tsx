import { useState } from "react";
import { ProductDetailsRows } from "../UI/Table";
import { Product } from "../../Types/types";
import { Link } from "react-router";

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

  console.log(product)
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
            </tbody>
          </table>
        </section>
      }
      {activeTab === 2 &&
        <div className="w-full min-h-[40vh] flex flex-col items-center py-3 pt-6">
          <p className="font-Poppins text-lg text-darkGray">
            {product.description}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident,
            sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      }
      {activeTab === 4 && typeof product.shopId !== "string" && (
        <div className="w-full block 800px:flex p-5 ">
          <div className="w-full 800px:w-[50%]">
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
            {/* <p className="pt-2">{product.shop.description}</p> */}
          </div>
          <div className="w-full 800px:w-[50%] mt-5 800px:mt-0 800px:flex flex-col items-end">
            <div className="text-left">
              <h5 className="font-[600]">
                Joined on:{" "}
                <span className="font-[500]">
                  {product.shopId?.createdAt?.slice(0, 10)}
                </span>
              </h5>
              {/* <h5 className="font-[600] pt-3"> */}
              {/*   Total Products:{" "} */}
              {/*   <span className="font-[500]"> */}
              {/*     {products && products.length} */}
              {/*   </span> */}
              {/* </h5> */}
              {/* <h5 className="font-[600] pt-3"> */}
              {/*   Total Reviews:{" "} */}
              {/*   <span className="font-[500]">{product.shopId.import}</span> */}
              {/* </h5> */}
              <Link to="#">
                <div>
                  <h4 className="text-white">Visit Shop</h4>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
