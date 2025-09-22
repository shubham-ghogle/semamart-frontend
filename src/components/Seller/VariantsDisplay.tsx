import { Product } from "@/Types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { BASE_URL } from "@/data";
import { Button } from "../ui/button";
import { AiOutlinePlusCircle } from "react-icons/ai";
import EditVariantDialog from "./EditVariantDialog";

// type VariantsDisplayProps = {
//   isMultiVariant: boolean;
// };

export default function VariantsDisplay( ) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const product = queryClient.getQueryData(["product", id]) as Product;
  const variants = product.variants;

  return (
    <div className="space-y-4">
      {variants.map((el) => (
        <article
          key={el._id}
          className="border rounded-lg p-6 grid grid-cols-[3fr_2fr] gap-4 relative items-start"
        >
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
            <EditVariantDialog variant={el}/>
          </article>
        </article>
      ))}
      <section className="mt-2 flex justify-start">
      <Button
        type="button"
        variant="outline"
        className="bg-green-100 text-green-700 cursor-pointer"
        onClick={() => {}}
      >
        <AiOutlinePlusCircle/>
        Add Variant
      </Button>
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
