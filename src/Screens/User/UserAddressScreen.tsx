import { useState } from "react";
import AddressCard from "../../components/User/AddressCard";
import AddressForm from "../../components/User/AddressForm";
import UserScreenMainWrapper from "../../components/User/UserScreenMainWrapper";
import { useUserStore } from "../../store/userStore";
import { IoAdd } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { User } from "../../Types/types";
import { ScreenOverlayLoaderUi } from "../../components/UI/LoaderUi";
import { toast } from "react-toastify";

export default function UserAddressScreen() {
  const { user, addUser } = useUserStore(state => state)
  const [isFormOpen, setISFormOpen] = useState(false)

  const { mutateAsync: removeAddressAsync, status } = useMutation({
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

  function handleRemoveAddress(id: string) {
    removeAddressAsync(id)
  }

  function handleEditAddress() {
    alert("edited")
  }


  return (
    <UserScreenMainWrapper status="success" heading="Address Book">
      <section className="grid grid-cols-3 w-[800px] mx-auto gap-4">
        <button
          className="border bg-white p-4 rounded-lg shadow-md space-y-2 max-w-64 grid place-items-center"
          onClick={() => setISFormOpen(true)}
        >
          <article>
            <IoAdd size={100} className="text-darkGray" />
            <p className="text-center text-darkGray">Add</p>
          </article>
        </button>
        {user && user.addresses.map((address) => (
          <AddressCard
            key={address._id}
            address={address}
            name={user.firstName + " " + user.lastName}
            onRemove={handleRemoveAddress}
            onEdit={handleEditAddress}
          />
        ))}
      </section>
      {isFormOpen && <AddressForm onCloseModal={() => { setISFormOpen(false) }} />}
      {status === "pending" && <ScreenOverlayLoaderUi label="Please wait..." />}
    </UserScreenMainWrapper>
  )
}
