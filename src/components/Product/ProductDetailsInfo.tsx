import { useState } from "react";

export default function ProductDetailsInfo() {
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
    </div>
  );
}
