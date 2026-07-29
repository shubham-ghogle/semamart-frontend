import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom"; 
import { useRegisterUser } from "./Registration.Hooks";
import indiaStates, { getDistricts } from "india-state-district";

function Signup() {
  const [step, setStep] = useState(1);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [check, setCheck] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false); 
  const [, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    instituteName: "",
    instituteAddress1: "",
    instituteAddress2: "",
    landmark: "",
    pincode: "",
    district: "",
    state: "",
    password: "",
    confirmPassword: "",
    gstNumber: "",
  });

  const { mutateUser, status } = useRegisterUser();
  const isRegistering = status === "pending";

  const indianStates = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
    "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala",
    "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
    "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttarakhand",
    "Uttar Pradesh","West Bengal","Andaman and Nicobar Islands","Chandigarh",
    "Dadra and Nagar Haveli","Daman and Diu","Delhi","Lakshadweep","Puducherry"
  ];

  const stateCodeMap: { [key: string]: string } = {
    AN: "Andaman and Nicobar Islands",
    AP: "Andhra Pradesh",
    AR: "Arunachal Pradesh",
    AS: "Assam",
    BR: "Bihar",
    CG: "Chhattisgarh",
    CH: "Chandigarh",
    DD: "Daman and Diu",
    DL: "Delhi",
    GA: "Goa",
    GJ: "Gujarat",
    HR: "Haryana",
    HP: "Himachal Pradesh",
    JH: "Jharkhand",
    JK: "Jammu and Kashmir",
    KA: "Karnataka",
    KL: "Kerala",
    LD: "Lakshadweep",
    MH: "Maharashtra",
    ML: "Meghalaya",
    MN: "Manipur",
    MP: "Madhya Pradesh",
    MZ: "Mizoram",
    NL: "Nagaland",
    OR: "Odisha",
    PB: "Punjab",
    PY: "Puducherry",
    RJ: "Rajasthan",
    SK: "Sikkim",
    TN: "Tamil Nadu",
    TG: "Telangana",
    TR: "Tripura",
    UP: "Uttar Pradesh",
    UK: "Uttarakhand",
    WB: "West Bengal",
  };

  const stateNameToCode: { [key: string]: string } = Object.fromEntries(
    Object.entries(stateCodeMap).map(([code, name]) => [name, code])
  );

  useEffect(() => {
    const stateNames = Object.keys((indiaStates as any).rawData).map(
      (code) => stateCodeMap[code] || code
    );
    setStates(stateNames);
  }, []);

  useEffect(() => {
    if (!formData.state) {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, district: "" }));
      return;
    }

    const stateCode = stateNameToCode[formData.state];
    const d = getDistricts(stateCode) || [];
    setDistricts(d);

    if (!d.includes(formData.district)) {
      setFormData((prev) => ({ ...prev, district: "" }));
    }
  }, [formData.state]);

  // ---------- Validation ----------
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("Include at least 1 uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Include at least 1 lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Include at least 1 number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Include at least 1 special character");
    return errors.join(", ");
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone Number is required";
      else if (!/^\d{10}$/.test(formData.phoneNumber))
        newErrors.phoneNumber = "Phone Number must be 10 digits";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter a valid email";
      if (!formData.gstNumber.trim()) newErrors.gstNumber = "GST Number is required";
      else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber))
        newErrors.gstNumber = "Enter a valid GST Number";
    }

    if (step === 2) {
      if (!formData.instituteName.trim()) newErrors.instituteName = "Institute Name is required";
      if (!formData.instituteAddress1.trim()) newErrors.instituteAddress1 = "Address Line 1 is required";
      if (!formData.landmark.trim()) newErrors.landmark = "Landmark is required";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
      else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be 6 digits";
      if (!formData.district.trim()) newErrors.district = "District is required";
      else if (!/^[A-Za-z\s]+$/.test(formData.district)) newErrors.district = "District must contain only letters";
      if (!formData.state.trim()) newErrors.state = "State is required";
    }

    if (step === 3) {
      if (!formData.password) newErrors.password = "Password is required";
      else {
        const pwdErr = validatePassword(formData.password);
        if (pwdErr) newErrors.password = pwdErr;
      }
      if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
      if (!check) newErrors.check = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gstNumber" ? value.toUpperCase() : value,
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => handleChange(e);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isRegistering) return;
    if (!validateStep()) return;

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      instituteName: formData.instituteName,
      addresses: [
        {
          reciever_name: formData.instituteName,
          instituteAddress1: formData.instituteAddress1,
          instituteAddress2: formData.instituteAddress2 || "",
          landmark: formData.landmark || "",
          pincode: formData.pincode,
          district: formData.district,
          state: formData.state,
          phone: formData.phoneNumber,
          addressType: "Home",
        },
      ],
      gstNumber: formData.gstNumber,
    };

    await mutateUser(payload);
  };

  const steps = [
    { id: 1, title: "Personal Details" },
    { id: 2, title: "Institute Details" },
    { id: 3, title: "Password" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8 text-white">
        <Link to="/"><img src="/Logo-imag.png" width={120} alt="SEMA Logo" className="mb-6" /></Link>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2 text-[#006666]">
          Institute Signup
        </h2>
        <p className="text-lg text-center text-[#006666]">
          Create your institute account to continue
        </p>
      </div>

      {/* Right Side */}
      <div className="w-2/3 flex justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Step Indicator */}
          <div className="flex justify-between mb-4">
            {steps.map((s) => (
              <div key={s.id} className="flex-1 text-center">
                <div className={`mx-auto w-8 h-8 rounded-full mb-1 flex items-center justify-center ${
                  step > s.id ? "bg-[#006666] text-white" : step === s.id ? "bg-[#006666] text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {step > s.id ? <FaCheckCircle /> : s.id}
                </div>
                <p className={`text-xs ${step === s.id ? "text-[#006666] font-medium" : "text-gray-500"}`}>{s.title}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1 */}
            {step === 1 && (
              <>
                {["firstName","lastName","phoneNumber","email"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-[#1C647C]">
                      {field==="firstName"?"First Name":field==="lastName"?"Last Name":field==="phoneNumber"?"Phone Number":"Email"} <span className="text-red-700">*</span>
                    </label>
                    <input
                      type={field==="email"?"email":"text"}
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#1C647C] ${errors[field]?"border-red-500":"border-gray-300"}`}
                    />
                    {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
                  </div>
                ))}

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-semibold text-[#1C647C]">
                    GST Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#1C647C] ${errors.gstNumber ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Ex: 22AAAAA0000A1Z5"
                  />
                  {errors.gstNumber && <p className="text-red-600 text-sm mt-1">{errors.gstNumber}</p>}
                </div>

                <button type="button" onClick={nextStep} className="w-full h-10 bg-[#006666] text-white rounded-md mt-2">Next</button>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                {["instituteName","instituteAddress1","instituteAddress2","landmark","pincode"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-[#1C647C]">
                      {field==="instituteName"?"Institute Name":field==="instituteAddress1"?"Address Line 1":field==="instituteAddress2"?"Address Line 2":field==="landmark"?"Landmark":"Pincode"} {field!=="instituteAddress2" && <span className="text-red-700">*</span>}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#1C647C] ${errors[field]?"border-red-500":"border-gray-300"}`}
                    />
                    {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
                  </div>
                ))}

                <div className="flex gap-4">
                   <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#1C647C]">State <span className="text-red-700">*</span></label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#1C647C] ${errors.state?"border-red-500":"border-gray-300"}`}
                    >
                      <option value="">Select State</option>
                      {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
                  </div> 
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#1C647C]">District <span className="text-red-700">*</span></label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.state}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#1C647C] ${
                      errors.district ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                    {errors.district && <p className="text-red-600 text-sm mt-1">{errors.district}</p>}
                  </div>
                
                </div>

                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={prevStep} className="flex-1 h-10 bg-gray-300 text-gray-700 rounded-md">Back</button>
                  <button type="button" onClick={nextStep} className="flex-1 h-10 bg-[#006666] text-white rounded-md">Next</button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                {["password","confirmPassword"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-[#1C647C]">
                      {field==="password"?"Password":"Confirm Password"} <span className="text-red-700">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={field==="password"?(visiblePassword?"text":"password"):(visibleConfirm?"text":"password")}
                        name={field}
                        value={formData[field as keyof typeof formData]}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#1C647C] ${errors[field]?"border-red-500":"border-gray-300"}`}
                      />
                      <span
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        onClick={() => field==="password"?setVisiblePassword(!visiblePassword):setVisibleConfirm(!visibleConfirm)}
                      >
                        {field==="password"?(visiblePassword?<AiOutlineEyeInvisible />:<AiOutlineEye />):(visibleConfirm?<AiOutlineEyeInvisible />:<AiOutlineEye />)}
                      </span>
                    </div>
                    {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
                  </div>
                ))}

                <div className="flex items-center mt-2">
                  <input type="checkbox" checked={check} onChange={() => setCheck(!check)} />
                  <label
                    className="ml-2 text-sm text-gray-700 cursor-pointer underline"
                    onClick={() => setShowTermsModal(true)}
                  >
                    I agree by accepting this with the terms of <b>SEMA Healthcare Pvt. Ltd.</b> <span className="text-red-700">*</span>
                  </label>
                </div>
                {errors.check && <p className="text-red-600 text-sm mt-1">{errors.check}</p>}

                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={prevStep} className="flex-1 h-10 bg-gray-300 text-gray-700 rounded-md">Back</button>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="flex-1 h-10 bg-[#1C647C] text-white rounded-md disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isRegistering ? "Sending..." : "Register"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* TERMS & CONDITIONS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white w-[90vw] h-[90vh] rounded-lg flex flex-col">
           <div className="flex-1 overflow-y-auto p-8 text-sm text-gray-800 leading-relaxed">

  {/* Main Heading */}
  <h1 className="text-2xl font-bold mb-6 text-center">
    SEMAMART TERMS & CONDITIONS
  </h1>

  {/* Sub Heading */}
  <h2 className="text-lg font-semibold mb-2">
    SEMAMART – Terms & Conditions (Institute / Buyer)
  </h2>

  <p className="mb-2"><strong>Effective Date:</strong> [05/02/2026]</p>
  <p className="mb-4">
    <strong>Platform Owner:</strong> Semamart (“SEMAMART”, “we”, “us”, “our”)
  </p>

  <p className="mb-4">
    These Terms & Conditions (“Terms”) govern access to and use of the SEMAMART
    platform (website/app) by any Institute/Buyer (“Buyer”, “you”, “your”),
    including hospitals, clinics, nursing homes, diagnostic centres, colleges,
    laboratories, and any authorized user.
  </p>

  <p className="mb-6 font-medium">
    By using SEMAMART, you agree to be bound by these Terms.
  </p>

  {/* Section 1 */}
  <h3 className="text-base font-semibold mt-6 mb-2">1. Definitions</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li><strong>Buyer/Institute:</strong> Organization purchasing products/services via SEMAMART.</li>
    <li><strong>Seller/Vendor:</strong> Third-party supplier listing products/services on SEMAMART.</li>
    <li><strong>Platform:</strong> SEMAMART website/app, dashboards, and order management system.</li>
    <li><strong>Products/Services:</strong> Items or services listed for procurement.</li>
    <li><strong>Order:</strong> Buyer’s confirmed purchase request.</li>
    <li><strong>Transaction:</strong> Commercial exchange facilitated via SEMAMART.</li>
  </ul>

  {/* Section 2 */}
  <h3 className="text-base font-semibold mt-6 mb-2">2. Platform Role</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>SEMAMART is a technology and procurement facilitation platform.</li>
    <li>SEMAMART is not a manufacturer, importer, or seller unless stated.</li>
    <li>Seller is responsible for product quality, compliance, warranty, and delivery.</li>
  </ul>

  {/* Section 3 */}
  <h3 className="text-base font-semibold mt-6 mb-2">3. Eligibility & Registration</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Buyer must be a legally valid entity under Indian laws.</li>
    <li>Buyer must provide accurate registration and license details.</li>
    <li>Buyer is responsible for safeguarding login credentials.</li>
  </ul>

  {/* Section 4 */}
  <h3 className="text-base font-semibold mt-6 mb-2">4. Product Information & Pricing</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Prices may be inclusive/exclusive of GST.</li>
    <li>Images are indicative; actual specs may vary.</li>
    <li>Prices finalize at checkout / PO confirmation.</li>
  </ul>

  {/* Section 5 */}
  <h3 className="text-base font-semibold mt-6 mb-2">5. Orders & Confirmation</h3>
  <p className="pl-2">
    Orders are confirmed only after buyer approval, seller acceptance,
    and payment/credit validation.
  </p>

  {/* Section 6 */}
  <h3 className="text-base font-semibold mt-6 mb-2">6. Payments & Invoicing</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Buyer agrees to pay total order value including applicable charges.</li>
    <li>Invoices are raised by Seller or SEMAMART (where applicable).</li>
    <li>Buyer is responsible for GST input claims.</li>
  </ul>

  {/* Section 7 */}
  <h3 className="text-base font-semibold mt-6 mb-2">7. Delivery & Receipt</h3>
  <p className="pl-2">
    Buyer must verify goods at delivery and report discrepancies within 24–48 hours.
  </p>

  {/* Section 8 */}
  <h3 className="text-base font-semibold mt-6 mb-2">8. Returns, Replacements & Warranty</h3>
  <ul className="list-disc pl-6 space-y-1">
    <li>Returns governed by supplier policy.</li>
    <li>Consumables and sterile items are generally non-returnable.</li>
    <li>Warranty is provided by Seller/Manufacturer.</li>
  </ul>

  {/* Section 9 */}
  <h3 className="text-base font-semibold mt-6 mb-2">9. Cancellation Policy</h3>
  <p className="pl-2">
    Cancellation allowed only before dispatch. Charges may apply.
  </p>

  {/* Section 10 */}
  <h3 className="text-base font-semibold mt-6 mb-2">10. Disputes & Resolution</h3>
  <p className="pl-2">
    SEMAMART provides dispute resolution support based on evidence and seller response.
  </p>

  {/* Section 11 */}
  <h3 className="text-base font-semibold mt-6 mb-2">11. Compliance with Laws</h3>
  <p className="pl-2">
    Buyer must comply with all applicable Indian laws and regulations.
  </p>

  {/* Section 12 */}
  <h3 className="text-base font-semibold mt-6 mb-2">12. Prohibited Use</h3>
  <p className="pl-2">
    Fraudulent orders, misuse, reverse engineering, and manipulation are prohibited.
  </p>

  {/* Section 13 */}
  <h3 className="text-base font-semibold mt-6 mb-2">13. Data Privacy & Communications</h3>
  <p className="pl-2">
    Buyer data is handled as per SEMAMART Privacy Policy.
  </p>

  {/* Section 14 */}
  <h3 className="text-base font-semibold mt-6 mb-2">14. Limitation of Liability</h3>
  <p className="pl-2">
    Liability is limited to the platform fee charged for the transaction.
  </p>

  {/* Section 15 */}
  <h3 className="text-base font-semibold mt-6 mb-2">15. Modification of Terms</h3>
  <p className="pl-2">
    SEMAMART may update these Terms at any time.
  </p>

  {/* Section 16 */}
  <h3 className="text-base font-semibold mt-6 mb-2">16. Governing Law & Jurisdiction</h3>
  <p className="pl-2 mb-8">
    Governed by Indian law. Jurisdiction: Courts of Delhi NCR.
  </p>

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

export default Signup;
