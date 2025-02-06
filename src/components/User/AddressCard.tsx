import { Address } from "../../Types/types"

type AddressCardProps = {
  address: Address
  name: string
  onRemove: (id: string) => void
  onEdit: (index: number) => void
  index: number
}

export default function AddressCard({ address, name, onRemove, onEdit, index }: AddressCardProps) {
  return (
    <div key={address._id} className="border bg-white p-4 rounded-lg shadow-md space-y-2 max-w-64">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-gray-700">{address.instituteAddress1}</p>
      <p className="text-gray-700">{address.instituteAddress2}</p>
      <p className="text-gray-700"><strong>Landmark:</strong> {address.landmark}</p>
      <p className="text-gray-700">{address.district}, {address.state}, {address.pincode}</p>
      <article className="pt-4 space-x-4">
        <button className="text-darkBlue text-sm" onClick={() => onRemove(address._id)}>Remove</button>
        <button className="text-darkBlue text-sm" onClick={() => onEdit(index)}>Edit</button>
      </article>
    </div>

  )
}
