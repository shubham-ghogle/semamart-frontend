import React, { useEffect, useState, useRef } from "react";
import { FaPen, FaTimes, FaCheck, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSellerStore } from "@/store/sellerStore";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  gstNumber: string;
  password: string;
}

type EditableField = keyof Profile;

const SellerAccount = () => {
  const seller = useSellerStore((state) => state.seller);
  const updateSeller = useSellerStore((state) => state.updateSeller);

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    gstNumber: "",
    password: "",
  });

  const [editing, setEditing] = useState<Record<EditableField, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    businessName: false,
    gstNumber: false,
    password: false,
  });

  const [saving, setSaving] = useState<Record<EditableField, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    businessName: false,
    gstNumber: false,
    password: false,
  });

  const refs: Record<EditableField, React.RefObject<HTMLInputElement>> = {
    firstName: useRef(null),
    lastName: useRef(null),
    email: useRef(null),
    phoneNumber: useRef(null),
    businessName: useRef(null),
    gstNumber: useRef(null),
    password: useRef(null),
  };

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Password modal state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (seller) {
      setProfile({
        firstName: seller.firstName || "",
        lastName: seller.lastName || "",
        email: seller.email || "",
        phoneNumber: seller.phoneNumber || "",
        businessName: seller.businessName || "",
        gstNumber: seller.gstNumber || "",
        password: "", // do not store real password
      });
    }
  }, [seller]);

  useEffect(() => {
    (Object.keys(editing) as EditableField[]).forEach((field) => {
      if (editing[field] && refs[field]?.current) {
        refs[field]!.current!.focus();
      }
    });
  }, [editing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = (field: EditableField) => {
    if (!seller) return;
    setProfile((prev) => ({
      ...prev,
      [field]: seller[field] || "",
    }));
    setEditing((prev) => ({ ...prev, [field]: false }));
  };

  const saveField = async (field: EditableField) => {
    setSaving((prev) => ({ ...prev, [field]: true }));
    const updatedField = { [field]: profile[field] };
    try {
      await updateSeller(updatedField);
    } catch (error) {
      console.error("Failed to update seller:", error);
    } finally {
      setEditing((prev) => ({ ...prev, [field]: false }));
      setSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Password modal handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async () => {
    setPasswordMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordSuccess(false);
      setPasswordMessage("New passwords do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      // Call update password API here
      setPasswordSuccess(true);
      setPasswordMessage("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setPasswordSuccess(false);
      setPasswordMessage("Failed to update password. Please check your input.");
    } finally {
      setSavingPassword(false);
    }
  };

  const renderEditableField = (
    label: string,
    field: EditableField,
    placeholder: string,
    description?: string
  ) => (
    <section className="rounded-xl border bg-white p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{label}</h3>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {editing[field] ? (
            <>
              <button
                onClick={() => handleCancel(field)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md hover:bg-gray-100"
              >
                <FaTimes className="text-gray-500" /> Cancel
              </button>
              <button
                onClick={() => saveField(field)}
                disabled={saving[field]}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105 disabled:opacity-70"
              >
                {saving[field] ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing((s) => ({ ...s, [field]: true }))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
            >
              <FaPen /> Edit
            </button>
          )}
        </div>
      </div>
      <input
        ref={refs[field]}
        name={field}
        value={profile[field]}
        onChange={handleChange}
        readOnly={!editing[field]}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none transition-colors ${
          editing[field] ? "bg-white border-sky-300" : "bg-gray-100 border-transparent"
        }`}
      />
    </section>
  );

  return (
    <div className="flex-1 px-4 sm:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="mx-auto bg-white rounded-2xl shadow-md overflow-visible max-w-[1100px]">
        {/* Header */}
        <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Seller Account</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your seller profile and account details.</p>
          </div>
          <div className="text-sm text-gray-500 mt-2 sm:mt-0">
            Member since {seller?.createdAt ? new Date(seller.createdAt).getFullYear() : "—"}
          </div>
        </div>

        {/* Profile sections */}
        <div className="p-6 space-y-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {renderEditableField("First Name", "firstName", "Enter your first name")}
            {renderEditableField("Last Name", "lastName", "Enter your last name")}
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-3">Contact Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {renderEditableField("Email Address", "email", "Enter your email", "Used for login and notifications")}
            {renderEditableField("Phone Number", "phoneNumber", "Enter your phone number", "Used for communication")}
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-3">Business Information</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {renderEditableField("Business Name", "businessName", "Enter your business name")}
            {renderEditableField("GST Number", "gstNumber", "Enter your GST number")}
          </div>

          {/* Security Section */}
          <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-3">Security</h2>
          <section className="rounded-xl border bg-white p-5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Password</h3>
            </div>
            <div className="flex items-center gap-3">
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                placeholder="Current password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-md border px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-sky-300 outline-none pr-10"
                readOnly
              />
              <button
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="ml-3 text-sm text-sky-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </section>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
                <h3 className="text-lg font-semibold mb-4">Set New Password</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      name="newPassword"
                      placeholder="New password"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none pr-10"
                    />
                    <button
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none pr-10"
                    />
                    <button
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {passwordMessage && (
                  <p className={`text-sm mt-2 ${passwordSuccess ? "text-green-600" : "text-red-600"}`}>
                    {passwordMessage}
                  </p>
                )}

                <div className="flex justify-end mt-4 gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordSave}
                    disabled={savingPassword}
                    className="px-4 py-2 rounded-md bg-sky-600 text-white hover:brightness-105 disabled:opacity-70 flex items-center gap-2"
                  >
                    {savingPassword ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerAccount;
