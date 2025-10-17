// File: src/components/Account/MyProfile.tsx
import React, { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { FaPen, FaCheck, FaTimes, FaSpinner,FaChevronDown } from "react-icons/fa";

type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  instituteName: string;
};

const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const validatePhone = (s: string) => /^\+?\d{7,15}$/.test(s.replace(/\s+/g, ""));

const InlineFlash: React.FC<{ text: string; tone?: "success" | "error" | "info" }> = ({
  text,
  tone = "info",
}) => {
  const bg =
    tone === "success"
      ? "bg-green-50 text-green-700 ring-green-100"
      : tone === "error"
      ? "bg-red-50 text-red-700 ring-red-100"
      : "bg-sky-50 text-sky-700 ring-sky-100";
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md ring-1 ${bg}`}
    >
      {text}
    </div>
  );
};

const MyProfile = () => {
  const user = useUserStore((s) => s.user);
  const [showFaqs, setShowFaqs] = useState(false);
  const updateUser = useUserStore((s) => s.updateUser);

  const [profile, setProfile] = useState<ProfileState>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    instituteName: "",
  });

  const [editing, setEditing] = useState({
    name: false,
    email: false,
    phone: false,
    instituteName: false,
  });

  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [saving, setSaving] = useState({
    name: false,
    email: false,
    phone: false,
    instituteName: false,
  });
  const [flash, setFlash] = useState<{ text: string; tone?: "success" | "error" } | null>(
    null
  );

  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const instituteRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        instituteName: user.instituteName || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (editing.name && firstNameRef.current) firstNameRef.current.focus();
    if (editing.email && emailRef.current) emailRef.current.focus();
    if (editing.phone && phoneRef.current) phoneRef.current.focus();
    if (editing.instituteName && instituteRef.current) instituteRef.current.focus();
  }, [editing]);

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), 2800);
    return () => clearTimeout(id);
  }, [flash]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
    if (name === "email") setErrors((err) => ({ ...err, email: undefined }));
    if (name === "phoneNumber") setErrors((err) => ({ ...err, phone: undefined }));
  };

  const handleCancel = (section: keyof typeof editing) => {
    if (!user) return;
    switch (section) {
      case "name":
        setProfile((p) => ({
          ...p,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        }));
        break;
      case "email":
        setProfile((p) => ({ ...p, email: user.email || "" }));
        setErrors((e) => ({ ...e, email: undefined }));
        break;
      case "phone":
        setProfile((p) => ({ ...p, phoneNumber: user.phoneNumber || "" }));
        setErrors((e) => ({ ...e, phone: undefined }));
        break;
      case "instituteName":
        setProfile((p) => ({ ...p, instituteName: user.instituteName || "" }));
        break;
    }
    setEditing((s) => ({ ...s, [section]: false }));
  };

  const saveName = () => {
    setSaving((s) => ({ ...s, name: true }));
    try {
      updateUser({ firstName: profile.firstName, lastName: profile.lastName });
      setFlash({ text: "Name updated", tone: "success" });
      setEditing((s) => ({ ...s, name: false }));
    } catch {
      setFlash({ text: "Could not save name", tone: "error" });
    } finally {
      setSaving((s) => ({ ...s, name: false }));
    }
  };

  const saveEmail = () => {
    if (!validateEmail(profile.email)) {
      setErrors((e) => ({ ...e, email: "Please enter a valid email." }));
      return;
    }
    setSaving((s) => ({ ...s, email: true }));
    try {
      updateUser({ email: profile.email });
      setFlash({ text: "Email updated", tone: "success" });
      setEditing((s) => ({ ...s, email: false }));
    } catch {
      setFlash({ text: "Could not save email", tone: "error" });
    } finally {
      setSaving((s) => ({ ...s, email: false }));
    }
  };

  const savePhone = () => {
    if (!validatePhone(profile.phoneNumber)) {
      setErrors((e) => ({
        ...e,
        phone: "Enter a valid phone (digits, optional +, 7–15 chars).",
      }));
      return;
    }
    setSaving((s) => ({ ...s, phone: true }));
    try {
      updateUser({ phoneNumber: profile.phoneNumber });
      setFlash({ text: "Phone updated", tone: "success" });
      setEditing((s) => ({ ...s, phone: false }));
    } catch {
      setFlash({ text: "Could not save phone", tone: "error" });
    } finally {
      setSaving((s) => ({ ...s, phone: false }));
    }
  };

  const saveInstituteName = () => {
    setSaving((s) => ({ ...s, instituteName: true }));
    try {
      updateUser({ instituteName: profile.instituteName });
      setFlash({ text: "Institute name updated", tone: "success" });
      setEditing((s) => ({ ...s, instituteName: false }));
    } catch {
      setFlash({ text: "Could not save institute name", tone: "error" });
    } finally {
      setSaving((s) => ({ ...s, instituteName: false }));
    }
  };

  // FAQ data
  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: "What happens when I update my email address (or mobile number)?",
      a: "Your login contact changes. Notifications, order updates and account-related communication will be sent to the updated address/number.",
    },
    {
      q: "When will my account be updated with the new email address (or mobile number)?",
      a: "It updates as soon as you confirm any verification (OTP/email code) and save the changes.",
    },
    {
      q: "What happens to my existing SemaMart account when I update my email or mobile number?",
      a: "Updating your contact does not invalidate your account — your order history, saved addresses and preferences remain intact.",
    },
    {
      q: "Does my Seller account get affected when I update my email address?",
      a: "SemaMart uses a single sign-on policy. Changes to your primary contact will reflect across Buyer and Seller profiles associated with this account.",
    },
    {
      q: "How do I change my password?",
      a: <>To change password go to the <strong>Security</strong> or <strong>Change Password</strong> section in account settings. We'll ask for your current password and a new password, and may send an OTP to verify.</>,
    },
    {
      q: "How do I update my profile picture?",
      a: "Open your profile card and click the avatar area (or 'Edit profile'). You'll be able to upload a new picture — accepted formats are usually JPG/PNG and recommended size is square.",
    },
    {
      q: "How do I add or edit addresses?",
      a: <>Use <strong>Manage Addresses</strong> (Account → Manage Addresses). Add a new address or edit/delete existing ones; set one as default for deliveries.</>,
    },
    {
      q: "Will my order history be affected if I update my contact?",
      a: "No — order history remains associated with your account and will continue to be accessible after updating contact details.",
    },
    {
      q: "How do I control notifications and communication preferences?",
      a: <> Go to <strong>Notification Settings</strong> (or Communication Preferences) to toggle email/SMS/push notifications for offers, order updates, and newsletters.</>,
    },
    {
      q: "How do I deactivate or delete my account?",
      a: "Deactivation temporarily disables your account — your data is retained. Deleting the account permanently removes data. For deletion, follow the 'Delete Account' flow in settings or contact support if additional verification is required.",
    },
    {
      q: "Who do I contact for help or disputes?",
      a: <>For account issues contact our support team via <a href="mailto:support@semamart.com" className="text-blue-600 underline">support@semamart.com</a> or use the Help/Support option on the site.</>,
    },
  ];


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
            {flash ? (
              <InlineFlash
                text={flash.text}
                tone={flash.tone === "error" ? "error" : "success"}
              />
            ) : null}
            <div className="text-xs sm:text-sm text-gray-500">
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).getFullYear()
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
                      onClick={saveName}
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
                  editing.name
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
              <input
                name="lastName"
                value={profile.lastName}
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
                      onClick={saveEmail}
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
                    onClick={() => setEditing((s) => ({ ...s, email: true }))}
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
                value={profile.email}
                onChange={handleChange}
                readOnly={!editing.email}
                placeholder="you@example.com"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.email
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
              {errors.email ? (
                <div className="text-sm text-red-600 mt-2">{errors.email}</div>
              ) : null}
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
                      onClick={savePhone}
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
                    onClick={() => setEditing((s) => ({ ...s, phone: true }))}
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
                value={profile.phoneNumber}
                onChange={handleChange}
                readOnly={!editing.phone}
                placeholder="+919876543210"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.phone
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
              {errors.phone ? (
                <div className="text-sm text-red-600 mt-2">{errors.phone}</div>
              ) : null}
            </div>
          </section>

          {/* INSTITUTE NAME */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Institute Name</h3>
                <p className="text-xs text-gray-500">
                  Your organization
                </p>
              </div>

              <div className="flex items-center gap-2">
                {editing.instituteName ? (
                  <>
                    <button
                      onClick={() => handleCancel("instituteName")}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                    >
                      <FaTimes className="text-gray-500" /> Cancel
                    </button>

                    <button
                      onClick={saveInstituteName}
                      disabled={saving.instituteName}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:brightness-105"
                    >
                      {saving.instituteName ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}{" "}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing((s) => ({ ...s, instituteName: true }))}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sky-600 hover:bg-sky-50"
                  >
                    <FaPen /> Edit
                  </button>
                )}
              </div>
            </div>

            <div>
              <input
                ref={instituteRef}
                name="instituteName"
                value={profile.instituteName}
                onChange={handleChange}
                readOnly={!editing.instituteName}
                placeholder="Your institute name"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                  editing.instituteName
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
            </div>
          </section>

         {/* FAQs (dropdown) */}
            <section className="rounded-lg border bg-white p-4 text-sm text-gray-700">
              <button
                onClick={() => setShowFaqs((prev) => !prev)}
                className="w-full flex justify-between items-center font-semibold text-gray-800 text-base focus:outline-none"
              >
              <span>FAQs</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  showFaqs ? "rotate-180 text-sky-600" : "rotate-0 text-gray-500"
                }`}
                size={16}
              />
              </button>

              {showFaqs && (
                <div className="mt-4 space-y-3 animate-fadeIn">
                  {faqs.map((f, i) => (
                    <div key={i}>
                      <div className="font-medium text-gray-800">{f.q}</div>
                      <div className="text-gray-600 mt-1">{f.a}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

        </div>
      </div>
    </div>
  );
};

export default MyProfile;
