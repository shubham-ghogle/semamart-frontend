import { useState, ChangeEvent, FormEvent } from "react";

export enum AddressType {
  Home = "Home",
  Work = "Work",
}

export interface Address {
  name: string;
  mobile: string;
  alternatePhone?: string;
  pincode: string;
  locality: string;
  instituteAddress1: string;
  instituteAddress2?: string;
  district: string;
  state: string; 
  landmark?: string;
  addressType: AddressType;
  _id: string;
}


// Initial form data
const initialFormData: Address = {
  name: "",
  mobile: "",
  alternatePhone: "",
  pincode: "",
  locality: "",
  instituteAddress1: "",
  instituteAddress2: "",
  district: "",
  state: "",
  landmark: "",
  addressType: AddressType.Home,
  _id: "",
};

interface Props {
  onSubmit: (data: Address) => void;
}

const AddressForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Address>(initialFormData);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "addressType" ? (value as AddressType) : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      alert("Mobile number must be a 10-digit number.");
      return;
    }

    if (
      !formData.name ||
      !formData.pincode ||
      !formData.locality ||
      !formData.instituteAddress1 ||
      !formData.district ||
      !formData.state
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onSubmit(formData);
    setFormData(initialFormData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-6 rounded shadow grid grid-cols-2 gap-4"
    >
      {/* Name */}
      <label htmlFor="name" className="sr-only">
        Name
      </label>
      <input
        id="name"
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      />

      {/* Mobile */}
      <label htmlFor="mobile" className="sr-only">
        10-digit mobile number
      </label>
      <input
        id="mobile"
        type="text"
        name="mobile"
        placeholder="10-digit mobile number"
        value={formData.mobile}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      />

      {/* Pincode */}
      <label htmlFor="pincode" className="sr-only">
        Pincode
      </label>
      <input
        id="pincode"
        type="text"
        name="pincode"
        placeholder="Pincode"
        value={formData.pincode}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      />

      {/* Locality */}
      <label htmlFor="locality" className="sr-only">
        Locality
      </label>
      <input
        id="locality"
        type="text"
        name="locality"
        placeholder="Locality"
        value={formData.locality}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      />

      {/* Address (textarea, full width) */}
      <label htmlFor="instituteAddress1" className="sr-only">
        Address (Area and Street)
      </label>
      <textarea
        id="instituteAddress1"
        name="instituteAddress1"
        placeholder="Address (Area and Street)"
        value={formData.instituteAddress1}
        onChange={handleChange}
        className="border p-2 rounded col-span-2 resize-none"
        rows={3}
        required
      />

      {/* Address Line 2 */}
      <label htmlFor="instituteAddress2" className="sr-only">
        Address Line 2 (Optional)
      </label>
      <input
        id="instituteAddress2"
        type="text"
        name="instituteAddress2"
        placeholder="Address Line 2 (Optional)"
        value={formData.instituteAddress2}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* District */}
      <label htmlFor="district" className="sr-only">
        City/District/Town
      </label>
      <input
        id="district"
        type="text"
        name="district"
        placeholder="City/District/Town"
        value={formData.district}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      />

      {/* State */}
      <label htmlFor="state" className="sr-only">
        State
      </label>
      <select
        id="state"
        name="state"
        value={formData.state}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      >
        <option value="">--Select State--</option>
        <option value="Bihar">Bihar</option>
        <option value="Uttar Pradesh">Uttar Pradesh</option>
        <option value="Delhi">Delhi</option>
        <option value="Maharashtra">Maharashtra</option>
        {/* Add more states as needed */}
      </select>

      {/* Landmark */}
      <label htmlFor="landmark" className="sr-only">
        Landmark (Optional)
      </label>
      <input
        id="landmark"
        type="text"
        name="landmark"
        placeholder="Landmark (Optional)"
        value={formData.landmark}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* Alternate Phone */}
      <label htmlFor="alternatePhone" className="sr-only">
        Alternate Phone (Optional)
      </label>
      <input
        id="alternatePhone"
        type="text"
        name="alternatePhone"
        placeholder="Alternate Phone (Optional)"
        value={formData.alternatePhone}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* Address Type Radio Buttons */}
      <div className="col-span-2 flex items-center gap-6 mt-2">
        <span className="text-sm font-semibold">Address Type</span>
        <label htmlFor="addressTypeHome" className="flex items-center gap-2 cursor-pointer">
          <input
            id="addressTypeHome"
            type="radio"
            name="addressType"
            value={AddressType.Home}
            checked={formData.addressType === AddressType.Home}
            onChange={handleChange}
            className="cursor-pointer"
          />
          Home
        </label>
        <label htmlFor="addressTypeWork" className="flex items-center gap-2 cursor-pointer">
          <input
            id="addressTypeWork"
            type="radio"
            name="addressType"
            value={AddressType.Work}
            checked={formData.addressType === AddressType.Work}
            onChange={handleChange}
            className="cursor-pointer"
          />
          Work
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4"
      >
        Save Address
      </button>
    </form>
  );
};

export default AddressForm;
