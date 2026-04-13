import { ChangeEvent, ComponentProps, FormEvent, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { EditIcon, X } from "lucide-react";
import { API_URL, BASE_URL } from "@/data";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Variant } from "@/Types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { getApiErrorMessage } from "@/lib/apiError";
import { getErrorMessage } from "@/lib/utils";

type EditVariantDialogProps =
  | {
      variant: Variant;
      addNew: false;
      productId?: undefined;
      minQty?: number;
    }
  | {
      addNew: true;
      variant?: undefined;
      productId: string;
      minQty?: number;
    };

export default function EditVariantDialog({
  variant,
  addNew,
  productId,
  minQty = 0,
}: EditVariantDialogProps) {
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(
    variant?.originalPrice.toString() || "",
  );
  const [discountPrice, setDiscountPrice] = useState(
    variant?.discountPrice?.toString() ?? "",
  );
  const [stock, setStock] = useState(variant?.stock.toString() || "");
  const [size, setSize] = useState(variant?.size ?? "");
  const [color, setColor] = useState(variant?.colorOption ?? "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    variant?.images?.length
      ? variant.images.map((img) => `${BASE_URL}images/${img}`)
      : [],
  );
  const [bulkOrders, setBulkOrders] = useState(
    variant?.bulkOrders.map((v) => ({
      _id: v._id,
      qty: v.qty,
      price: v.price,
      commission: v.commission,
      commissionHistory: v.commissionHistory ?? [],
    })) ?? [],
  );

  const thumbnailSrc = useMemo(
    () => (variant?.thumbnail ? BASE_URL + "images/" + variant.thumbnail : ""),
    [variant?.thumbnail],
  );

  function handleThumbnailChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
      setThumbnailFile(file);
    }
  }

  function handleImagesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  const { mutate } = useMutation({
    mutationFn: (v: { formData: FormData; variantId: string }) =>
      putVariant(v.variantId, v.formData),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["product", variant?.productId] });
      setOpen(false);
      toast.success("Variant updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to update variant"));
    },
  });

  const { mutate: addVariant } = useMutation({
    mutationFn: (v: FormData) => postVariant(v),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["product", productId] });
      setOpen(false);
      toast.success("Variant added successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to add variant"));
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (
      bulkOrders.some(
        (order) => Number.isFinite(minQty) && minQty > 0 && order.qty < minQty,
      )
    ) {
      toast.error(`Bulk order quantity cannot be less than MOQ (${minQty}).`);
      return;
    }

    const formData = new FormData();
    formData.append("originalPrice", originalPrice);
    formData.append("discountPrice", discountPrice);
    formData.append("stock", stock);
    formData.append("bulkOrders", JSON.stringify(bulkOrders));
    if (size.trim() !== "") {
      formData.append("size", size);
    }
    if (color.trim() !== "") {
      formData.append("colorOption", color);
    }

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    if (addNew) {
      formData.append("productId", productId);
      addVariant(formData);
      return;
    }

    mutate({ formData, variantId: variant?._id || "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {addNew ? (
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer bg-green-100 text-green-700"
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
        <DialogContent className="min-w-[760px]! max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Product Variant</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="rounded-lg">
            <div className="grid grid-cols-[3fr_2fr] gap-4 p-6 relative items-start">
              <section className="w-full space-y-2">
                <InputField
                  label="Original Price"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
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
              <section className="space-y-3">
                <InputField
                  label="Discount Price"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />

                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <label
                    htmlFor="variant-thumbnail"
                    className="grid h-40 place-items-center overflow-hidden rounded border"
                  >
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                    ) : addNew ? (
                      <AiOutlinePlusCircle size={30} color="#555" />
                    ) : (
                      <img
                        className="h-full w-full rounded object-cover"
                        src={thumbnailSrc || "/image60.png"}
                        alt="Current thumbnail"
                      />
                    )}
                  </label>
                  <input
                    id="variant-thumbnail"
                    name="variant-thumbnail"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Images</Label>
                  <label
                    htmlFor="variant-images"
                    className="flex min-h-40 flex-wrap gap-2 rounded border border-dashed p-2"
                  >
                    {imagePreviews.length > 0 ? (
                      imagePreviews.map((src, index) => (
                        <div key={`${src}-${index}`} className="relative h-20 w-20 overflow-hidden rounded border">
                          <img src={src} alt={`Variant image ${index + 1}`} className="h-full w-full object-cover" />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute right-1 top-1 h-5 w-5"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeImage(index);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="flex w-full items-center justify-center gap-2 text-sm text-gray-500">
                        <AiOutlinePlusCircle size={24} color="#555" />
                        Add variant images
                      </div>
                    )}
                  </label>
                  <input
                    id="variant-images"
                    name="variant-images"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                  />
                </div>
              </section>
              <section className="space-y-4">
                <p className="text-lg">Bulk Orders</p>
                {bulkOrders.map((v, i) => (
                  <article key={i} className="flex items-center gap-2">
                    <InputField
                      label="Quantity"
                      value={v.qty}
                      onChange={(e) =>
                        setBulkOrders((prev) => {
                          const next = [...prev];
                          next[i].qty = Number(e.target.value);
                          return next;
                        })
                      }
                    />
                    <InputField
                      label="Price"
                      value={v.price}
                      onChange={(e) =>
                        setBulkOrders((prev) => {
                          const next = [...prev];
                          next[i].price = Number(e.target.value);
                          return next;
                        })
                      }
                    />
                    <button
                      type="button"
                      className="mt-5 text-xl font-bold text-red-600"
                      onClick={() =>
                        setBulkOrders((prev) => prev.filter((_, index) => index !== i))
                      }
                    >
                      ×
                    </button>
                  </article>
                ))}
                {bulkOrders.length < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-200 text-green-600"
                    type="button"
                    onClick={() =>
                      setBulkOrders((prev) => [
                        ...prev,
                        {
                          _id: "",
                          qty: 0,
                          price: 0,
                          commission: undefined,
                          commissionHistory: [],
                        },
                      ])
                    }
                  >
                    +
                  </Button>
                )}
              </section>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" type="submit">
                Save
              </Button>
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
  const res = await fetch(API_URL + "product-variant/update-variant/" + variantId, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, "Failed to update variant"));
  }
}

async function postVariant(formData: FormData) {
  const res = await fetch(API_URL + "product-variant/post-variant/", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, "Failed to create variant"));
  }
}
