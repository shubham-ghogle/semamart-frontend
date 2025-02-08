import { useMutation } from "@tanstack/react-query"
import { Address, Order, User } from "../../Types/types"
import { useUserStore } from "../../store/userStore"
import { toast } from "react-toastify"

export function useRemoveAddress() {
  const addUser = useUserStore(state => state.addUser)

  const { mutateAsync: removeAddressAsync, status: removeAddStatus } = useMutation({
    mutationFn: async function (addressId: string) {
      const res = await fetch("/api/v2/user/delete-user-address/" + addressId, {
        method: "DELETE"
      })

      if (!res.ok) throw new Error("Something went wrong")
      const data = await res.json() as { user: User, success: boolean, message: string }
      if (!data.success) throw new Error(data.message)
      return data.user
    },
    onSuccess: (data) => {
      addUser(data)
    },
    onError: () => {
      toast.error("Something went wrong!!")
    }
  })

  return { removeAddressAsync, removeAddStatus }
}

type EditAddressParams = {
  addressId: string
  formData: Partial<Address>
}
export function useEditAddress() {
  const addUser = useUserStore(state => state.addUser)

  const { mutateAsync: editAddressAsync, status: editAddStatus } = useMutation({
    mutationFn: async function ({ addressId, formData }: EditAddressParams) {
      const res = await fetch("/api/v2/user/edit-user-address/" + addressId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error("Something went wrong")

      const data = await res.json() as { user: User, success: boolean, message: string }

      if (!data.success) throw new Error(data.message)
      return data.user
    },
    onSuccess: (data) => {
      addUser(data)
    },
    onError: () => {
      toast.error("Something went wrong!!")
    }
  })

  return { editAddressAsync, editAddStatus }
}


export function useAddAddress() {
  const addUser = useUserStore(state => state.addUser)
  const { mutateAsync: mutateAddress, status } = useMutation({
    mutationFn: async function (formData: Partial<Address>) {
      const res = await fetch("/api/v2/user/update-user-addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        throw new Error()
      }
      const data = await res.json() as User
      return data
    },
    onSuccess: (data) => {
      addUser(data)
    },
    onError: () => {
      toast.error("Something went wrong.")
    }
  })

  return { mutateAddress, status }
}

export async function getUserOrderDetails(orderId?: string) {
  if (!orderId) throw new Error("Something went wrong")

  const res = await fetch("/api/v2/order/user-order-details/" + orderId)

  if (!res.ok) {
    const errMessage = await res.json();
    throw new Error(errMessage.message);
  }

  const data = (await res.json()) as { message: string, success: boolean, order: Order };

  if (!data.success) throw new Error(data.message);
  return data.order;
}
