import { API_URL, BASE_URL } from "@/data"
import { Product } from "@/Types/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent } from "react"
import { AiOutlinePlusCircle } from "react-icons/ai"
import { useParams } from "react-router"
import { ScreenOverlayLoaderUi } from "../UIComponents/LoaderUi"

export default function MediaDisplay() {

  const { id } = useParams()
  const queryClient = useQueryClient()
  const product = queryClient.getQueryData(["product", id]) as Product

  const remaningImages = 4 - product.images.length

  const { mutate, status } = useMutation({
    mutationFn: (v: { file: File, productId: string, idx?: number }) => uploadImage(v.file, v.productId, v.idx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] })
    },
  })


  function handleImageChange(e: ChangeEvent<HTMLInputElement>, i?: number) {
    e.preventDefault()
    const file = e.target.files?.[0]
    if (file) {
      mutate({ file: file, productId: id ?? "", idx: i })
    }
  }

  return (
    <section className="flex gap-4 mt-2">
      {status === "pending" && <ScreenOverlayLoaderUi />}
      {product?.images.map((el, i) => (
        <>
          <label htmlFor={"edit-image-" + i}>
            <img
              key={i}
              src={BASE_URL + "images/" + el}
              alt="Thumbnail"
              className="h-[120px] aspect-square object-cover cursor-pointer"
            />
          </label>
          <input
            type="file"
            id={`edit-image-${i}`}
            className="hidden"
            onChange={(e) => handleImageChange(e, i)}
          />
        </>
      ))}
      {Array.from({ length: remaningImages }).map((_, i) => (
        <label
          key={i}
          htmlFor={`uploadImage-${i}`}
          className="border border-gray-300 h-[120px] w-[120px] flex items-center justify-center rounded-[5px] cursor-pointer"
        >
          <AiOutlinePlusCircle size={30} color="#555" />
          <input
            type="file"
            id={`uploadImage-${i}`}
            className="hidden"
            onChange={(e) => handleImageChange(e)}
          />
        </label>
      ))}
    </section>
  )
}

async function uploadImage(file: File, productId: string, idx?: number) {
  const formData = new FormData()
  formData.append("images", file)
  if (idx !== undefined) {
    formData.append("idx", idx.toString())
  }
  const res = await fetch(API_URL + "product/upload-image/" + productId, {
    method: "PUT",
    body: formData,
  })

  if (!res.ok) throw new Error("Failed to upload image")
}
