import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useUserStore } from "@/store/userStore";
import type { Address } from "@/Types/types";

const initialFormData: Address = {
  reciever_name: "",
  phone: "",
  alternatePhone: "",
  pincode: "",
  instituteAddress1: "",
  instituteAddress2: "",
  district: "",
  state: "",
  landmark: "",
  addressType: "",
};

const ManageAddress: React.FC = () => {
  const { user } = useUserStore((state) => state);
  const [formData, setFormData] = useState<Address>(initialFormData);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v2/user/${user._id}/addresses`);
        if (!res.ok) throw new Error("Failed to fetch addresses");
        const data = await res.json();
        setAddresses(data || []);
      } catch (error) {
        alert(`Error loading addresses: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // When user clicks "Edit" button on an address:
  const handleEditClick = (address: Address) => {
    setFormData(address);
    setEditingAddressId(address._id || null);
    setShowForm(true);
  };

  // When user clicks "Delete" button on an address:
  const handleDeleteClick = async (addressId: string) => {
    if (!user?._id) {
      alert("User not logged in");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/v2/user/${user._id}/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete address");
      }

      alert("Address deleted successfully!");
      // Remove address from local state
      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      // If currently editing this address, reset form
      if (editingAddressId === addressId) {
        setFormData(initialFormData);
        setEditingAddressId(null);
        setShowForm(false);
      }
    } catch (error: any) {
      alert(`Failed to delete address: ${error.message}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validations
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert("Mobile number must be a 10-digit number.");
      return;
    }

    if (
      !formData.reciever_name ||
      !formData.pincode ||
      !formData.instituteAddress1 ||
      !formData.district ||
      !formData.state ||
      !formData.addressType
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Check if addressType already exists for new adds or for editing a different address
    if (
      addresses.some(
        (addr) =>
          addr.addressType === formData.addressType &&
          addr._id !== editingAddressId
      )
    ) {
      alert(`${formData.addressType} address already exists.`);
      return;
    }

    if (!user?._id) {
      alert("User not logged in");
      return;
    }

    try {
      let res;

      if (editingAddressId) {
        // Update address
        res = await fetch(
          `/api/v2/user/${user._id}/addresses/${editingAddressId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
      } else {
        // Add new address
        res = await fetch(`/api/v2/user/${user._id}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save address");
      }

      if (editingAddressId) {
        const updatedAddress = await res.json();
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingAddressId ? updatedAddress : addr
          )
        );
      } else {
        // For POST, backend might return the full updated list or just the new address
        const data = await res.json();
        if (data.addresses) {
          setAddresses(data.addresses);
        } else {
          setAddresses((prev) => [...prev, data]);
        }
      }

      setFormData(initialFormData);
      setShowForm(false);
      setEditingAddressId(null);

      alert(editingAddressId ? "Address updated successfully!" : "Address added successfully!");
    } catch (error: any) {
      alert(`Failed to save address: ${error.message}`);
    }
  };

  return (
    <div className="flex-1 p-6 bg-white shadow-lg font-montserrat m-6">
      <h2 className="text-lg font-semibold mb-4">Manage Addresses</h2>

      {!showForm && (
        <button
          onClick={() => {
            setFormData(initialFormData);
            setEditingAddressId(null);
            setShowForm(true);
          }}
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
            name="phone"
            placeholder="10-digit mobile number"
            value={formData.phone}
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
                value="Home"
                checked={formData.addressType === "Home"}
                onChange={handleChange}
                required
              />
              Home
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="addressType"
                value="Work"
                checked={formData.addressType === "Work"}
                onChange={handleChange}
              />
              Work
            </label>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-4 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAddressId(null);
                setFormData(initialFormData);
              }}
              className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingAddressId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading addresses...</p>}

      {/* Display Saved Addresses */}
      {!loading && (
        <>
          {addresses.length === 0 ? (
            <p>No addresses found.</p>
          ) : (
            <ul className="list-disc ml-6">
              {addresses.map((addr) => (
                <li
                  key={addr._id || addr.addressType}
                  className="mb-4 border border-gray-300 rounded p-4 relative"
                >
                  <div className="inline-block bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded uppercase mb-2">
                    {addr.addressType}
                  </div>
                  <p>
                    <strong>Name:</strong> {addr.reciever_name}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {addr.phone}
                  </p>
                  <p>
                    <strong>Address 1:</strong> {addr.instituteAddress1}
                  </p>
                  {addr.instituteAddress2 && (
                    <p>
                      <strong>Address 2:</strong> {addr.instituteAddress2}
                    </p>
                  )}
                  <p>
                    <strong>District:</strong> {addr.district}
                  </p>
                  <p>
                    <strong>State:</strong> {addr.state}
                  </p>
                  <p>
                    <strong>Pincode:</strong> {addr.pincode}
                  </p>
                  {addr.landmark && (
                    <p>
                      <strong>Landmark:</strong> {addr.landmark}
                    </p>
                  )}
                  {addr.alternatePhone && (
                    <p>
                      <strong>Alternate Phone:</strong> {addr.alternatePhone}
                    </p>
                  )}

                  {/* Edit/Delete buttons */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleEditClick(addr)}
                      className="text-blue-600 cursor-pointer text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => addr._id && handleDeleteClick(addr._id)}
                      className="text-red-600 cursor-pointer text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default ManageAddress;
