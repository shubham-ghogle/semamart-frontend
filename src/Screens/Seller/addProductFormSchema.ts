import { z } from "zod"

const addProductFormSchema = z.object({
  name: z.string().min(1),
  category: z.string()
});

export { addProductFormSchema }
