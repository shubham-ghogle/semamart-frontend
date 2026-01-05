import { useState, ChangeEvent, FormEvent } from "react";
import { NavLink } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading, AiOutlineCloseCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/data";

interface SellerForm {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  gstNumber: string;
  phoneNumber: string;
  businessType: string;
  password: string;
  confirmPassword: string;
}

export default function SellerRegistration(): JSX.Element {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<SellerForm>({
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
    gstNumber: "",
    phoneNumber: "",
    businessType: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agree, setAgree] = useState<boolean>(false);
  const [regStatus, setRegStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [showVerificationDialog, setShowVerificationDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: "Personal Details" },
    { id: 2, title: "Business Details" },
    { id: 3, title: "Password Setup" },
  ];

  const labels: Record<string, string> = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    businessName: "Business Name",
    gstNumber: "GST Number",
    phoneNumber: "Phone Number",
    businessType: "Business Type",
    password: "Password",
    confirmPassword: "Confirm Password",
  };

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // GST auto-uppercase
    if (name === "gstNumber") value = value.toUpperCase();

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Phone input: numeric only, max 10 digits
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setFormData((prev) => ({ ...prev, phoneNumber: value }));
    setErrors((prev) => ({ ...prev, phoneNumber: "" }));
  };

  // File input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, which: "banner" | "profile") => {
    const file = e.target.files?.[0] || null;
    if (which === "banner") setBanner(file);
    else setProfilePic(file);
    setErrors((prev) => ({ ...prev, [which === "banner" ? "banner" : "profilePic"]: "" }));
  };

  // Password validation
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("at least 8 chars");
    if (!/[A-Z]/.test(password)) errors.push("1 uppercase");
    if (!/[a-z]/.test(password)) errors.push("1 lowercase");
    if (!/[0-9]/.test(password)) errors.push("1 number");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) errors.push("1 special char");
    return errors;
  };

  // Step validation
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "First name is required.";
      if (!formData.lastName) newErrors.lastName = "Last name is required.";
      if (!formData.email) newErrors.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email.";
    }

    if (step === 2) {
      if (!formData.businessName) newErrors.businessName = "Business name is required.";
      if (!formData.gstNumber) newErrors.gstNumber = "GST number is required.";
      else if (!/^[A-Z0-9]{15}$/.test(formData.gstNumber))
        newErrors.gstNumber = "GST number must be 15 alphanumeric characters.";
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required.";
      else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Phone number must be 10 digits.";
      if (!formData.businessType) newErrors.businessType = "Business type is required.";
      if (!profilePic) newErrors.profilePic = "Profile picture is required.";
    }

    if (step === 3) {
      if (!formData.password) newErrors.password = "Password is required.";
      else {
        const pwdErrors = validatePassword(formData.password);
        if (pwdErrors.length > 0) newErrors.password = "Password must have: " + pwdErrors.join(", ");
      }
      if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
      if (!agree) newErrors.agree = "You must agree to the terms.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(3, s + 1));
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep()) return;

    setRegStatus("pending");

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));
      if (profilePic) form.append("profilePic", profilePic);
      if (banner) form.append("banner", banner);

      const response = await fetch(API_URL+"shop/create-shop", {
        method: "POST",
        body: form,
      });

      const result = await response.json();

      if (!response.ok) {
        setRegStatus("error");
        alert(result.message || "Failed to register seller.");
        return;
      }

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        businessName: "",
        gstNumber: "",
        phoneNumber: "",
        businessType: "",
        password: "",
        confirmPassword: "",
      });
      setBanner(null);
      setProfilePic(null);
      setAgree(false);
      setStep(1);
      setRegStatus("success");

      // --- NEW: show verification dialog and auto-redirect after 5s ---
      setShowVerificationDialog(true);
      setTimeout(() => {
        setShowVerificationDialog(false);
        navigate("/seller");
      }, 5000);
      // --- end NEW ---
    } catch (error) {
      console.error("Error submitting form:", error);
      setRegStatus("error");
      alert("Something went wrong. Please try again later.");
    }
  };

  // useEffect(() => {
  //   if (regStatus === "success") {
  //     alert("Registration successful!");
  //     setFormData({
  //       firstName: "",
  //       lastName: "",
  //       email: "",
  //       businessName: "",
  //       gstNumber: "",
  //       phoneNumber: "",
  //       businessType: "",
  //       password: "",
  //       confirmPassword: "",
  //     });
  //     setBanner(null);
  //     setProfilePic(null);
  //     setAgree(false);
  //     setStep(1);
  //     setRegStatus("idle");
  //   }
  // }, [regStatus]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* LEFT SECTION */}
      <div className="md:w-1/2 w-full text-[#006666] flex flex-col items-center justify-center p-8">
        <NavLink to="/">
          <img src="/Logo-imag.png" width={100} alt="SEMA Favicon Icon" className="mt-1 mx-auto" />
        </NavLink>
        <h1 className="text-3xl font-bold text-center mt-1">Seller Registration</h1>
        <p className="mt-2 text-center text-[#006666] max-w-sm">Join Semamart and grow your medical business</p>
      </div>

      {/* RIGHT SECTION */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-6">
          {/* Stepper */}
          <div className="flex justify-between mb-4">
            {steps.map((s) => (
              <div key={s.id} className="flex-1 text-center">
                <div
                  className={`mx-auto w-8 h-8 rounded-full mb-1 flex items-center justify-center ${
                    step >= s.id ? "bg-[#006666] text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > s.id ? <FaCheckCircle /> : s.id}
                </div>
                <p className={`text-xs ${step === s.id ? "text-[#006666] font-medium" : "text-gray-500"}`}>{s.title}</p>
              </div>
            ))}
          </div>

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              {["firstName", "lastName", "email"].map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {labels[key]} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={key === "email" ? "email" : "text"}
                    name={key}
                    value={formData[key as keyof SellerForm]}
                    onChange={handleChange}
                    className={`mt-1 w-full border rounded px-3 py-2 ${errors[key] ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}

                <button type="button" onClick={nextStep} className="w-full h-10 bg-[#006666] text-white rounded-md mt-2">
                  Next
                </button>

            </div>
          )}

          {/* STEP 2: Business Details */}
          {step === 2 && (
            <div className="space-y-4">
              {["businessName", "gstNumber", "phoneNumber"].map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {labels[key]} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={formData[key as keyof SellerForm]}
                    onChange={key === "phoneNumber" ? handlePhoneChange : handleChange}
                    placeholder={key === "phoneNumber" ? "10-digit phone number" : ""}
                    className={`mt-1 w-full border rounded px-3 py-2 ${errors[key] ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className={`mt-1 w-full border rounded px-3 py-2 ${errors.businessType ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Reseller">Reseller</option>
                </select>
                {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
              </div>

              {/* File Uploads */}
              <div className="flex gap-6">
                {/* Profile Picture */}
                <div className="flex-1 relative">
                  <label className="block text-sm text-gray-700">
                    Profile Picture <span className="text-red-500">*</span>
                  </label>
                  <label className="block mt-1 w-full border rounded px-3 py-2 cursor-pointer bg-white">
                    {profilePic ? (profilePic.name.length > 15 ? profilePic.name.slice(0, 15) + "..." : profilePic.name) : "Choose file"}
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profile")} className="hidden" />
                  </label>
                  {profilePic && (
                    <div className="relative mt-2 w-16 h-16">
                      <img src={URL.createObjectURL(profilePic)} alt="profile" className="w-16 h-16 rounded-full object-cover" />
                      <AiOutlineCloseCircle
                        className="absolute -top-2 -right-2 text-red-500 cursor-pointer"
                        size={20}
                        onClick={() => setProfilePic(null)}
                      />
                    </div>
                  )}
                  {errors.profilePic && <p className="text-red-500 text-xs mt-1">{errors.profilePic}</p>}
                </div>

                {/* Banner Image */}
                <div className="flex-1 relative">
                  <label className="block text-sm text-gray-700">Banner Image</label>
                  <label className="block mt-1 w-full border rounded px-3 py-2 cursor-pointer bg-white">
                    {banner ? (banner.name.length > 15 ? banner.name.slice(0, 15) + "..." : banner.name) : "Choose file"}
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "banner")} className="hidden" />
                  </label>
                  {banner && (
                    <div className="relative mt-2 w-28 h-16">
                      <img src={URL.createObjectURL(banner)} alt="banner" className="w-28 h-16 rounded object-cover" />
                      <AiOutlineCloseCircle
                        className="absolute -top-2 -right-2 text-red-500 cursor-pointer"
                        size={20}
                        onClick={() => setBanner(null)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                  <button type="button" onClick={prevStep} className="flex-1 h-10 bg-gray-300 text-gray-700 rounded-md">
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="flex-1 h-10 bg-[#006666] text-white rounded-md">
                    Next
                  </button>
                </div>
            </div>
          )}

          {/* STEP 3: Password Setup */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    className={`mt-1 w-full border rounded px-3 py-2 pr-10 ${errors.password ? "border-red-500" : "border-gray-300"}`}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-4">
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                    className={`mt-1 w-full border rounded px-3 py-2 pr-10 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-2 top-4">
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`${errors.agree ? "ring-1 ring-red-500" : ""}`} />
                 I agree by accepting this with the terms of<b>SEMA Healthcare Pvt. Ltd.</b> <span className="text-red-700">*</span>
              </label>
              {errors.agree && <p className="text-red-500 text-xs mt-1">{errors.agree}</p>}

              <div className="flex gap-2 mt-2">
                <button type="button" onClick={prevStep} className="flex-1 h-10 bg-gray-300 text-gray-700 rounded-md">
                  Back
                </button>
                <button type="submit" className={`flex-1 h-10 bg-[#1C647C] text-white rounded-md ${regStatus === "pending" ? "bg-gray-400" : "bg-[#006666]"}`} disabled={regStatus === "pending"}>
                  {regStatus === "pending" ? <AiOutlineLoading className="animate-spin" /> : "Register"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Verification Dialog (added) */}
      {showVerificationDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            <FaCheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2">Email Verification Sent</h3>
            <p className="text-sm text-gray-600 mb-4">
              A verification link has been sent to your registered email. The link will be active for <strong>10 minutes</strong>.
            </p>
             <p className="text-gray-700 mb-6">Please check your junk/spam folder in your email.</p>

            <p className="text-gray-700 mb-6">Waiting for verification...</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  // allow user to close dialog and stay on page
                  setShowVerificationDialog(false);
                }}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowVerificationDialog(false);
                  navigate("/seller");
                }}
                className="px-4 py-2 rounded-md bg-[#006666] text-white"
              >
                Go to Seller area
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">You will be redirected automatically in 5 seconds.</p>
          </div>
        </div>
      )}
    </div>
  );
}
