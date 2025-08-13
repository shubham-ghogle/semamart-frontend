import  { useState } from "react";
import {
  FaClipboardList,
  FaUser,
  FaWallet,
  FaTags,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import Header from "../Header/Header";
const AccountNavbar = () => {
  return (
    <div className="font-montserrat">
      {/* User Info */}
      <div className="flex items-center bg-white p-4 shadow-md w-64">
        <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center mr-4">
          {/* Placeholder avatar illustration */}
          <div className="w-7 h-7 bg-[url('https://cdn-icons-png.flaticon.com/512/921/921087.png')] bg-cover bg-center" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Hello,</p>
          <p className="text-base font-semibold text-black">Ritik</p>
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between mt-2 ">
        <nav>
          {/* MY ORDERS */}
         <Link to="/account/orders">
          <div className="mb-4 pb-4 border-b flex justify-between items-center cursor-pointer">
            <h3 className="font-semibold flex items-center gap-2 hover:text-blue-500 text-gray-500 cursor-pointer">
              <FaClipboardList  className="text-blue-500"/> MY ORDERS
            </h3>
            <FiChevronRight className="text-gray-500" />
          </div>
        </Link>

          {/* ACCOUNT SETTINGS */}
          <div className="mb-4 pb-4 border-b">
            <h3 className="font-semibold text-gray-500 flex items-center gap-2">
              <FaUser className="text-blue-500" /> ACCOUNT SETTINGS
            </h3>
            <ul className="ml-4 space-y-1 mt-2">
              <li className="hover:text-blue-500 hover:bg-blue-100 p-2 cursor-pointer">Profile Information</li>
              <li className="hover:text-blue-500 hover:bg-blue-100 cursor-pointer p-2">Manage Addresses</li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">PAN Card Information</li>
            </ul>

          </div>

          {/* PAYMENTS */}
          <div className="mb-4 pb-4 border-b">
            <h3 className="font-semibold text-gray-500 flex items-center gap-2">
              <FaWallet className="text-blue-500" /> PAYMENTS
            </h3>
            <ul className="ml-4 space-y-1 mt-2">
              <li className="flex justify-between items-center hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <div className="flex items-center gap-2 ">
                   Gift Cards
                </div>
                <span className="text-green-600 font-bold">₹10</span>
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                   Saved UPI
                </span>
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                   Saved Cards
                </span>
              </li>
            </ul>
          </div>

          {/* MY STUFF */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-500 flex items-center gap-2">
              <FaTags className="text-blue-500" /> MY STUFF
            </h3>
            <ul className="ml-4 space-y-1 mt-2 ">
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2 ">
                  My Coupons
                </span>
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                  My Reviews & Ratings
                </span>
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                   All Notifications
                </span>
              </li>
              <li className="hover:text-blue-500  hover:bg-blue-100 cursor-pointer p-2">
                <span className="flex items-center gap-2">
                   My Wishlist
                </span>
              </li>
            </ul>
          </div>

          {/* LOGOUT */}
          <div className="mt-6 border-t pt-4">
            <button className="flex items-center gap-2 hover:text-blue-500 text-gray-500 cursor-pointer font-medium">
              <FaSignOutAlt className="text-blue-500" /> Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: "male" | "female";
};

const MyProfile = () => {
  const [profile, setProfile] = useState<Profile>({
    firstName: "Ritik",
    lastName: "Singh",
    email: "RITIKSINGHRAJPUT18@GMAIL.COM",
    mobile: "+918084549072",
    gender: "male",
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex-1 p-6 bg-white shadow-lg font-montserrat">
      {/* Personal Information */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">Personal Information</h2>
          <button
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsEditingName(!isEditingName)}
          >
            {isEditingName ? "Save" : "Edit"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleInputChange}
            className={`border rounded p-2 ${
              isEditingName ? "bg-white" : "bg-gray-100"
            }`}
            readOnly={!isEditingName}
          />
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleInputChange}
            className={`border rounded p-2 ${
              isEditingName ? "bg-white" : "bg-gray-100"
            }`}
            readOnly={!isEditingName}
          />
        </div>
        <div className="mt-4">
          <p className="mb-1">Your Gender</p>
          <label className="mr-4">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={profile.gender === "male"}
              onChange={handleInputChange}
              disabled={!isEditingName}
            />{" "}
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={profile.gender === "female"}
              onChange={handleInputChange}
              disabled={!isEditingName}
            />{" "}
            Female
          </label>
        </div>
      </div>

      {/* Email Address */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Email Address</h2>
          <button
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsEditingEmail(!isEditingEmail)}
          >
            {isEditingEmail ? "Save" : "Edit"}
          </button>
        </div>
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleInputChange}
          className={`border rounded p-2 w-full ${
            isEditingEmail ? "bg-white" : "bg-gray-100"
          }`}
          readOnly={!isEditingEmail}
        />
      </div>

      {/* Mobile Number */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Mobile Number</h2>
          <button
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsEditingMobile(!isEditingMobile)}
          >
            {isEditingMobile ? "Save" : "Edit"}
          </button>
        </div>
        <input
          type="text"
          name="mobile"
          value={profile.mobile}
          onChange={handleInputChange}
          className={`border rounded p-2 w-full ${
            isEditingMobile ? "bg-white" : "bg-gray-100"
          }`}
          readOnly={!isEditingMobile}
        />
      </div>

      {/* FAQ Section */}
      <div>
        <h3 className="font-bold mb-4 text-lg">FAQs</h3>

        <p>
          <strong>
            What happens when I update my email address (or mobile number)?
          </strong>
          <br />
          Your login email id (or mobile number) changes, likewise. You'll
          receive all your account-related communication on your updated email
          address (or mobile number).
        </p>

        <p className="mt-4">
          <strong>
            When will my Flipkart account be updated with the new email address
            (or mobile number)?
          </strong>
          <br />
          It happens as soon as you confirm the verification code sent to your
          email (or mobile) and save the changes.
        </p>

        <p className="mt-4">
          <strong>
            What happens to my existing Flipkart account when I update my email
            address (or mobile number)?
          </strong>
          <br />
          Updating your email address (or mobile number) doesn't invalidate your
          account. Your account remains fully functional. You'll continue seeing
          your Order history, saved information and personal details.
        </p>

        <p className="mt-4">
          <strong>
            Does my Seller account get affected when I update my email address?
          </strong>
          <br />
          Flipkart has a 'single sign-on' policy. Any changes will reflect in
          your Seller account also.
        </p>

        <div className="mt-6">
          <a
            href="#"
            className="text-blue-600 font-semibold hover:underline"
          >
            Deactivate Account
          </a>
          <br />
          <a
            href="#"
            className="text-pink-600 font-semibold hover:underline mt-2 inline-block"
          >
            Delete Account
          </a>
        </div>
      </div>
    </div>
  );
};

const AccountPage = () => {
  return (
    <div>
        <Header/>
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex gap-6  mx-auto">
        <AccountNavbar />
        <MyProfile />
      </div>
    </div>
    </div>
  );
};

export default AccountPage;
