import { useState } from "react";
import { Product } from "@/Types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { BASE_URL } from "@/data";
import EditVariantDialog from "./EditVariantDialog";

type VariantsDisplayProps = {
  minQty: number; // minimum allowed quantity
};

export default function VariantsDisplay({ minQty }: VariantsDisplayProps) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const product = queryClient.getQueryData(["product", id]) as Product;
  const variants = product?.variants ?? [];

  // Track errors for bulk order inputs
  const [bulkErrors, setBulkErrors] = useState<{ [key: string]: string }>({});

  // Check if there are any errors
  const hasErrors = Object.keys(bulkErrors).length > 0;

  // Example submit handler
  const handleSubmit = () => {
    if (hasErrors) {
      alert("Please fix errors before submitting!");
      return;
    }
    alert("Submitted successfully!");
  };

  return (
    <div className="space-y-4">
      {variants.map((el) => (
        <div key={el._id} className="border rounded-lg p-6 relative">
          <article className="grid grid-cols-[3fr_2fr] gap-4 items-start">
            <section className="w-full space-y-2">
              <ReadOnlyField
                label="Original Price"
                value={
                  el.originalPrice != null
                    ? el.originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                    : "N/A"
                }
              />
              <ReadOnlyField label="Available Stock" value={el.stock} />
              <ReadOnlyField label="Size" value={el.size ?? "-"} />
              <ReadOnlyField label="Color" value={el.colorOption ?? "-"} />
            </section>
            <section className="space-y-2 w-72 grid grid-rows-[70px_1fr]">
              <ReadOnlyField
                label="Discount Price"
                value={(el.discountPrice ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              />
              <div>
                <img
                  className="rounded object-fill max-h-40"
                  src={BASE_URL + "images/" + el.thumbnail}
                  alt={el.size ?? "variant image"}
                />
              </div>
            </section>
            <article className="absolute right-1 top-1">
              <EditVariantDialog addNew={false} variant={el} />
            </article>
          </article>

          {el.bulkOrders.map((v) => (
            <section key={v._id} className="mt-4 space-y-2">
              <p className="text-lg">Bulk orders</p>
              <article className="flex gap-2 items-start">
                <BulkOrderField
                  initialQty={Number(v.qty)}
                  minQty={minQty}
                  onError={(error) =>
                    setBulkErrors((prev) => {
                      if (error) {
                        return { ...prev, [v._id]: error };
                      } else {
                        const copy = { ...prev };
                        delete copy[v._id];
                        return copy;
                      }
                    })
                  }
                />
                <ReadOnlyField
                  label="Price"
                  value={(v.price ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                />
              </article>
              {bulkErrors[v._id] && <p className="text-red-600 text-sm">{bulkErrors[v._id]}</p>}
            </section>
          ))}
        </div>
      ))}

      <section className="mt-2 flex justify-start gap-4">
        <EditVariantDialog addNew={true} productId={id ?? ""} />
        <button
          onClick={handleSubmit}
          disabled={hasErrors}
          className={`px-4 py-2 rounded ${
            hasErrors ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white"
          }`}
        >
          Submit
        </button>
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

type BulkOrderFieldProps = {
  initialQty: number;
  minQty: number;
  onError: (error: string | null) => void; // callback to notify parent
};

function BulkOrderField({ initialQty, minQty, onError }: BulkOrderFieldProps) {
  const [qty, setQty] = useState<number>(initialQty);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false); // track if user has typed

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setQty(value);

    if (!touched) setTouched(true); // mark as touched on first input

    if (value <= minQty) {
      const errMsg = `Quantity must be greater than ${minQty}`;
      setError(errMsg);
      onError(errMsg);
    } else {
      setError(null);
      onError(null);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Label>Quantity</Label>
      <Input type="number" value={qty} onChange={handleChange} />
      {touched && error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
