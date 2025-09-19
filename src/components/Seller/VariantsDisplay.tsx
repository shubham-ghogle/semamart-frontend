import { Product } from "@/Types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { BASE_URL } from "@/data";
import { Button } from "../ui/button";
import { AiOutlinePlusCircle } from "react-icons/ai";
import EditVariantDialog from "./EditVariantDialog";

type VariantsDisplayProps = {
  isMultiVariant: boolean;
};

export default function VariantsDisplay({
  isMultiVariant,
}: VariantsDisplayProps) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const product = queryClient.getQueryData(["product", id]) as Product;
  const variants = product.variants;

  return (
    <div>
      {variants.map((el, i) => (
        <article
          key={el._id}
          className="border rounded-lg p-6 grid grid-cols-[3fr_2fr] gap-4 items-start relative"
        >
          <section className="w-full space-y-2">
            {isMultiVariant && <h3>Variant-{i}</h3>}
            <ReadOnlyField label="Original Price" value={el.originalPrice} />
            <ReadOnlyField label="Available Stock" value={el.stock} />
            <ReadOnlyField label="Size" value={el.size ?? "-"} />
            <ReadOnlyField label="Color" value={el.colorOption ?? "-"} />
          </section>
          <section className="space-y-2 w-full">
            <ReadOnlyField
              label="Discount Price"
              value={el.discountPrice ?? 0}
            />
            <img
              className="rounded object-cover w-full"
              src={BASE_URL + "images/" + el.thumbnail}
            />
          </section>
          {/* <Button className="absolute right-2 bottom-2" variant="outline">
            Edit Variant
          </Button> */}
          <article className="absolute right-2 bottom-2">
            <EditVariantDialog/>
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
