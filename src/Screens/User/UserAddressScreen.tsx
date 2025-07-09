import { useState } from "react";
import AddressCard from "../../components/User/AddressCard";
import AddressForm from "../../components/User/AddressForm";
import UserScreenMainWrapper from "../../components/User/UserScreenMainWrapper";
import { useUserStore } from "../../store/userStore";
import { IoAdd } from "react-icons/io5";
import { ScreenOverlayLoaderUi } from "../../components/UI/LoaderUi";
import { useRemoveAddress } from "./User.HooksUtils";

export default function UserAddressScreen() {
  const { user } = useUserStore(state => state)
  const [isFormOpen, setISFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [editAddIndex, setEditaddIndex] = useState<null | number>(null)

  const { removeAddressAsync, removeAddStatus } = useRemoveAddress()

  function handleRemoveAddress(id: string) {
    removeAddressAsync(id)
  }

  function handleEditAddress(i: number) {
    setEditaddIndex(i)
    setIsEditFormOpen(true)
  }


  return (
    <UserScreenMainWrapper status="success" heading="Address Book">
      {user && (
        <>
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
            {user && user.addresses.map((address, i) => (
              <AddressCard
                key={address._id}
                address={address}
                name={user.firstName + " " + user.lastName}
                onRemove={handleRemoveAddress}
                onEdit={handleEditAddress}
                index={i}
              />
            ))}
          </section>
          {isFormOpen && <AddressForm isEditing={false} onCloseModal={() => { setISFormOpen(false) }} />}
          {isEditFormOpen && editAddIndex !== null && (
            <AddressForm initialData={user?.addresses[editAddIndex]} isEditing={true} onCloseModal={() => { setIsEditFormOpen(false) }} />
          )}
          {removeAddStatus === "pending" && <ScreenOverlayLoaderUi label="Please wait..." />}
        </>
      )}
    </UserScreenMainWrapper>
  )
}
