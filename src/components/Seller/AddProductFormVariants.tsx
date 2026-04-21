import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "../ui/button";
import { MinusCircleIcon, X } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { AiOutlinePlusCircle } from "react-icons/ai";

type AddProductFormVariantsProps = {
  index: number;
  form: any;
  field: any;
  isMultiVariant: boolean;
  handleThumbnailChange: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  removeVariant: (index: number) => void;
  thumbnail: (File | null)[];
  thumbnailError: any;
  removeThumbnail: (index: number) => void;
  variantImages: File[][];
  setVariantImages: Dispatch<SetStateAction<File[][]>>;
};

export default function AddProductFormVariants({
  index,
  form,
  field,
  isMultiVariant,
  handleThumbnailChange,
  removeVariant,
  thumbnail,
  thumbnailError,
  removeThumbnail,
  variantImages,
  setVariantImages,
}: AddProductFormVariantsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `variants.${index}.bulkOrders`,
  });

  const currentVariantImages = variantImages[index] || [];

  function updateVariantImages(nextImages: File[]) {
    setVariantImages((prev) => {
      const next = [...prev];
      next[index] = nextImages;
      return next;
    });
  }

  return (
    <section
      key={field.id}
      className="relative space-y-4 rounded-xl border px-4 py-2"
    >
      {isMultiVariant && (
        <Button
          className="absolute right-2 top-2"
          variant="ghost"
          type="button"
          size="icon"
          disabled={index === 0}
          onClick={() => removeVariant(index)}
        >
          <MinusCircleIcon className="text-red-500" />
        </Button>
      )}
      <p className="text-sm font-semibold text-gray-500">Variant {index + 1}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <FormField
          control={form.control}
          name={`variants.${index}.originalPrice`}
          render={() => (
            <FormItem>
              <FormLabel>
                MRP (₹)<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...form.register(`variants.${index}.originalPrice`)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variants.${index}.discountPrice`}
          render={() => (
            <FormItem>
              <FormLabel>
                Selling Price (₹)<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...form.register(`variants.${index}.discountPrice`)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-wrap items-start gap-4 sm:gap-8">
        <article className="space-y-2 flex-1 min-w-[200px]">
          <FormField
            control={form.control}
            name={`variants.${index}.colorOption`}
            render={() => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input {...form.register(`variants.${index}.colorOption`)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.size`}
            render={() => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input {...form.register(`variants.${index}.size`)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.stocks`}
            render={() => (
              <FormItem>
                <FormLabel>
                  Stocks<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...form.register(`variants.${index}.stocks`)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </article>

        <div className="space-y-3 min-w-[200px] max-w-[300px]">
          <FormItem>
            <FormLabel>Upload Variant Thumbnail</FormLabel>
            <div className="mt-2 aspect-square w-[220px] overflow-hidden rounded-[5px] border border-gray-300 relative">
              <label
                htmlFor={field.id}
                className="grid h-full w-full cursor-pointer place-items-center"
              >
                {thumbnail[index] ? (
                  <div className="relative h-full w-full">
                    <img
                      src={URL.createObjectURL(thumbnail[index] as File)}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute right-1 top-1"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeThumbnail(index);
                      }}
                    >
                      <X className="w-4!" />
                    </Button>
                  </div>
                ) : (
                  <AiOutlinePlusCircle size={30} color="#555" />
                )}
              </label>
            </div>
            {thumbnailError && (
              <p className="text-sm text-red-500">
                {thumbnailError.message as string}
              </p>
            )}
            <input
              type="file"
              id={field.id}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleThumbnailChange(e, index)}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Upload More Variant Images</FormLabel>
            <div className="mt-2 space-y-3">
              <input
                type="file"
                className="hidden"
                id={`variant-images-${index}`}
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  updateVariantImages([...currentVariantImages, ...files]);
                  e.target.value = "";
                }}
              />
              <label
                htmlFor={`variant-images-${index}`}
                className="flex min-h-24 w-[220px] cursor-pointer flex-wrap gap-2 rounded-md border border-dashed border-gray-300 p-2"
              >
                {currentVariantImages.length > 0 ? (
                  currentVariantImages.map((image, imageIndex) => (
                    <div key={`${image.name}-${imageIndex}`} className="relative h-20 w-20 overflow-hidden rounded border">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Variant ${index + 1} image ${imageIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute right-1 top-1 h-5 w-5"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateVariantImages(
                            currentVariantImages.filter((_, idx) => idx !== imageIndex),
                          );
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
            </div>
          </FormItem>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <FormLabel>Bulk Orders (max 3)</FormLabel>

        {fields.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-20">Quantity</div>
            <div className="w-28">Price</div>
            <div className="w-8" />
          </div>
        )}

        {fields.map((field, i) => (
          <div key={field.id} className="flex items-start gap-2">
            <Input
              className="w-20"
              {...form.register(`variants.${index}.bulkOrders.${i}.qty`, {
                valueAsNumber: true,
              })}
            />
            {form.formState.errors?.variants?.[index]?.bulkOrders?.[i]?.qty?.message && (
              <p className="mt-1 w-20 text-xs text-red-500">
                {String(
                  form.formState.errors?.variants?.[index]?.bulkOrders?.[i]?.qty?.message,
                )}
              </p>
            )}

            <Input
              className="w-28"
              {...form.register(`variants.${index}.bulkOrders.${i}.price`, {
                valueAsNumber: true,
              })}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
            >
              ×
            </Button>
          </div>
        ))}

        {fields.length < 3 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ qty: 0, price: 0 })}
          >
            + Add Bulk Order
          </Button>
        )}
      </div>
    </section>
  );
}
