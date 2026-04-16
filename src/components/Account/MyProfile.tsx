import React, { useEffect, useState, useRef } from "react";
import {
  FaPen,
  FaTimes,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import { useUserStore } from "@/store/userStore";
import { toast } from "react-toastify";
import { requestEmailChange } from "@/Screens/LoginScreen/EmailChange.Hooks";


const inputBase =
  "w-full rounded-md border px-3 py-2 text-sm focus:outline-none transition";

const ProfileForm = () => {
  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);


  const [profile, setProfile] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    instituteName: "",
  });

  const [editing, setEditing] = useState({
    name: false,
    institute: false,
  });

  const [saving, setSaving] = useState({
    name: false,
    institute: false,
  });
  const [newEmail, setNewEmail] = useState("");
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);




  const firstNameRef = useRef<HTMLInputElement>(null);
  const instituteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCancel = (field: "name" | "institute") => {
    if (user) setProfile(user);
    setEditing((prev) => ({ ...prev, [field]: false }));
  };

  const saveField = async (field: "name" | "institute") => {
    setSaving((prev) => ({ ...prev, [field]: true }));

    try {
      let payload: any = {};

      if (field === "name") {
        payload = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        };
      }

      if (field === "institute") {
        payload = { instituteName: profile.instituteName };
      }

      const updated = await updateUser(payload);
      if (updated) setProfile((prev: any) => ({ ...prev, ...updated }));

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.success("Failed to update profile");
    } finally {
      setEditing((prev) => ({ ...prev, [field]: false }));
      setSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter new email.");
      return;
    }
    try {
      setRequestingEmailChange(true);
      const data = await requestEmailChange("user", newEmail.trim());
      toast.success(data?.message || "Confirmation link sent to your current email.");
      setNewEmail("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to request email change.");
    } finally {
      setRequestingEmailChange(false);
    }
  };

  // const handlePasswordSave = async () => {
  //   setPasswordMessage("");
  //   setPasswordSuccess(false);

  //   if (
  //     !passwords.currentPassword ||
  //     !passwords.newPassword ||
  //     !passwords.confirmPassword
  //   ) {
  //     setPasswordMessage("Please fill all fields.");
  //     return;
  //   }

  //   if (passwords.newPassword !== passwords.confirmPassword) {
  //     setPasswordMessage("New passwords do not match.");
  //     return;
  //   }

  //   try {
  //     setSavingPassword(true);

  //     const res = await fetch(API_URL + "user/update-user-password", {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         oldPassword: passwords.currentPassword,
  //         newPassword: passwords.newPassword,
  //         confirmPassword: passwords.confirmPassword,
  //       }),
  //     });

  //     const body = await res.json();

  //     if (!res.ok) throw new Error(body?.message);

  //     alert(body.message);
  //     setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  //     setShowModal(false);
  //   } catch (err: any) {
  //     setPasswordMessage(err.message || "Failed to update password");
  //   } finally {
  //     setSavingPassword(false);
  //   }
  // };

  return (
    <div className="flex-1 px-4 sm:px-6 py-4">
      <div className="w-full bg-white rounded-2xl shadow-md pb-6">
        {/* HEADER */}
        <div className="px-5 py-4 border-b flex justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h1>
            <p className="text-sm text-gray-500">
              Manage your account details
            </p>
          </div>

          <div className="text-sm text-gray-500">
           Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* NAME */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Name</h3>
                <p className="text-xs text-gray-500">
                  Your full name shown on orders
                </p>
              </div>

              {editing.name ? (
                <div className="flex gap-2">
                  <button onClick={() => handleCancel("name")}>
                    <FaTimes />
                  </button>
                  <button
                    onClick={() => saveField("name")}
                    disabled={saving.name}
                  >
                    {saving.name ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditing((s) => ({ ...s, name: true }));
                    setTimeout(() => firstNameRef.current?.focus(), 50);
                  }}
                  className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700"
                >
                  <FaPen /> Edit
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input
                ref={firstNameRef}
                name="firstName"
                value={profile.firstName || ""}
                onChange={handleChange}
                readOnly={!editing.name}
                placeholder="First name"
                className={`${inputBase} ${
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
                className={`${inputBase} ${
                  editing.name
                    ? "bg-white border-sky-200"
                    : "bg-gray-100 border-transparent"
                }`}
              />
            </div>
          </section>

          {/* EMAIL */}
          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-medium mb-2">Email Address</h3>
            <input
              value={profile.email || ""}
              readOnly
              className={`${inputBase} bg-gray-100 border-transparent`}
            />
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email to request change"
                className={`${inputBase} bg-white border-sky-200`}
              />
              <button
                type="button"
                onClick={handleRequestEmailChange}
                disabled={requestingEmailChange}
                className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm disabled:opacity-70"
              >
                {requestingEmailChange ? "Sending..." : "Request Email Change"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              A confirmation link will be sent to your current email. Change applies only after link verification.
            </p>
          </section>

          {/* PHONE */}
          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-medium mb-2">Mobile Number</h3>
            <input
              value={profile.phoneNumber || ""}
              readOnly
              className={`${inputBase} bg-gray-100 border-transparent`}
            />
          </section>

          {/* INSTITUTE */}
          <section className="rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-800">Institute Name</h3>
                <p className="text-xs text-gray-500">Your organization</p>
              </div>

              {editing.institute ? (
                <div className="flex gap-2">
                  <button onClick={() => handleCancel("institute")}>
                    <FaTimes />
                  </button>
                  <button
                    onClick={() => saveField("institute")}
                    disabled={saving.institute}
                  >
                    {saving.institute ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditing((s) => ({ ...s, institute: true }));
                    setTimeout(() => instituteRef.current?.focus(), 50);
                  }}
                  className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700"
                >
                  <FaPen /> Edit
                </button>
              )}
            </div>

            <input
              ref={instituteRef}
              name="instituteName"
              value={profile.instituteName || ""}
              onChange={handleChange}
              readOnly={!editing.institute}
              placeholder="Institute name"
              className={`${inputBase} ${
                editing.institute
                  ? "bg-white border-sky-200"
                  : "bg-gray-100 border-transparent"
              }`}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
