import { ChangeEvent, FormEvent, useState } from "react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLoading,
} from "react-icons/ai";
import { IoIosLock } from "react-icons/io";
import { Link } from "react-router";
import { useRegisterUser } from "./Registration.Hooks";

function Signup() {
  const [visible, setVisible] = useState(false);
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

  const [check, setCheck] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const { mutateUser, status: regiStatus } = useRegisterUser();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!check) {
      return window.alert("Checkbox is compulsory");
    }
    if (formData.password !== formData.confirmPassword) {
      return window.alert("Passwords do not match");
    }
    if (passwordErrors.length > 0) {
      return window.alert("Please fix the password issues.");
    }

    const newForm = new FormData();
    newForm.append("firstName", formData.firstName);
    newForm.append("lastName", formData.lastName);
    newForm.append("phoneNumber", formData.phoneNumber);
    newForm.append("email", formData.email);
    newForm.append("instituteName", formData.instituteName);
    newForm.append("instituteAddress1", formData.instituteAddress1);
    newForm.append("instituteAddress2", formData.instituteAddress2);
    newForm.append("landmark", formData.landmark);
    newForm.append("pincode", formData.pincode);
    newForm.append("district", formData.district);
    newForm.append("state", formData.state);
    newForm.append("password", formData.password);

    await mutateUser(newForm);
  }

  function validatePassword(password: string) {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must include at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must include at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must include at least one number.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must include at least one special character.");
    }
    return errors;
  }
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const errors = validatePassword(password);
    setPasswordErrors(errors);
    setFormData((prev) => ({
      ...prev,
      password,
    }));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-6">
        <Link to="/">
          <img
            src="/Logo-imag.png"
            width={100}
            alt="SEMA Favicon Icon"
            className="mt-1 mx-auto"
          />
        </Link>
        <h2 className="text-3xl font-extrabold text-[#1C647C] drop-shadow-lg mt-6 mb-2">
          <div className="flex justify-center items-center gap-2">
            <IoIosLock />
            <span>Customer Signup</span>
          </div>
        </h2>
        <p className="text-base text-gray-700 mt-1 font-medium">
          Create your customer account to continue
        </p>
      </div>

      {/* Card */}
      <section className="mt-4 bg-white/80 backdrop-blur-3xl p-8 rounded-2xl shadow-2xl border border-gray-200">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              First Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Last Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Phone Number <span className="text-red-700">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Email Address <span className="text-red-700">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* Institute Name */}
          <div>
            <label
              htmlFor="instituteName"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Institute Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="instituteName"
              required
              placeholder="Institute Name"
              value={formData.instituteName}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* Institute Address */}
          <div>
            <label
              htmlFor="instituteAddress1"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Institute Address <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="instituteAddress1"
              required
              placeholder="Address line 1"
              value={formData.instituteAddress1}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
            <input
              type="text"
              name="instituteAddress2"
              placeholder="Address line 2"
              value={formData.instituteAddress2}
              onChange={handleChange}
              className="mt-2 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* Landmark */}
          <div>
            <label
              htmlFor="landmark"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Landmark <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="landmark"
              required
              placeholder="Landmark"
              value={formData.landmark}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* Pincode */}
          <div>
            <label
              htmlFor="pincode"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Pincode <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              required
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* District */}
          <div>
            <label
              htmlFor="district"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              District <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="district"
              placeholder="District"
              value={formData.district}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              State <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              name="state"
              required
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Password <span className="text-red-700">*</span>
            </label>
            <div className="mt-1 relative">
              <input
                type={visible ? "text" : "password"}
                name="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handlePasswordChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
              />
              {visible ? (
                <AiOutlineEye
                  className="absolute right-2 top-2 cursor-pointer text-[#1C647C]"
                  size={22}
                  onClick={() => setVisible(false)}
                />
              ) : (
                <AiOutlineEyeInvisible
                  className="absolute right-2 top-2 cursor-pointer text-[#1C647C]"
                  size={22}
                  onClick={() => setVisible(true)}
                />
              )}
            </div>
            {/* Password Error Messages */}
            {passwordErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-600">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-[#1C647C]"
            >
              Confirm Password <span className="text-red-700">*</span>
            </label>
            <div className="mt-1 relative">
              <input
                type={visible ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
              />
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="checkbox"
              name="checkbox"
              className="h-4 w-4 text-[#1C647C] focus:ring-[#1C647C] border-gray-300 rounded-sm"
              onChange={() => {
                setCheck((prev) => !prev);
              }}
            />
            <label htmlFor="checkbox" className="ml-2 text-sm text-gray-700">
              By Checking this box I agree to the Terms and Conditions of SEMA
              Healthcare PVT. LTD.
            </label>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full h-[40px] flex justify-center items-center text-sm font-semibold rounded-md text-white bg-[#1C647C] hover:bg-[#14506A] transition-all disabled:bg-gray-400"
              disabled={regiStatus === "pending"}
            >
              {regiStatus === "pending" ? (
                <AiOutlineLoading className="animate-spin" />
              ) : (
                "SignUp"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
);

}

export default Signup;
