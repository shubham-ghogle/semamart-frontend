import React, { useEffect, useState, useRef } from "react";
import { FaPen, FaTimes, FaCheck, FaSpinner } from "react-icons/fa";
import { useSellerStore } from "@/store/sellerStore";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  gstNumber: string;
}

type EditableField = "name" | "email" | "phone" | "businessName" | "gstNumber";

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
  });

  const [editing, setEditing] = useState<Record<EditableField, boolean>>({
    name: false,
    email: false,
    phone: false,
    businessName: false,
    gstNumber: false,
  });

  const [saving, setSaving] = useState<Record<EditableField, boolean>>({
    name: false,
    email: false,
    phone: false,
    businessName: false,
    gstNumber: false,
  });

  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const businessNameRef = useRef<HTMLInputElement>(null);
  const gstNumberRef = useRef<HTMLInputElement>(null);

  // Initialize profile state when seller loads
  useEffect(() => {
    if (seller) {
      setProfile({
        firstName: seller.firstName || "",
        lastName: seller.lastName || "",
        email: seller.email || "",
        phoneNumber: seller.phoneNumber || "",
        businessName: seller.businessName || "",
        gstNumber: seller.gstNumber || "",
      });
    }
  }, [seller]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editing.name && firstNameRef.current) firstNameRef.current.focus();
    if (editing.email && emailRef.current) emailRef.current.focus();
    if (editing.phone && phoneRef.current) phoneRef.current.focus();
    if (editing.businessName && businessNameRef.current) businessNameRef.current.focus();
    if (editing.gstNumber && gstNumberRef.current) gstNumberRef.current.focus();
  }, [editing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = (field: EditableField) => {
    if (!seller) return;

    setProfile((prev) => ({
      ...prev,
      firstName: field === "name" ? seller.firstName || prev.firstName : prev.firstName,
      lastName: field === "name" ? seller.lastName || prev.lastName : prev.lastName,
      email: field === "email" ? seller.email || prev.email : prev.email,
      phoneNumber: field === "phone" ? seller.phoneNumber || prev.phoneNumber : prev.phoneNumber,
      businessName: field === "businessName" ? seller.businessName || prev.businessName : prev.businessName,
      gstNumber: field === "gstNumber" ? seller.gstNumber || prev.gstNumber : prev.gstNumber,
    }));

    setEditing((prev) => ({ ...prev, [field]: false }));
  };

  const saveField = (field: EditableField) => {
    setSaving((prev) => ({ ...prev, [field]: true }));

    const updatedFields: Partial<Profile> = {};

    if (field === "name") {
      updatedFields.firstName = profile.firstName;
      updatedFields.lastName = profile.lastName;
    } else if (field === "phone") {
      updatedFields.phoneNumber = profile.phoneNumber;
    } else {
      updatedFields[field] = profile[field] as string;
    }

    updateSeller(updatedFields);

    setEditing((prev) => ({ ...prev, [field]: false }));
    setSaving((prev) => ({ ...prev, [field]: false }));
  };

  const renderInputField = (
    field: EditableField,
    value: string,
    placeholder: string,
    ref?: React.RefObject<HTMLInputElement>
  ) => (
    <input
      ref={ref}
      name={field === "phone" ? "phoneNumber" : field === "name" ? "firstName" : field}
      value={value}
      onChange={handleChange}
      readOnly={!editing[field]}
      placeholder={placeholder}
      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
        editing[field] ? "bg-white border-sky-200" : "bg-gray-100 border-transparent"
      }`}
    />
  );

  return (
    <div className="flex-1 px-4 sm:px-6 py-4">
      <div className="mx-auto bg-white rounded-2xl shadow-md overflow-visible max-w-[1100px] pb-6">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Personal Information
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account details</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs sm:text-sm text-gray-500">
              Member since {seller?.createdAt ? new Date(seller.createdAt).getFullYear() : "—"}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(100vh-160px)] sm:max-h-none overflow-auto">
          {/* NAME */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Name</h3>
                <p className="text-xs text-gray-500">Your full name shown on orders</p>
              </div>
              <div className="flex items-center gap-2">
                {editing.name ? (
                  <>
                    <button
                      title="Cancel"
                      onClick={() => handleCancel("name")}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                    >
                      <FaTimes className="text-gray-500" /> Cancel
                    </button>
                    <button
                      onClick={() => saveField("name")}
                      disabled={saving.name}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105"
                    >
                      {saving.name ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing((s) => ({ ...s, name: true }))}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                ref={firstNameRef}
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                readOnly={!editing.name}
                placeholder="First name"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.name ? "bg-white border-sky-200" : "bg-gray-100 border-transparent"
                }`}
              />
              <input
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                readOnly={!editing.name}
                placeholder="Last name"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.name ? "bg-white border-sky-200" : "bg-gray-100 border-transparent"
                }`}
              />
            </div>
          </section>

          {/* EMAIL */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Email Address</h3>
                <p className="text-xs text-gray-500">Used for sign-in and notifications</p>
              </div>
              <div className="flex items-center gap-2">
                {editing.email ? (
                  <>
                    <button
                      onClick={() => handleCancel("email")}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                    >
                      <FaTimes className="text-gray-500" /> Cancel
                    </button>
                    <button
                      onClick={() => saveField("email")}
                      disabled={saving.email}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105"
                    >
                      {saving.email ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing((s) => ({ ...s, email: true }))}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>
            {renderInputField("email", profile.email, "Your email", emailRef)}
          </section>

          {/* PHONE */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Phone Number</h3>
                <p className="text-xs text-gray-500">Used for contact</p>
              </div>
              <div className="flex items-center gap-2">
                {editing.phone ? (
                  <>
                    <button
                      onClick={() => handleCancel("phone")}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                    >
                      <FaTimes className="text-gray-500" /> Cancel
                    </button>
                    <button
                      onClick={() => saveField("phone")}
                      disabled={saving.phone}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105"
                    >
                      {saving.phone ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing((s) => ({ ...s, phone: true }))}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>
            {renderInputField("phone", profile.phoneNumber, "Phone number", phoneRef)}
          </section>

          {/* BUSINESS NAME */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Business Name</h3>
              </div>
              <div className="flex items-center gap-2">
                {editing.businessName ? (
                  <>
                    <button
                      onClick={() => handleCancel("businessName")}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                    >
                      <FaTimes className="text-gray-500" /> Cancel
                    </button>
                    <button
                      onClick={() => saveField("businessName")}
                      disabled={saving.businessName}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105"
                    >
                      {saving.businessName ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing((s) => ({ ...s, businessName: true }))}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>
            {renderInputField("businessName", profile.businessName, "Your business name", businessNameRef)}
          </section>

          {/* GST NUMBER */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">GST Number</h3>
              </div>
              <div className="flex items-center gap-2">
                {editing.gstNumber ? (
                  <>
                    <button
                      onClick={() => handleCancel("gstNumber")}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                    >
                      <FaTimes className="text-gray-500" /> Cancel
                    </button>
                    <button
                      onClick={() => saveField("gstNumber")}
                      disabled={saving.gstNumber}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105"
                    >
                      {saving.gstNumber ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing((s) => ({ ...s, gstNumber: true }))}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>
            {renderInputField("gstNumber", profile.gstNumber, "Your GST number", gstNumberRef)}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SellerAccount;
