import { ChangeEvent, ComponentProps, FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { EditIcon } from "lucide-react";
import { API_URL, BASE_URL } from "@/data";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Variant } from "@/Types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AiOutlinePlusCircle } from "react-icons/ai";

type EditVariantDialogProps =
  | {
      variant: Variant;
      addNew: false;
      productId?: undefined;
    }
  | {
      addNew: true;
      variant?: undefined;
      productId: string;
    };

export default function EditVariantDialog({
  variant,
  addNew,
  productId,
}: EditVariantDialogProps) {
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(
    variant?.originalPrice.toString() || ""
  );
  const [discountPrice, setDiscountPrice] = useState(
    variant?.discountPrice?.toString() ?? ""
  );
  const [commission, setCommission] = useState(
    variant?.commission?.toString() ?? ""
  );
  const [stock, setStock] = useState(variant?.stock.toString() || "");
  const [size, setSize] = useState(variant?.size ?? "");
  const [color, setColor] = useState(variant?.colorOption ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bulkOders, setBulkOrders] = useState(
    variant?.bulkOrders.map((v) => ({ qty: v.qty, price: v.price })) ?? []
  );

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFile(file);
    }
  }

  const thumbnailSrc = BASE_URL + "images/" + variant?.thumbnail;

  const { mutate } = useMutation({
    mutationFn: (v: { formData: FormData; variantId: string }) =>
      putVariant(v.variantId, v.formData),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["product", variant?.productId] });
      setOpen(false);
      toast.success("Media And Variant updated successfully");
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });

  const { mutate: addVariant } = useMutation({
    mutationFn: (v: FormData) => postVariant(v),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["product", productId] });
      setOpen(false);
      toast.success("Media And Variant updated successfully");
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    const formData = new FormData();
    formData.append("originalPrice", originalPrice);
    formData.append("discountPrice", discountPrice);
    formData.append("stock", stock);
    formData.append("commission", commission);
    formData.append("bulkOrders", JSON.stringify(bulkOders));
    if (size.trim() !== "") {
      formData.append("size", size);
    }
    if (color.trim() !== "") {
      formData.append("colorOption", color);
    }

    if (file) {
      formData.append("thumbnail", file);
    }

    if (addNew) {
      formData.append("productId", productId);
      addVariant(formData);
    } else {
      mutate({ formData: formData, variantId: variant?._id || "" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {addNew ? (
          <Button
            type="button"
            variant="outline"
            className="bg-green-100 text-green-700 cursor-pointer"
            onClick={() => {}}
          >
            <AiOutlinePlusCircle />
            Add Variant
          </Button>
        ) : (
          <Button size="icon" variant="ghost">
            <EditIcon className="text-green-600" />
          </Button>
        )}
      </DialogTrigger>
      {open && (
        <DialogContent className="min-w-[650px]!">
          <DialogHeader>
            <DialogTitle>Edit Product Variant</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="rounded-lg">
            <div className=" grid grid-cols-[3fr_2fr] p-6 gap-4 relative items-start">
              <section className="w-full space-y-2">
                <InputField
                  label="Original Price"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
                <InputField
                  label="Commission (%)"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                />
                <InputField
                  label="Available Stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
                <InputField
                  label="Size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
                <InputField
                  label="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </section>
              <section className="space-y-2 w-72 grid grid-rows-[70px_1fr]">
                <InputField
                  label="Discount Price"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
                <div className="h-40">
                  <label
                    htmlFor="variant-thumbnail"
                    className="grid h-full place-items-center border rounded"
                  >
                    {addNew ? (
                      preview ? (
                        <img
                          src={preview}
                          alt="Thumbnail"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AiOutlinePlusCircle size={30} color="#555" />
                      )
                    ) : (
                      <img
                        className="rounded object-fill max-h-40"
                        src={preview || thumbnailSrc}
                      />
                    )}
                  </label>
                  <input
                    id="variant-thumbnail"
                    name="variant-thumbnail"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </section>
              <section className="space-y-4">
                <p className="text-lg">Bulk Orders</p>
                {bulkOders.map((v, i) => (
                  <article key={i} className="flex gap-2 items-center">
                    <InputField
                      label="Quantity"
                      value={v.qty}
                      onChange={(e) =>
                        setBulkOrders((prev) => {
                          const newOrders = [...prev];
                          newOrders[i].qty = Number(e.target.value);
                          return newOrders;
                        })
                      }
                    />
                    <InputField
                      label="Price"
                      value={v.price}
                      onChange={(e) =>
                        setBulkOrders((prev) => {
                          const newOrders = [...prev];
                          newOrders[i].price = Number(e.target.value);
                          return newOrders;
                        })
                      }
                    />
                    {/* Delete Button */}
                    <button
                      type="button"
                      className="text-red-600 font-bold text-xl mt-5"
                      onClick={() =>
                        setBulkOrders((prev) => prev.filter((_, index) => index !== i))
                      }
                    >
                      ×
                    </button>
                  </article>
                ))}
                {bulkOders.length < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 bg-green-200"
                    type="button"
                    onClick={() =>
                      setBulkOrders((prev) => [...prev, { qty: 0, price: 0 }])
                    }
                  >
                    +
                  </Button>
                )}
              </section>

            </div>
            <div className="flex justify-end ">
              <Button variant="outline">Ok</Button>
            </div>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

type InputFieldProps = {
  label: string;
  value: string | number;
} & ComponentProps<"input">;

function InputField({ label, value, ...a }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input {...a} value={value} />
    </div>
  );
}

async function putVariant(variantId: string, formData: FormData) {
  const res = await fetch(
    API_URL + "product-variant/update-variant/" + variantId,
    {
      method: "PUT",
      credentials: "include",
      body: formData,
    }
  );
  if (!res.ok) throw new Error();
}

async function postVariant(formData: FormData) {
  const res = await fetch(API_URL + "product-variant/post-variant/", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error();
}
