import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useUserStore } from "@/store/userStore";
import type { Address } from "@/Types/types";
import { API_URL } from "@/data";

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

type NotificationType = "success" | "error" | "info";

const ManageAddress = () => {
  const { user } = useUserStore((state) => state);
  const [formData, setFormData] = useState<Address>(initialFormData);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: NotificationType;
    message: string;
  }>({ visible: false, type: "info", message: "" });

  // Confirm modal state
  const [confirm, setConfirm] = useState<{
    visible: boolean;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({ visible: false, message: "" });

  useEffect(() => {
    if (!user?._id) return;

    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}user/${user._id}/addresses`);
        if (!res.ok) throw new Error("Failed to fetch addresses");
        const data = await res.json();
        setAddresses(data || []);
      } catch (error) {
        showNotification(`Error loading addresses: ${(error as Error).message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const showNotification = (message: string, type: NotificationType = "info", duration = 3500) => {
    setNotification({ visible: true, type, message });
    if (duration > 0) {
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
      }, duration);
    }
  };

  const showConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirm({ visible: true, message, onConfirm, onCancel });
  };

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
      showNotification("User not logged in", "error");
      return;
    }

    // Use custom confirm modal
    showConfirm("Are you sure you want to delete this address?", async () => {
      // onConfirm
      setConfirm({ visible: false, message: "" });
      try {
        const res = await fetch(`${API_URL}user/${user._id}/addresses/${addressId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to delete address");
        }

        showNotification("Address deleted successfully!", "success");
        // Remove address from local state
        setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
        // If currently editing this address, reset form
        if (editingAddressId === addressId) {
          setFormData(initialFormData);
          setEditingAddressId(null);
          setShowForm(false);
        }
      } catch (error: any) {
        showNotification(`Failed to delete address: ${error.message}`, "error");
      }
    }, () => {
      // onCancel
      setConfirm({ visible: false, message: "" });
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validations
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      showNotification("Mobile number must be a 10-digit number.", "error");
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
      showNotification("Please fill all required fields.", "error");
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
      showNotification(`${formData.addressType} address already exists.`, "error");
      return;
    }

    if (!user?._id) {
      showNotification("User not logged in", "error");
      return;
    }

    try {
      let res;

      if (editingAddressId) {
        // Update address
        res = await fetch(
          `${API_URL}user/${user._id}/addresses/${editingAddressId}`,
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
        res = await fetch(`${API_URL}user/${user._id}/addresses`, {
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

      showNotification(editingAddressId ? "Address updated successfully!" : "Address added successfully!", "success");
    } catch (error: any) {
      showNotification(`Failed to save address: ${error.message}`, "error");
    }
  };

  return (
    <div className="flex-1 p-6 bg-white shadow-lg  m-6 rounded-r-2xl">
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
          {/* Name */}
          <div>
            <label htmlFor="reciever_name" className="block text-sm font-medium mb-1">
              Name <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="reciever_name"
              type="text"
              name="reciever_name"
              placeholder="Name"
              value={formData.reciever_name}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
              aria-required="true"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Mobile Number <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="text"
              name="phone"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
              aria-required="true"
            />
          </div>

          {/* Pincode */}
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium mb-1">
              Pincode <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="pincode"
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
              aria-required="true"
            />
          </div>

          {/* Address 1 (textarea) full width */}
          <div className="col-span-2">
            <label htmlFor="instituteAddress1" className="block text-sm font-medium mb-1">
              Address (Area and Street) <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <textarea
              id="instituteAddress1"
              name="instituteAddress1"
              placeholder="Address (Area and Street)"
              value={formData.instituteAddress1}
              onChange={handleChange}
              className="border p-2 rounded w-full resize-none"
              rows={3}
              required
              aria-required="true"
            />
          </div>

          {/* Address 2 */}
          <div>
            <label htmlFor="instituteAddress2" className="block text-sm font-medium mb-1">
              Address Line 2
            </label>
            <input
              id="instituteAddress2"
              type="text"
              name="instituteAddress2"
              placeholder="Address Line 2 (Optional)"
              value={formData.instituteAddress2}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* District */}
          <div>
            <label htmlFor="district" className="block text-sm font-medium mb-1">
              City / District / Town <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="district"
              type="text"
              name="district"
              placeholder="City/District/Town"
              value={formData.district}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
              aria-required="true"
            />
          </div>

          {/* State select */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">
              State <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
              aria-required="true"
            >
              <option value="">--Select State--</option>
              <option value="Bihar">Bihar</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="landmark" className="block text-sm font-medium mb-1">
              Landmark
            </label>
            <input
              id="landmark"
              type="text"
              name="landmark"
              placeholder="Landmark (Optional)"
              value={formData.landmark}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Alternate Phone */}
          <div>
            <label htmlFor="alternatePhone" className="block text-sm font-medium mb-1">
              Alternate Phone
            </label>
            <input
              id="alternatePhone"
              type="text"
              name="alternatePhone"
              placeholder="Alternate Phone (Optional)"
              value={formData.alternatePhone}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Address Type as fieldset */}
          <fieldset className="col-span-2 mt-2 border-t pt-3">
            <legend className="text-sm font-semibold mb-2">Address Type <span aria-hidden="true" className="text-red-500">*</span></legend>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  id="addressType_home"
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === "Home"}
                  onChange={handleChange}
                  required
                />
                <span className="ml-1">Home</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  id="addressType_work"
                  type="radio"
                  name="addressType"
                  value="Work"
                  checked={formData.addressType === "Work"}
                  onChange={handleChange}
                />
                <span className="ml-1">Work</span>
              </label>
            </div>
          </fieldset>

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

      {/* Notification (Toast) */}
      {notification.visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 max-w-xs shadow-lg rounded p-3"
          style={{
            background:
              notification.type === "success"
                ? "linear-gradient(90deg,#ECFDF5,#D1FAE5)"
                : notification.type === "error"
                ? "linear-gradient(90deg,#FFF1F2,#FEE2E2)"
                : "linear-gradient(90deg,#EFF6FF,#DBEAFE)",
            color: "#0f172a",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {notification.type === "success" && <strong>✓</strong>}
              {notification.type === "error" && <strong>✕</strong>}
              {notification.type === "info" && <strong>ℹ</strong>}
            </div>
            <div className="text-sm">{notification.message}</div>
            <button
              aria-label="close notification"
              onClick={() => setNotification((prev) => ({ ...prev, visible: false }))}
              className="ml-2 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm.visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => {
            // clicking backdrop cancels
            confirm.onCancel?.();
            setConfirm({ visible: false, message: "" });
          }} />
          <div className="bg-white rounded shadow-lg z-10 max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Confirm</h3>
            <p className="mb-6">{confirm.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  confirm.onCancel?.();
                  setConfirm({ visible: false, message: "" });
                }}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirm.onConfirm?.();
                  setConfirm({ visible: false, message: "" });
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAddress;
