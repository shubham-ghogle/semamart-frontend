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
  index: any;
  form: any;
  field: any;
  isMultiVariant: boolean;
  handleThumbnailChange: any;
  removeVariant: any;
  thumbnail: any;
  thumbnailError: any;
  removeThumbnail: any;
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
}: AddProductFormVariantsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `variants.${index}.bulkOrders`,
  });

  return (
    <section
      key={field.id}
      className="relative space-y-4 py-2 px-4 border rounded-xl"
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
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`variants.${index}.originalPrice`}
          render={() => (
            <FormItem>
              <FormLabel>MRP (₹)</FormLabel>
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
              <FormLabel>Selling Price (₹)</FormLabel>
              <FormControl>
                <Input {...form.register(`variants.${index}.discountPrice`)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex items-start gap-8">
        <article className="space-y-2 w-1/2">
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
                <FormLabel>Stocks</FormLabel>
                <FormControl>
                  <Input {...form.register(`variants.${index}.stocks`)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </article>
        <FormItem>
          <FormLabel>Upload Thumbnail Image</FormLabel>
          <div className="border relative border-gray-300 h-[150px] w-[220px] flex items-center justify-center rounded-[5px] cursor-pointer mt-2">
            <label
              htmlFor={field.id}
              className="cursor-pointer w-full h-full grid place-items-center"
            >
              {thumbnail[index] ? (
                <div>
                  <img
                    src={URL.createObjectURL(thumbnail[index])}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeThumbnail(index);
                    }}
                  >
                    <X className="w-8!" />
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
            onChange={(e) => {
              handleThumbnailChange(e, index);
            }}
          />
        </FormItem>
      </div>

      <div className="space-y-2 mt-4">
        <FormLabel>Bulk Orders (max 3)</FormLabel>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              placeholder="Qty"
              {...form.register(`variants.${index}.bulkOrders.${index}.qty`, {
                valueAsNumber: true,
              })}
              className="w-20"
            />
            <Input
              placeholder="Price"
              {...form.register(`variants.${index}.bulkOrders.${index}.price`, {
                valueAsNumber: true,
              })}
              className="w-28"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              ✕
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
