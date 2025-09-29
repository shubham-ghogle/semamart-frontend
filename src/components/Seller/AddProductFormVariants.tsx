import { useFieldArray  } from "react-hook-form";
import { Button } from "../ui/button";
import { MinusCircleIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { AiOutlinePlusCircle } from "react-icons/ai";

type AddProductFormVariantsProps={
  i:any;
  form:any;
  field:any;
  isMultiVariant:boolean;
  handleThumbnailChange:any;
  removeVariant:any;
  thumbnail:any;
}

export default function AddProductFormVariants({
  i,
  form,
  field,
  isMultiVariant,
  handleThumbnailChange,
  removeVariant,
  thumbnail,
}:AddProductFormVariantsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `variants.${i}.bulkOrders`,
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
          disabled={i === 0}
          onClick={() => removeVariant(i)}
        >
          <MinusCircleIcon className="text-red-500" />
        </Button>
      )}
      <p className="text-sm font-semibold text-gray-500">Variant {i + 1}</p>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`variants.${i}.originalPrice`}
          render={() => (
            <FormItem>
              <FormLabel>MRP (₹)</FormLabel>
              <FormControl>
                <Input {...form.register(`variants.${i}.originalPrice`)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variants.${i}.discountPrice`}
          render={() => (
            <FormItem>
              <FormLabel>Selling Price (₹)</FormLabel>
              <FormControl>
                <Input {...form.register(`variants.${i}.discountPrice`)} />
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
            name={`variants.${i}.colorOption`}
            render={() => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input {...form.register(`variants.${i}.colorOption`)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${i}.size`}
            render={() => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input {...form.register(`variants.${i}.size`)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${i}.stocks`}
            render={() => (
              <FormItem>
                <FormLabel>Stocks</FormLabel>
                <FormControl>
                  <Input {...form.register(`variants.${i}.stocks`)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </article>
        <div>
          <FormLabel>Upload Thumbnail Image</FormLabel>
          <div className="border border-gray-300 h-[150px] w-[220px] flex items-center justify-center rounded-[5px] cursor-pointer mt-2">
            <label
              htmlFor="uploadThumbnail"
              className="cursor-pointer w-full h-full grid place-items-center"
            >
              {thumbnail[i] ? (
                <img
                  src={URL.createObjectURL(thumbnail[i])}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <AiOutlinePlusCircle size={30} color="#555" />
              )}
            </label>
          </div>
          <input
            type="file"
            id="uploadThumbnail"
            className="hidden"
            onChange={(e) => handleThumbnailChange(e, i)}
          />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <FormLabel>Bulk Orders (max 3)</FormLabel>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              placeholder="Qty"
              {...form.register(`variants.${i}.bulkOrders.${index}.qty`,{ valueAsNumber: true })}
              className="w-20"
            />
            <Input
              placeholder="Price"
              {...form.register(`variants.${i}.bulkOrders.${index}.price`,{ valueAsNumber: true })}
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
