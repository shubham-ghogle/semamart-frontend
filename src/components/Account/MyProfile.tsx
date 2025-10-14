import  { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";

const MyProfile = () => {
  // Get user data and updateUser action from Zustand store
const user = useUserStore(state => state.user);
const updateUser = useUserStore(state => state.updateUser);


  // Local form state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Editing states per section
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);

useEffect(() => {
  if (user && !isEditingName && !isEditingEmail && !isEditingMobile) {
    setProfile({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
    });
  }
}, [user, isEditingName, isEditingEmail, isEditingMobile]);


  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save handlers for each section
  const handleNameSave = () => {
    updateUser({
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
    setIsEditingName(false);
  };

  const handleEmailSave = () => {
    updateUser({
      email: profile.email,
    }); 
    setIsEditingEmail(false);
  };

  const handleMobileSave = () => {
    updateUser({
      phoneNumber: profile.phoneNumber,
    });
    setIsEditingMobile(false);
  };

  return (
    <div className="flex-1 p-6 bg-white shadow-lg  m-6 rounded-r-2xl ">
      {/* Personal Information */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">Personal Information</h2>
          <button
            className="text-blue-500 cursor-pointer"
            onClick={() => {
              if (isEditingName) {
                handleNameSave();
              } else {
                setIsEditingName(true);
              }
            }}
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
      </div>

      {/* Email Address */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Email Address</h2>
          <button
            className="text-blue-500 cursor-pointer"
            onClick={() => {
              if (isEditingEmail) {
                handleEmailSave();
              } else {
                setIsEditingEmail(true);
              }
            }}
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
            onClick={() => {
              if (isEditingMobile) {
                handleMobileSave();
              } else {
                setIsEditingMobile(true);
              }
            }}
          >
            {isEditingMobile ? "Save" : "Edit"}
          </button>
        </div>
        <input
          type="text"
          name="phoneNumber"
          value={profile.phoneNumber}
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
            When will my SemaMart account be updated with the new email address
            (or mobile number)?
          </strong>
          <br />
          It happens as soon as you confirm the verification code sent to your
          email (or mobile) and save the changes.
        </p>

        <p className="mt-4">
          <strong>
            What happens to my existing SemaMart account when I update my email
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
          SemaMart has a 'single sign-on' policy. Any changes will reflect in
          your Seller account also.
        </p>

        {/* <div className="mt-6">
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
        </div> */}
      </div>
    </div>
  );
};

export default MyProfile;