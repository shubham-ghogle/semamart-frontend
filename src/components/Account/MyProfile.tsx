import React, { useEffect, useState, useRef } from "react";
import { FaPen, FaTimes, FaCheck, FaSpinner,FaEye, FaEyeSlash } from "react-icons/fa";
import { useUserStore } from "@/store/userStore";
import { useSellerStore } from "@/store/sellerStore";

const ProfileForm = () => {
  const seller = useSellerStore((state) => state.seller);
  const updateSeller = useSellerStore((state) => state.updateSeller);

  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
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
      const [showCurrent, setShowCurrent] = useState(false);
      const [showNew, setShowNew] = useState(false);
      const [showConfirm, setShowConfirm] = useState(false);
  const entityType = seller ? "seller" : user ? "user" : null;

  const [profile, setProfile] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    instituteName: "",
  });

  const [editing, setEditing] = useState({
    name: false,
    email: false,
    phone: false,
    lastField: false,
  });

  const [saving, setSaving] = useState({
    name: false,
    email: false,
    phone: false,
    lastField: false,
  });

  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const lastFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entityType === "seller" && seller) {
      setProfile(seller);
    } else if (entityType === "user" && user) {
      setProfile(user);
    }
  }, [entityType, seller, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };
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

  const handleCancel = (field: string) => {
    if (entityType === "seller" && seller) setProfile(seller);
    else if (entityType === "user" && user) setProfile(user);
    setEditing((prev) => ({ ...prev, [field]: false }));
  };

  const saveField = async (field: string) => {
    setSaving((prev) => ({ ...prev, [field]: true }));
    if (entityType === "seller") {
      await updateSeller(profile);
    } else if (entityType === "user") {
      await updateUser(profile);
    }
    setEditing((prev) => ({ ...prev, [field]: false }));
    setSaving((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <div className="flex-1 px-4 sm:px-6 py-4">
      <div className="mx-auto bg-white rounded-2xl shadow-md overflow-visible max-w-[1100px] pb-6">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Personal Information
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account details
            </p>
          </div>

          <div className="flex items-center gap-3">
           <div className="text-xs sm:text-sm text-gray-500">
              Member since{" "}
              {seller
                ? seller.createdAt
                  ? new Date(seller.createdAt).getFullYear()
                  : "—"
                : user
                ? user.createdAt
                  ? new Date(user.createdAt).getFullYear()
                  : "—"
                : "—"}
            </div>

          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(100vh-160px)] sm:max-h-none overflow-auto">
          {/* NAME */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Name</h3>
                <p className="text-xs text-gray-500">
                  Your full name shown on orders
                </p>
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
                      {saving.name ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}{" "}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setEditing((s) => ({ ...s, name: true }))
                    }
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
                value={profile.firstName || ""}
                onChange={handleChange}
                readOnly={!editing.name}
                placeholder="First name"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.name
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
              <input
                name="lastName"
                value={profile.lastName || ""}
                onChange={handleChange}
                readOnly={!editing.name}
                placeholder="Last name"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.name
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
            </div>
          </section>

          {/* EMAIL */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Email Address</h3>
                <p className="text-xs text-gray-500">
                  Used for sign-in and notifications
                </p>
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
                      {saving.email ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}{" "}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setEditing((s) => ({ ...s, email: true }))
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>

            <div>
              <input
                ref={emailRef}
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                readOnly={!editing.email}
                placeholder="you@example.com"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.email
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
            </div>
          </section>

          {/* PHONE */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Mobile Number</h3>
                <p className="text-xs text-gray-500">
                  Used for order updates and OTP
                </p>
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
                      {saving.phone ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}{" "}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setEditing((s) => ({ ...s, phone: true }))
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>

            <div>
              <input
                ref={phoneRef}
                name="phoneNumber"
                value={profile.phoneNumber || ""}
                onChange={handleChange}
                readOnly={!editing.phone}
                placeholder="+919876543210"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.phone
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
            </div>
          </section>

          {/* LAST FIELD: BUSINESS NAME OR INSTITUTE NAME */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">
                  {entityType === "seller" ? "Business Name" : "Institute Name"}
                </h3>
                <p className="text-xs text-gray-500">
                  {entityType === "seller"
                    ? "Your business name"
                    : "Your organization"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {editing.lastField ? (
                  <>
                    <button
                      onClick={() => handleCancel("lastField")}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                    >
                      <FaTimes className="text-gray-500" /> Cancel
                    </button>
                    <button
                      onClick={() => saveField("lastField")}
                      disabled={saving.lastField}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105"
                    >
                      {saving.lastField ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}{" "}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setEditing((s) => ({ ...s, lastField: true }))
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>

            <div>
              <input
                ref={lastFieldRef}
                name={entityType === "seller" ? "businessName" : "instituteName"}
                value={
                  entityType === "seller"
                    ? profile.businessName || ""
                    : profile.instituteName || ""
                }
                onChange={handleChange}
                readOnly={!editing.lastField}
                placeholder={
                  entityType === "seller"
                    ? "Your business name"
                    : "Your institute name"
                }
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.lastField
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
            </div>
          </section>
          {/* Security Section */}
                    {/* <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-3">Security</h2> */}
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

export default ProfileForm;
