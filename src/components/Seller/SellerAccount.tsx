import React, { useEffect, useState, useRef } from "react";
import { FaPen, FaTimes, FaCheck, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSellerStore } from "@/store/sellerStore";
import { API_URL } from "@/data";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessType?: string;
  gstNumber: string;
  password?: string;
}

type EditableField = keyof Profile;

const SellerAccount: React.FC = () => {
  const seller = useSellerStore((state) => state.seller);
  const updateSellerStore = useSellerStore((state) => state.updateSeller);

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    businessType: "",
    gstNumber: "",
    password: "",
  });

  const [editing, setEditing] = useState<Record<EditableField, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    businessName: false,
    businessType: false,
    gstNumber: false,
    password: false,
  });

  const [saving, setSaving] = useState<Record<EditableField, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    businessName: false,
    businessType: false,
    gstNumber: false,
    password: false,
  });

  const refs: Record<EditableField, React.RefObject<HTMLInputElement>> = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phoneNumber: useRef<HTMLInputElement>(null),
    businessName: useRef<HTMLInputElement>(null),
    businessType: useRef<HTMLInputElement>(null),
    gstNumber: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };

  const [showModal, setShowModal] = useState(false);

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

  const [notification, setNotification] = useState<{ visible: boolean; type: "success" | "error" | "info"; message: string }>({
    visible: false,
    type: "info",
    message: "",
  });

  // Populate profile from seller store
  useEffect(() => {
    if (seller) {
      setProfile({
        firstName: seller.firstName || "",
        lastName: seller.lastName || "",
        email: seller.email || "",
        phoneNumber: seller.phoneNumber || "",
        businessName: seller.businessName || "",
        businessType: (seller as any).businessType || "",
        gstNumber: seller.gstNumber || "",
        password: "",
      });
    }
  }, [seller]);

  // Focus input when editing
  useEffect(() => {
    (Object.keys(editing) as EditableField[]).forEach((field) => {
      if (editing[field] && refs[field]?.current) {
        refs[field].current!.focus();
      }
    });
  }, [editing]);

  const showNotification = (message: string, type: "success" | "error" | "info" = "info", duration = 3500) => {
    setNotification({ visible: true, type, message });
    if (duration > 0) {
      setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), duration);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name as keyof Profile]: value }));
  };

  const handleCancel = (field: EditableField) => {
    if (!seller) return;
    setProfile((prev) => ({ ...prev, [field]: (seller as any)[field] || "" }));
    setEditing((prev) => ({ ...prev, [field]: false }));
  };

  const saveField = async (field: EditableField) => {
    setSaving((prev) => ({ ...prev, [field]: true }));

    try {
      if (!seller) throw new Error("Seller not loaded");

      const allowedServerFieldMap: Partial<Record<EditableField, string>> = {
        firstName: "firstName",
        lastName: "lastName",
        businessName: "businessName",
        businessType: "businessType",
      };

      const serverKey = allowedServerFieldMap[field];
      if (!serverKey) {
        setEditing((prev) => ({ ...prev, [field]: false }));
        setSaving((prev) => ({ ...prev, [field]: false }));
        return;
      }

      const payload: any = {};
      payload[serverKey] = profile[field];

      const res = await fetch(API_URL+"shop/update-seller-info", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = body?.message || "Failed to update profile.";
        showNotification(msg, "error");
        throw new Error(msg);
      }

      const updatedShop = body?.shop || body?.seller || null;

      if (updatedShop) {
        updateSellerStore(updatedShop);
        setProfile((prev) => ({ ...prev, ...updatedShop }));
        showNotification("Profile updated successfully", "success");
      } else {
        updateSellerStore(payload as any);
        showNotification("Profile updated", "success");
      }
    } catch (err: any) {
      console.error("Failed to update seller:", err);
      if (!notification.visible) showNotification(err.message || "Failed to update profile", "error");
    } finally {
      setEditing((prev) => ({ ...prev, [field]: false }));
      setSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async () => {
    setPasswordMessage("");
    setPasswordSuccess(false);

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordMessage("Please fill all fields.");
      showNotification("Please fill all password fields.", "error");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      showNotification("New passwords do not match.", "error");
      return;
    }

    try {
      setSavingPassword(true);

      const res = await fetch(API_URL+"shop/update-seller-password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = body?.message || "Failed to update password.";
        setPasswordSuccess(false);
        setPasswordMessage(msg);
        showNotification(msg, "error");
        return;
      }

      setPasswordSuccess(true);
      setPasswordMessage(body?.message || "Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowModal(false);
      showNotification("Password updated successfully!", "success");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Failed to update password.";
      setPasswordSuccess(false);
      setPasswordMessage(msg);
      showNotification(msg, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const renderEditableField = (
    label: string,
    field: EditableField,
    placeholder: string,
    description?: string
  ) => {
    const isReadOnlyField = field === "email" || field === "phoneNumber" || field === "gstNumber";
    return (
      <section className="rounded-xl border bg-white p-5 shadow-sm hover:shadow transition-shadow" key={field}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">{label}</h3>
            {description && <p className="text-xs text-gray-500">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {!isReadOnlyField && editing[field] ? (
              <>
                <button onClick={() => handleCancel(field)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md hover:bg-gray-100">
                  <FaTimes className="text-gray-500" /> Cancel
                </button>
                <button onClick={() => saveField(field)} disabled={saving[field]} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105 disabled:opacity-70">
                  {saving[field] ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save
                </button>
              </>
            ) : !isReadOnlyField ? (
              <button onClick={() => setEditing((s) => ({ ...s, [field]: true }))} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50">
                <FaPen /> Edit
              </button>
            ) : (
              <div className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-100">Read only</div>
            )}
          </div>
        </div>

        <input
          ref={refs[field]}
          name={field}
          value={(profile as any)[field] ?? ""}
          onChange={handleChange}
          readOnly={isReadOnlyField ? true : !editing[field]}
          placeholder={placeholder}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none transition-colors ${editing[field] ? "bg-white border-sky-300" : "bg-gray-100 border-transparent"}`}
        />
      </section>
    );
  };

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
            Member since {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
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
            {renderEditableField("Business Type", "businessType", "Enter your business type")}
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
                type="password"
                value="********"
                readOnly
                className="w-full rounded-md border px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-sky-300 outline-none pr-10"
              />
              <button onClick={() => setShowModal(true)} className="ml-3 text-sm text-sky-600 hover:underline">
                Change Password
              </button>
            </div>
          </section>

          {/* Password Modal */}
          {showModal && (
            <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      name="currentPassword"
                      placeholder="Current password"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none pr-10"
                    />
                    <button onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
                      {showCurrent ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      name="newPassword"
                      placeholder="New password"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none pr-10"
                    />
                    <button onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
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
                    <button onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {passwordMessage && <p className={`text-sm mt-2 ${passwordSuccess ? "text-green-600" : "text-red-600"}`}>{passwordMessage}</p>}

                <div className="flex justify-end mt-4 gap-2">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                    Cancel
                  </button>
                  <button onClick={handlePasswordSave} disabled={savingPassword} className="px-4 py-2 rounded-md bg-sky-600 text-white hover:brightness-105 disabled:opacity-70 flex items-center gap-2">
                    {savingPassword ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification (Toast) */}
      {notification.visible && (
        <div role="status" aria-live="polite" className="fixed right-6 bottom-6 z-50 max-w-xs shadow-lg rounded p-3"
             style={{
               background: notification.type === "success" ? "linear-gradient(90deg,#ECFDF5,#D1FAE5)" : notification.type === "error" ? "linear-gradient(90deg,#FFF1F2,#FEE2E2)" : "linear-gradient(90deg,#EFF6FF,#DBEAFE)",
               color: "#0f172a",
             }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{notification.type === "success" ? <strong>✓</strong> : notification.type === "error" ? <strong>✕</strong> : <strong>ℹ</strong>}</div>
            <div className="text-sm">{notification.message}</div>
            <button aria-label="close notification" onClick={() => setNotification((prev) => ({ ...prev, visible: false }))} className="ml-2 text-xs font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAccount;
