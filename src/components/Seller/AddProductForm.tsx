import { addProductFormSchema } from "@/Screens/Seller/addProductFormSchema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Autocomplete } from "../ui/autocomplete"
import { CategoryApiRes } from "@/Types/types"
import { useEffect } from "react"
import { API_URL } from "@/data"
import { useMutation } from "@tanstack/react-query"

type AddProductFormProps = {
  categories: CategoryApiRes[]
}

export default function AddProductForm({ categories }: AddProductFormProps) {

  const categoryDropDownList = categories.map(c => ({ label: c.name, value: c._id }))

  const form = useForm<z.infer<typeof addProductFormSchema>>({
    resolver: zodResolver(addProductFormSchema),
  })

  function onSubmit(values: z.infer<typeof addProductFormSchema>) {
    console.log(values)
  }

  const { mutate, status } = useMutation({
    mutationFn: (categoryId: string) => fetchSubcategories(categoryId),
    onSuccess: (data) => {
      console.log(data)
    }
  })
  useEffect(() => {
    mutate(form.getValues("category"))
  }, [form.watch("category")])

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-4xl mx-auto py-10 bg-white p-4 rounded shadow">

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Autocomplete
                  listItems={categoryDropDownList}
                  placeholder="Select category..."
                  value={field.value}
                  setValue={(value) => { form.setValue("category", value) }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      </form>
    </Form>
  )
}

async function fetchSubcategories(categoryId: string) {
  if (categoryId.trim() === "") return
  const url = API_URL + "category/" + categoryId
  const res = await fetch(url)
  if (!res.ok) throw new Error()
  const data = await res.json()
  return data
}
