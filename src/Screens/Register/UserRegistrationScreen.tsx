import { ChangeEvent, FormEvent, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { IoIosLock } from "react-icons/io";
import {
  registerFailureToast,
  userRegisterSuccessToast,
} from "../../components/UI/Toasts";
import { Link } from "react-router";

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

    try {
      const res = await fetch("/api/v2/user/create-user", {
        method: "post",
        body: newForm,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      userRegisterSuccessToast();
    } catch (error) {
      console.error("API error:", error);
      let err = undefined;
      if (error instanceof Error) {
        err = error.message;
      }
      registerFailureToast(err, false);
    }
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

  //    console.log("checked :",check);
  return (
    <div className="min-h-screen bg-gradient-to-b from-customBlue to-customGreen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md ">
        <Link to="/">
          <img
            src="/Logo-imag.png"
            width={100}
            alt="SEMA Favicon Icon"
            className="mt-1 mx-auto"
          />
        </Link>
        <h2 className="flex justify-center text-center mt-6 mb-6 items-center text-3xl  text-white">
          <IoIosLock />
          <span>Customer Signup</span>
        </h2>
      </div>
      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-[35rem] ">
        <div className="bg-white bg-opacity-30 py-8 px-4 shadow sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Shop Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 "
              >
                First Name <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1 ">
                <input
                  type="name"
                  name="firstName"
                  required
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1">
                <input
                  type="name"
                  name="lastName"
                  required
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            {/* Phon number */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number<div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  autoComplete="password"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            {/* Phone number end */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Institute Name <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1">
                <input
                  type="name"
                  name="instituteName"
                  required
                  placeholder="Institute Name"
                  value={formData.instituteName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Institute Address: <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="instituteAddress1"
                  required
                  placeholder="Address line 1"
                  value={formData.instituteAddress1}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="text"
                  name="instituteAddress2"
                  // required
                  placeholder="Address line 2"
                  value={formData.instituteAddress2}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border mt-2 border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                ⁠⁠Landmark <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1">
                <input
                  type="name"
                  name="landmark"
                  required
                  placeholder="Landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                ⁠⁠Pincode <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1">
                <input
                  type="name"
                  name="pincode"
                  required
                  placeholder="⁠Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                District <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1">
                <input
                  type="name"
                  name="district"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                ⁠⁠State <div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1">
                <input
                  type="name"
                  name="state"
                  required
                  placeholder="⁠State"
                  value={formData.state}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
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
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password<div className="inline text-red-700">*</div>
              </label>
              <div className="mt-1 relative">
                <input
                  type={visible ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="current-password"
                  required
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="checkbox"
                name="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                onChange={() => {
                  setCheck((prev) => !prev);
                }}
              />
              <label htmlFor="checkbox" className="ml-2 text-sm text-gray-700">
                By Checking this box I agree to the Terms and Conditions of SEMA
                Healthcare PVT. LTD.
              </label>
            </div>

            <div>
              <button
                type="submit"
                className=" relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-md font-medium rounded-3xl  bg-accentYellow text-black shadow-sm"
              >
                SignUp
              </button>
            </div>

            {/* <div className={`${styles.noramlFlex} w-full`} >
                            <h4>Already have an account?</h4>
                            <Link to="/shop-login" className="text-blue-600 pl-2">
                                Sign In
                            </Link>
                        </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
