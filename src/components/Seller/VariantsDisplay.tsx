import { Product } from "@/Types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { BASE_URL } from "@/data";
import EditVariantDialog from "./EditVariantDialog";

// type VariantsDisplayProps = {
//   isMultiVariant: boolean;
// };

export default function VariantsDisplay() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const product = queryClient.getQueryData(["product", id]) as Product;
  const variants = product.variants;

  return (
    <div className="space-y-4">
      {variants.map((el) => (
        <div key={el._id} className="border rounded-lg p-6 relative">
          <article className="grid grid-cols-[3fr_2fr] gap-4 items-start">
            <section className="w-full space-y-2">
              <ReadOnlyField label="Original Price" value={el.originalPrice} />
              <ReadOnlyField label="Available Stock" value={el.stock} />
              <ReadOnlyField label="Size" value={el.size ?? "-"} />
              <ReadOnlyField label="Color" value={el.colorOption ?? "-"} />
            </section>
            <section className="space-y-2 w-72 grid grid-rows-[70px_1fr]">
              <ReadOnlyField
                label="Discount Price"
                value={el.discountPrice ?? 0}
              />
              <div>
                <img
                  className="rounded object-fill max-h-40"
                  src={BASE_URL + "images/" + el.thumbnail}
                />
              </div>
            </section>
            <article className="absolute right-1 top-1">
              <EditVariantDialog addNew={false} variant={el} />
            </article>
          </article>
          {el.bulkOrders.map((v) => (
            <section className="mt-4 space-y-2">
              <p className="text-lg">Bulk orders</p>
              <article key={v._id} className="flex gap-2">
                <ReadOnlyField label="Quantity" value={v.qty} />
                <ReadOnlyField label="Price" value={v.price} />
              </article>
            </section>
          ))}
        </div>
      ))}
      <section className="mt-2 flex justify-start">
        <EditVariantDialog addNew={true} productId={id ?? ""} />
      </section>
    </div>
  );
}

type ReadOnlyFieldProps = {
  label: string;
  value: string | number;
};

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input value={value} disabled readOnly />
    </div>
  );
}
