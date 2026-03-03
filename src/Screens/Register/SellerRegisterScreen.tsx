import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading, AiOutlineCloseCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/data";
import indiaStates, { getDistricts } from "india-state-district";
import Select from "react-select";


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
  state: string;
  district: string;
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
    state: "",
    district: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<File | null>(null);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agree, setAgree] = useState<boolean>(false);
  const [regStatus, setRegStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [showVerificationDialog, setShowVerificationDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);


    const stateCodeMap: { [key: string]: string } = {
    AN: "Andaman and Nicobar", AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam",
    BR: "Bihar", CG: "Chhattisgarh", CH: "Chandigarh", DD: "Daman and Diu",
    DL: "Delhi", GA: "Goa", GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
    JH: "Jharkhand", JK: "Jammu and Kashmir", KA: "Karnataka", KL: "Kerala",
    LA: "Ladakh", LD: "Lakshadweep", MH: "Maharashtra", ML: "Meghalaya",
    MN: "Manipur", MP: "Madhya Pradesh", MZ: "Mizoram", NL: "Nagaland",
    OR: "Odisha", PB: "Punjab", PY: "Puducherry", RJ: "Rajasthan",
    SK: "Sikkim", TG: "Telangana", TN: "Tamil Nadu", TR: "Tripura",
    UP: "Uttar Pradesh", UK: "Uttarakhand", WB: "West Bengal"
  };

  // Reverse mapping for easy lookup
  const stateNameToCode: { [key: string]: string } = Object.fromEntries(
    Object.entries(stateCodeMap).map(([code, name]) => [name, code])
  );


  useEffect(() => {
    // Load state names
    const stateNames = Object.keys((indiaStates as any).rawData).map(
      code => stateCodeMap[code] || code
    );
    setStates(stateNames);
  }, []);

  // Load districts whenever state changes
  useEffect(() => {
    if (!formData.state) {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: "" }));
      return;
    }
    const stateCode = stateNameToCode[formData.state];
    const districtsOfState = getDistricts(stateCode) || [];
    setDistricts(districtsOfState);

    // Reset district if previous is invalid
    if (!districtsOfState.includes(formData.district)) {
      setFormData(prev => ({ ...prev, district: "" }));
    }
  }, [formData.state]);





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
      if (!formData.state) newErrors.state = "State is required.";
      if (!formData.district) newErrors.district = "District is required.";
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
        state: "",
        district: "",
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
              {/* First Name, Last Name, Email */}
              {["firstName", "lastName", "email"].map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">{labels[key]} <span className="text-red-500">*</span></label>
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

              {/* State Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700">State <span className="text-red-500">*</span></label>
                <Select
                  options={states.map(s => ({ value: s, label: s }))}
                  value={formData.state ? { value: formData.state, label: formData.state } : null}
                  onChange={(selected: any) => setFormData(prev => ({ ...prev, state: selected?.value || "", district: "" }))}
                  placeholder="Search or select a State"
                  isSearchable
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>

              {/* District Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700">District <span className="text-red-500">*</span></label>
                <Select
                  options={districts.map(d => ({ value: d, label: d }))}
                  value={formData.district ? { value: formData.district, label: formData.district } : null}
                  onChange={(selected: any) => setFormData(prev => ({ ...prev, district: selected?.value || "" }))}
                  placeholder="Search or select a District"
                  isSearchable
                  isDisabled={!formData.state}
                />
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>

              {/* Next Button */}
              <button type="button" onClick={nextStep} className="w-full h-10 bg-[#006666] text-white rounded-md mt-2">Next</button>
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
  <input
    type="checkbox"
    checked={agree}
    onChange={(e) => setAgree(e.target.checked)}
    className={`${errors.agree ? "ring-1 ring-red-500" : ""}`}
  />
  <span
    className="cursor-pointer underline"
    onClick={() => setShowTermsModal(true)}
  >
    I agree by accepting this with the terms of <b>SEMA Healthcare Pvt. Ltd.</b>
  </span>
  <span className="text-red-700">*</span>
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
      {showTermsModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
    <div className="bg-white w-[90vw] h-[90vh] rounded-lg flex flex-col">
      <div className="flex-1 overflow-y-auto p-8 text-sm text-gray-800 leading-relaxed">

  <h1 className="text-2xl font-bold mb-6 text-center">
    SEMAMART – Terms & Conditions (Seller / Vendor)
  </h1>

  <p className="mb-4"><strong>Effective Date:</strong> [05/02/2026]</p>

  <p className="mb-6">
    These Seller Terms apply to any manufacturer, distributor, dealer, importer,
    wholesaler, or service provider (“Seller”, “Vendor”, “you”) listing and selling
    through SEMAMART.
  </p>

  <h3 className="font-semibold mt-6 mb-2">1. Seller Eligibility & Onboarding</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Seller must be a legally registered entity.</li>
    <li>
      Seller must provide valid documents: GST certificate, PAN, trade license/firm
      registration, drug license, CDSCO/MD license (if applicable), bank account proof.
    </li>
    <li>Seller must pass SEMAMART verification (KYC + product category approvals).</li>
    <li>SEMAMART may reject onboarding without assigning reasons.</li>
  </ul>

  <h3 className="font-semibold mt-6 mb-2">2. Seller Responsibilities</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Seller is solely responsible for authenticity and legality of products.</li>
    <li>
      Seller must comply with Drugs & Cosmetics Act, Medical Devices Rules,
      Legal Metrology, GST and invoicing laws.
    </li>
    <li>Seller must provide accurate product descriptions, pricing, HSN codes, and tax rates.</li>
    <li>Seller must ensure batch/expiry compliance for consumables and reagents.</li>
  </ul>

  <h3 className="font-semibold mt-6 mb-2">3. Listings & Pricing Rules</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Seller must ensure correct specifications, UOM, pack size, images and no misleading claims.</li>
    <li>Seller must maintain pricing transparency and MRP/discount compliance where required.</li>
    <li>SEMAMART may delist products that violate platform rules.</li>
  </ul>

  <h3 className="font-semibold mt-6 mb-2">4. Orders, Acceptance & Fulfilment</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Seller must accept/reject orders within defined SLA (e.g., 6–24 hours).</li>
    <li>On acceptance, Seller must dispatch within committed timeline.</li>
    <li>Seller must pack products safely as per category norms (fragile, sterile, cold chain, etc.).</li>
    <li>Seller must share tracking details.</li>
    <li>Failure may lead to penalties and reduced visibility.</li>
  </ul>

  <h3 className="font-semibold mt-6 mb-2">5. Delivery, Damages & DOA</h3>
  <p className="pl-2">
    Seller shall be responsible for safe delivery and correct batch, expiry, and serial numbers.
    If delivered damaged or incorrect, Seller must replace or refund as per policy and evidence.
  </p>

  <h3 className="font-semibold mt-6 mb-2">6. Return, Replacement & Warranty</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Seller must clearly define return eligibility and replacement window.</li>
    <li>Seller must specify warranty terms and support details.</li>
    <li>Warranty claims must be honoured as per listing and applicable law.</li>
  </ul>

  <h3 className="font-semibold mt-6 mb-2">7. Seller Payments & Settlements</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>SEMAMART will settle payments after delivery confirmation and dispute window closure.</li>
    <li>Settlement cycles: <strong>[T+15 days]</strong>.</li>
    <li>
      SEMAMART may deduct platform commission/fees, logistics charges, penalties,
      reverse pickup costs, and tax deductions as per law.
    </li>
  </ul>

  <h3 className="font-semibold mt-6 mb-2">8. Platform Fee / Commission</h3>
  <p className="pl-2">
    Seller agrees SEMAMART may charge commission percentage or fixed fee per transaction
    and optional premium listing or marketing fees. Fee terms will be shared via
    Seller Agreement or dashboard.
  </p>

  <h3 className="font-semibold mt-6 mb-2">9. Service Levels & Penalties</h3>
  <p className="pl-2">
    Seller must maintain acceptance SLA, dispatch SLA, low cancellation rate,
    quality compliance, and minimal return rate. SEMAMART may impose listing suppression,
    penalties, suspension, or termination.
  </p>

  <h3 className="font-semibold mt-6 mb-2">10. Seller Conduct & Prohibited Items</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Seller must not sell counterfeit or unlicensed goods.</li>
    <li>Seller must not sell expired or near-expiry products beyond allowed threshold.</li>
    <li>Seller must not manipulate invoices or pricing.</li>
    <li>Seller must not solicit Buyers outside platform to avoid fees.</li>
    <li>Seller must not offer gifts or kickbacks to procurement staff.</li>
  </ul>

  <h3 className="font-semibold mt-6 mb-2">11. Audits & Compliance Checks</h3>
  <p className="pl-2">
    SEMAMART may conduct audits of seller documents and request batch or stock proofs.
    Non-compliance may lead to suspension.
  </p>

  <h3 className="font-semibold mt-6 mb-2">12. Intellectual Property</h3>
  <p className="pl-2">
    Seller grants SEMAMART a limited license to use product photos, descriptions,
    and catalogues for platform listing and marketing.
  </p>

  <h3 className="font-semibold mt-6 mb-2">13. Confidentiality</h3>
  <p className="pl-2">
    Seller shall keep Buyer data, pricing terms, and platform processes confidential
    and use them only for order fulfilment.
  </p>

  <h3 className="font-semibold mt-6 mb-2">14. Limitation of Liability</h3>
  <p className="pl-2">
    SEMAMART is not liable for Seller inventory loss, manufacturing defects,
    buyer misuse, or indirect damages. Liability is limited to platform fees
    collected for the transaction.
  </p>

  <h3 className="font-semibold mt-6 mb-2">15. Termination</h3>
  <p className="pl-2">
    SEMAMART may suspend or terminate Seller access for fraud, regulatory violations,
    repeated SLA breaches, or high complaint volume. Seller must fulfil pending
    confirmed orders unless legally prohibited.
  </p>

  <h3 className="font-semibold mt-6 mb-2">16. Governing Law & Jurisdiction</h3>
  <p className="pl-2 mb-8">
    Indian law applies. Jurisdiction: Courts of Delhi NCR.
  </p>

  {/* ======================= DIVIDER ======================= */}
<hr className="my-12 border-gray-400" />

{/* ======================= VENDOR AGREEMENT ======================= */}

<h1 className="text-2xl font-bold mb-6 text-center">VENDOR AGREEMENT</h1>

<p className="text-center mb-4">Between</p>

<p className="text-center mb-6 leading-relaxed">
  <strong>Sema Healthcare Private Limited</strong><br />
  (Registered under the Companies Act, 2013)<br />
  Having its registered office at:<br />
  317, 3rd Floor, SS Plaza, Delhi-Palam Road,<br />
  Mahavir Enclave, Delhi 110045<br />
  (Hereinafter referred to as the “Company” or “Semamart”)
</p>

<p className="text-center mb-4">AND</p>

<p className="text-center mb-6 leading-relaxed">
  <strong>{formData.businessName || "[Vendor Name]"}</strong><br />
  {formData.businessType || "[Type of Entity]"}<br />
  Having its principal place of business at:<br />
  {formData.district && formData.state
    ? `${formData.district}, ${formData.state}`
    : "[Insert Full Address]"}<br />
  (Hereinafter referred to as the “Vendor”)
</p>

<p className="text-center mb-10">
  <strong>Effective Date:</strong>{" "}
  {new Date().toLocaleDateString("en-GB")}
</p>

{/* ---------------- TABLE OF CONTENTS ---------------- */}

<h3 className="font-semibold mb-4">TABLE OF CONTENTS</h3>
<ol className="list-decimal pl-6 space-y-1 mb-12">
  <li>Purpose</li>
  <li>Vendor Obligations</li>
  <li>Company Obligations</li>
  <li>Term and Termination</li>
  <li>Warranties</li>
  <li>Returns</li>
  <li>Confidentiality</li>
  <li>Fees and Payments</li>
  <li>Intellectual Property</li>
  <li>Indemnity</li>
  <li>Limitation of Liability</li>
  <li>Force Majeure</li>
  <li>Relationship of the Parties</li>
  <li>Governing Law and Dispute Resolution</li>
  <li>Miscellaneous Provisions</li>
  <li>Annexure A: Return Policy</li>

</ol>

{/* ---------------- AGREEMENT BODY ---------------- */}

<h3 className="font-semibold mt-8 mb-2">VENDOR AGREEMENT</h3>

<p className="mb-4">
  This Vendor Agreement ("Agreement") is made and entered into on the Effective
  Date, by and between:
</p>

<p className="mb-4">
  <strong>Sema Healthcare Private Limited</strong>, a company incorporated under
  the Companies Act, 2013, having its registered office at Mahavir Enclave, Delhi,
  India, hereinafter referred to as the <strong>"Company"</strong>, which owns and
  operates the business-to-business (B2B) digital commerce platform known as
  <strong> "Semamart"</strong>;
</p>

<p className="mb-4">
  AND <strong>{formData.businessName || "[Vendor Name]"}</strong>, a{" "}
  {formData.businessType || "[Type of Entity]"} duly registered and having its
  principal place of business at{" "}
  {formData.district && formData.state
    ? `${formData.district}, ${formData.state}`
    : "[Vendor Address]"}, hereinafter referred to as the{" "}
  <strong>"Vendor"</strong>.
</p>

<p className="mb-6">
  Collectively referred to as the <strong>"Parties"</strong> and individually as
  a <strong>"Party"</strong>.
</p>

<p className="mb-6">
  WHEREAS the purpose of this Agreement is to establish and regulate the terms and
  conditions under which the Vendor shall be permitted to list, display, market,
  and sell its products on the Semamart platform, and to outline the respective
  obligations of the Vendor and the Company in connection with such sale,
  including delivery, return, post-sale support, dispute resolution, and
  financial settlements.
</p>

<p className="mb-6 font-semibold">
  NOW, THEREFORE, IN ORDER TO SUBSTANTIATE AND RECORD THE TERMS AND CONDITIONS OF
  THIS AGREEMENT AND IN CONSIDERATION OF THE MUTUAL COVENANTS AND FOR OTHER GOOD
  VALUABLE CONSIDERATION, THE PARTIES AGREE AS FOLLOWS:
</p>

<h4 className="font-semibold mt-6 mb-2">1. VENDOR OBLIGATIONS</h4>
<p>1.1 The Vendor agrees to comply with all applicable laws including GST, Legal Metrology Act, and Drugs & Cosmetics Act.</p>
<p>1.2 The Vendor shall maintain accurate product listings including pricing, taxes, batch and expiry details.</p>
<p>1.3 The Vendor shall ensure products are genuine and meet quality standards.</p>
<p>1.4 The Vendor is responsible for inventory availability and timely fulfilment.</p>
<p>1.5 The Vendor shall provide post-sale support including returns and warranties.</p>
<p>1.6 Returns for defective, expired, counterfeit or damaged products must be honoured within 7 days.</p>
<p>1.7 Vendor shall maintain all licenses and approvals required for sale.</p>
<p>1.8 Vendor accepts full liability for product compliance.</p>
<p>1.9 Vendor shall not list prohibited or misleading products.</p>

<h4 className="font-semibold mt-6 mb-2">2. COMPANY OBLIGATIONS</h4>
<p>2.1 The Company shall provide platform access and seller tools.</p>
<p>2.2 The Company acts solely as a facilitator.</p>
<p>2.3 Optional services may be provided separately.</p>

<h4 className="font-semibold mt-6 mb-2">3. TERM & TERMINATION</h4>
<p>3.1 Agreement valid for one (1) year and auto-renews.</p>
<p>3.2 Either Party may terminate with 30 days notice.</p>
<p>3.3 Immediate termination in case of breach or fraud.</p>
<p>3.4 Pending orders must be fulfilled post termination.</p>

<h4 className="font-semibold mt-6 mb-2">4. WARRANTIES</h4>
<p>The Vendor warrants authority, accuracy of information, and non-infringement.</p>

<h4 className="font-semibold mt-6 mb-2">5. RETURNS</h4>
<p>Vendor shall process refunds or replacements within 7 business days. Return shipping borne by Vendor.</p>

<h4 className="font-semibold mt-6 mb-2">6. CONFIDENTIALITY</h4>
<p>Confidential information must be protected for 3 years post termination.</p>

<h4 className="font-semibold mt-6 mb-2">7. FEES & PAYMENTS</h4>
<p>Payments settled within 3 working days after confirmation. Taxes borne by Vendor.</p>

<h4 className="font-semibold mt-6 mb-2">8. INTELLECTUAL PROPERTY</h4>
<p>Vendor grants license to use branding and product content.</p>

<h4 className="font-semibold mt-6 mb-2">9. INDEMNITY</h4>
<p>Vendor indemnifies Company against losses from defects, violations or infringement.</p>

<h4 className="font-semibold mt-6 mb-2">10. LIMITATION OF LIABILITY</h4>
<p>Company liability limited to fees earned in preceding one (1) month.</p>

<h4 className="font-semibold mt-6 mb-2">11. FORCE MAJEURE</h4>
<p>No liability for events beyond reasonable control.</p>

<h4 className="font-semibold mt-6 mb-2">12. RELATIONSHIP OF PARTIES</h4>
<p>Principal-to-principal relationship only.</p>

<h4 className="font-semibold mt-6 mb-2">13. GOVERNING LAW & DISPUTE RESOLUTION</h4>
<p>Indian law applies. Jurisdiction: Courts of Delhi. Arbitration applicable.</p>

<h4 className="font-semibold mt-6 mb-2">14. MISCELLANEOUS</h4>
<p>Entire agreement, amendments only in writing, notices via registered channels.</p>

<h4 className="font-semibold mt-6 mb-2">ANNEXURE A: RETURN POLICY</h4>
<p>1. Return Eligibility: Defective, expired, incorrect, or damaged goods</p>
<p>2. Return Window: [7–15 days from delivery date]</p>
<p>3. Conditions: Product must be unused, in original packaging</p>
<p>4. Refund/Replacements: Within [7 business days] of approval</p>


</div>


      <div className="border-t p-4 flex justify-end">
        <button
          className="px-6 py-2 bg-[#006666] text-white rounded-md"
          onClick={() => setShowTermsModal(false)}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
