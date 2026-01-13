import { ChangeEvent, FormEvent, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { IoIosLock } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom"; 
import { useRegisterUser } from "./Registration.Hooks";

function Signup() {
  const [step, setStep] = useState(1);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [check, setCheck] = useState(false);
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
  });

  const { mutateUser } = useRegisterUser();

  const indianStates = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
    "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala",
    "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
    "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttarakhand",
    "Uttar Pradesh","West Bengal","Andaman and Nicobar Islands","Chandigarh",
    "Dadra and Nagar Haveli","Daman and Diu","Delhi","Lakshadweep","Puducherry"
  ];

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
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber:formData.phoneNumber,
      instituteName:formData. instituteName,
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
      <div className="w-1/2  flex flex-col justify-center items-center p-8 text-white">
        <Link to="/"><img src="/Logo-imag.png" width={120} alt="SEMA Logo" className="mb-6" /></Link>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2 text-[#006666]"><IoIosLock />Institute Signup</h2>
        <p className="text-lg  text-center text-[#006666]">Create your institute account to continue</p>
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
                      placeholder={field==="phoneNumber"?"10-digit Phone Number":""}
                    />
                    {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
                  </div>
                ))}
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
                    <label className="block text-sm font-semibold text-[#1C647C]">District <span className="text-red-700">*</span></label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#1C647C] ${errors.district?"border-red-500":"border-gray-300"}`}
                    />
                    {errors.district && <p className="text-red-600 text-sm mt-1">{errors.district}</p>}
                  </div>
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
                    <label className="block text-sm font-semibold text-[#1C647C]">{field==="password"?"Password":"Confirm Password"} <span className="text-red-700">*</span></label>
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
                  <label className="ml-2 text-sm text-gray-700">I agree by accepting this with the terms of <b>SEMA Healthcare Pvt. Ltd.</b> <span className="text-red-700">*</span></label>
                </div>
                {errors.check && <p className="text-red-600 text-sm mt-1">{errors.check}</p>}

                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={prevStep} className="flex-1 h-10 bg-gray-300 text-gray-700 rounded-md">Back</button>
                  <button type="submit" className="flex-1 h-10 bg-[#1C647C] text-white rounded-md">Register</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
