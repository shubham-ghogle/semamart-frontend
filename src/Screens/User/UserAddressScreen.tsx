import { useState } from "react";
import AddressCard from "../../components/User/AddressCard";
import AddressForm from "../../components/User/AddressForm";
import UserScreenMainWrapper from "../../components/User/UserScreenMainWrapper";
import { useUserStore } from "../../store/userStore";
import { IoAdd } from "react-icons/io5";

export default function UserAddressScreen() {
  const user = useUserStore(state => state.user)
  const [isFormOpen, setISFormOpen] = useState(false)

  function handleRemoveAddress(id: string) {
    alert(id)
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
    </UserScreenMainWrapper>
  )
}
