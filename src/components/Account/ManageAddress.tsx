import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useUserStore } from "@/store/userStore";

const ManageAddress: React.FC = () => {
   const { user } = useUserStore((state) => state);
  enum AddressType {
    Home = "Home",
    Work = "Work",
  }

  interface Address {
    reciever_name: string;
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
    _id?: string; // optional because new address won't have one
  }

  const initialFormData: Address = {
    reciever_name: "",
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
  };

  const [formData, setFormData] = useState<Address>(initialFormData);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Fetch addresses on mount - public API, no auth token
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/v2/addresses"); // your new public GET endpoint for addresses
        if (!res.ok) throw new Error("Failed to fetch addresses");

        const data = await res.json();
        setAddresses(data.addresses || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAddresses();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "addressType" ? (value as AddressType) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!/^[0-9]{10}$/.test(formData.mobile)) {
    alert("Mobile number must be a 10-digit number.");
    return;
  }

  if (
    !formData.reciever_name ||
    !formData.pincode ||
    !formData.locality ||
    !formData.instituteAddress1 ||
    !formData.district ||
    !formData.state
  ) {
    alert("Please fill all required fields.");
    return;
  }

  if (addresses.some((addr) => addr.addressType === formData.addressType)) {
    alert(`${formData.addressType} address already exists.`);
    return;
  }

  try { 
    const userId = user?._id;
    console.log("my user:",userId);
    const addressToSend = {
      userId,
      addresses: [formData],
    };

    const res = await fetch("/api/v2/user/add-user-address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addressToSend),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add address");
    }

    const data = await res.json();

    setAddresses(data.addresses);
    setFormData(initialFormData);
    setShowForm(false);
    alert("Address added successfully!");
  } catch (error: any) {
    alert(`Failed to add address: ${error.message}`);
  }
};


  return (
    <div className="flex-1 p-6 bg-white shadow-lg font-montserrat m-6">
      <h2 className="text-lg font-semibold mb-4">Manage Addresses</h2>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border border-gray-300 text-blue-600 text-sm font-medium py-3 px-4 rounded mb-4 flex items-center gap-2 hover:bg-gray-50"
        >
          <span className="text-xl font-bold">+</span> ADD A NEW ADDRESS
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-4 rounded grid grid-cols-2 gap-4 mb-6"
        >
          <input
            type="text"
            name="reciever_name"
            placeholder="Name"
            value={formData.reciever_name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="mobile"
            placeholder="10-digit mobile number"
            value={formData.mobile}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="locality"
            placeholder="Locality"
            value={formData.locality}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <textarea
            name="instituteAddress1"
            placeholder="Address (Area and Street)"
            value={formData.instituteAddress1}
            onChange={handleChange}
            className="border p-2 rounded col-span-2 resize-none"
            rows={3}
            required
          />
          <input
            type="text"
            name="instituteAddress2"
            placeholder="Address Line 2 (Optional)"
            value={formData.instituteAddress2}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="district"
            placeholder="City/District/Town"
            value={formData.district}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <select
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
          </select>
          <input
            type="text"
            name="landmark"
            placeholder="Landmark (Optional)"
            value={formData.landmark}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="alternatePhone"
            placeholder="Alternate Phone (Optional)"
            value={formData.alternatePhone}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* Address Type */}
          <div className="col-span-2 flex items-center gap-4 mt-2">
            <span className="text-sm font-semibold">Address Type:</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="addressType"
                value={AddressType.Home}
                checked={formData.addressType === AddressType.Home}
                onChange={handleChange}
              />
              Home
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="addressType"
                value={AddressType.Work}
                checked={formData.addressType === AddressType.Work}
                onChange={handleChange}
              />
              Work
            </label>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-4 mt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Display Added Addresses */}
      {addresses.map((addr) => (
        <div
          key={addr._id}
          className="relative border border-gray-300 rounded p-4 mb-4"
        >
          <div className="inline-block bg-gray-200 text-gray-700 text-[10px] font-semibold px-2 py-[2px] rounded uppercase mb-2">
            {addr.addressType}
          </div>

          <div className="text-sm font-semibold mb-1">
            {addr.reciever_name}{" "}
            <span className="ml-4 font-normal">{addr.mobile}</span>
          </div>

          <p className="text-sm text-gray-700">
            {addr.locality}, {addr.instituteAddress1}
            {addr.instituteAddress2 && `, ${addr.instituteAddress2}`},{" "}
            {addr.district}, {addr.state} –{" "}
            <span className="font-bold">{addr.pincode}</span>
          </p>

          {addr.landmark && (
            <p className="text-sm text-gray-500 mt-1">Landmark: {addr.landmark}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ManageAddress;
