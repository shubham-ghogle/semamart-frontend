import { FormEvent, useState } from "react"
import { ActionBtn } from "../UI/Buttons"
import Input, { Textarea } from "../UI/Inputs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

type ReviewModalProps = {
  onCloseModal: () => void
  productId: string
  orderId: string
}

export default function ReviewModal({ onCloseModal, productId, orderId }: ReviewModalProps) {
  const [rating, setRating] = useState(1)
  const [comment, setComment] = useState("")

  const qc = useQueryClient()

  const { mutateAsync: addReview, status } = useMutation({
    mutationFn: async function (formData: { rating: number; comment: string; productId: string }) {
      const res = await fetch("/api/v2/review/create-new-review/" + orderId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error("Something went wrong")

      const data = await res.json()
      if (!data.success) throw new Error(data.message)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["user-order-detail"] })
      onCloseModal()
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = { rating, comment, productId }
    await addReview(formData)
  }

  return (
    <section
      className="fixed inset-0 z-50 bg-black/50 grid place-items-center"
      onClick={onCloseModal}
      onSubmit={handleSubmit}
    >
      <form
        className="space-y-4 bg-white border p-6 rounded-lg shadow-md max-w-lg mx-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold">Add Review</h2>
        <Input
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          label="Rating"
          name="rating"
          type="number"
          placeholder="Enter rating (1-5)"
          min="1" max="5"
        />
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          label="Comment"
          name="comment"
          cols={100}
          rows={5}
          placeholder="Write your review"
        />
        <ActionBtn type="submit" disabled={status === "pending"}>{status === "pending" ? "Wait..." : "Submit"}</ActionBtn>
      </form>
    </section>
  )
}
