import { useState } from "react";
import Input from "../UI/Inputs";
import { Address } from "../../Types/types";
import { ActionBtn } from "../UI/Buttons";
import { useAddAddress, useEditAddress } from "../../Screens/User/User.HooksUtils";

type AddressFormProps = {
  isEditing: false
  onCloseModal: () => void
  initialData?: never;
} | {
  isEditing: true
  initialData: Address;
  onCloseModal: () => void
};


export default function AddressForm({ initialData, onCloseModal, isEditing }: AddressFormProps) {

  const [formData, setFormData] = useState<Partial<Address>>(
    initialData || {
      district: "",
      instituteAddress1: "",
      instituteAddress2: "",
      landmark: "",
      pincode: "",
      state: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { mutateAddress, status } = useAddAddress()
  const { editAddressAsync, editAddStatus } = useEditAddress()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditing) {
      await editAddressAsync({ addressId: initialData._id, formData })
      onCloseModal()
    } else {
      await mutateAddress(formData)
      onCloseModal()
    }
  };

  return (
    <section className="fixed inset-0 z-50 bg-black/50 grid place-items-center" onClick={onCloseModal}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white border p-6 rounded-lg shadow-md max-w-lg mx-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold">Enter Address Details</h2>
        <Input label="Address Line 1" name="instituteAddress1" value={formData.instituteAddress1} onChange={handleChange} required />
        <Input label="Address Line 2" name="instituteAddress2" value={formData.instituteAddress2} onChange={handleChange} />
        <Input label="District" name="district" value={formData.district} onChange={handleChange} required />
        <Input label="Landmark" name="landmark" value={formData.landmark} onChange={handleChange} required />
        <Input label="Pincode" name="pincode" type="number" value={formData.pincode} onChange={handleChange} required />
        <Input label="State" name="state" value={formData.state} onChange={handleChange} required />

        <ActionBtn type="submit" disabled={status === "pending" || editAddStatus === "pending"}>
          {(status === "pending" || editAddStatus === "pending") ? "Wait..." : "Save Address"}
        </ActionBtn>
      </form>
    </section>
  );
};
