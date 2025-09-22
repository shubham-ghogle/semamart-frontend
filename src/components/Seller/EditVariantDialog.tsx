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

type EditVariantDialogProps = {
  variant?: Variant;
};

export default function EditVariantDialog({ variant }: EditVariantDialogProps) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const [originalPrice, setOriginalPrice] = useState(
    variant?.originalPrice.toString()||""
  );
  const [discountPrice, setDiscountPrice] = useState(
    variant?.discountPrice?.toString() ?? ""
  );
  const [stock, setStock] = useState(variant?.stock.toString()|| "");
  const [size, setSize] = useState(variant?.size ?? "");
  const [color, setColor] = useState(variant?.colorOption ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
    if (size.trim() !== "") {
      formData.append("size", size);
    }
    if (color.trim() !== "") {
      formData.append("colorOption", color);
    }

    if (file) {
      formData.append("thumbnail", file);
    }

    mutate({ formData: formData, variantId: variant?._id||"" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <EditIcon className="text-green-600" />
        </Button>
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
                <div>
                  <label htmlFor="variant-thumbnail">
                    <img
                      className="rounded object-fill max-h-40"
                      src={preview || thumbnailSrc}
                    />
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
