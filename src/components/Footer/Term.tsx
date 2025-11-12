import  { useState } from "react";

const Term = () => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(!accepted);
  };

  const handleSubmit = () => {
    if (accepted) {
      alert("Thank you for accepting the Terms and Conditions!");
      // Add further logic here (e.g., form submission, navigation)
    } else {
      alert("Please accept the Terms and Conditions to proceed.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-6">Terms and Conditions</h1>

      <div className="max-h-[500px] overflow-y-scroll p-6 border border-gray-300 rounded-lg bg-gray-50 mb-6">
        <p className="mb-4">
          These Terms and Conditions (“Terms”) govern the use of Semamart
          (“Platform”) and the purchase of products and services through the
          Platform. By using the Platform, you (“User” or “Customer”) agree to
          be bound by these Terms.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Definitions</h2>
        <p><strong>Platform:</strong> Semamart and its related services.</p>
        <p><strong>User or Customer:</strong> An individual or entity using the Platform like Hospitals, Pharmacies, laboratories, clinics etc.</p>
        <p><strong>Seller:</strong> An individual or entity selling products or services through the Platform.</p>
        <p><strong>Product or Service:</strong> Any item or service sold through the Platform.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Use of the Platform</h2>
        <ul className="list-disc list-inside mb-4">
          <li>The Platform is intended for individuals and entities that can form legally binding contracts under applicable law.</li>
          <li>Users must provide accurate and complete information during registration and keep it up-to-date.</li>
          <li>Users are responsible for maintaining the confidentiality of their account and login credentials.</li>
          <li>Users must use the Platform only for lawful purposes.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">Product and Service Information</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Product and service descriptions, prices, and availability are subject to change without notice.</li>
          <li>Sellers are responsible for ensuring the accuracy of product and service information.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">Orders and Payments</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Orders are subject to acceptance by the Seller.</li>
          <li>Payment must be made through the Platform’s approved payment methods.</li>
          <li>Prices include applicable taxes and shipping costs.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">Shipping and Delivery</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Shipping times and delivery dates are estimates and may vary.</li>
          <li>Sellers are responsible for shipping and delivery.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">Returns and Refunds</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Returns and refunds are subject to the Seller’s return and refund policies.</li>
          <li>Users must contact the Seller directly for return and refund inquiries.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4 mb-2">Warranties and Disclaimers</h2>
        <p className="mb-4">The Platform disclaims all warranties, express or implied. Sellers are responsible for warranties related to their products and services.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Liability and Indemnification</h2>
        <p className="mb-4">The Platform is not liable for damages arising from the use of the Platform or any product or service. Users indemnify and hold harmless the Platform, its officers, directors, employees, agents, and affiliates.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Governing Law and Jurisdiction</h2>
        <p className="mb-4">These Terms are governed by and construed in accordance with the laws of Delhi, India. Any disputes arising from these Terms shall be resolved through [Dispute Resolution Process].</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Changes to Terms</h2>
        <p className="mb-4">The Platform may modify these Terms at any time. Continued use of the Platform after modifications constitutes acceptance of the updated Terms.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Contact Us</h2>
        <p className="mb-4">If you have any questions or concerns about these Terms, please contact us at [Contact Information].</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Acceptance</h2>
        <p className="mb-4">By using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Last Updated</h2>
        <p>These Terms were last updated on 26.08.24</p>
      </div>

      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          checked={accepted}
          onChange={handleAccept}
          id="accept"
          className="mr-2 w-4 h-4"
        />
        <label htmlFor="accept" className="select-none">
          I accept the Terms and Conditions
        </label>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );
};

export default Term;
