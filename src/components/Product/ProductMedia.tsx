import { useState } from "react";
import { Product } from "../../Types/types";

type ProductMediaProp = {
  product: Product;
};

export default function ProductMedia({ product }: ProductMediaProp) {
  const [selectedMedia, setSelectedMedia] = useState<number | "vid">(0);

  return (
    <article className="grid grid-cols-[1fr_6fr] h-full">
      <ul>
        {product?.images.map((el, i) => (
          <li
            key={i}
            onClick={() => setSelectedMedia(i)}
            className={
              (selectedMedia === i ? "border-darkBlue border-2" : "border") +
              " hover:cursor-pointer"
            }
          >
            <img src={"/baseUrl" + "/" + el} />
          </li>
        ))}
        <li
          className={
            "aspect-square flex items-center " +
            (selectedMedia === "vid" ? "border-2 border-darkBlue" : "border")
          }
          onClick={() => setSelectedMedia("vid")}
        >
          <video>
            <source
              src={"/baseUrl" + "/" + product?.shortVideo}
              type="video/mp4"
            />
          </video>
        </li>
      </ul>
      <figure className="h-full grid place-items-center">
        {typeof selectedMedia === "number" ? (
          <img
            src={"/baseUrl" + "/" + product?.images[selectedMedia]}
            className="w-[80%]"
          />
        ) : (
          <video controls className="p-2">
            <source
              src={"/baseUrl" + "/" + product?.shortVideo}
              type="video/mp4"
            />
          </video>
        )}
      </figure>
    </article>
  );
}
