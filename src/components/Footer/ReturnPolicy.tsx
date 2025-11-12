import React, { useState } from "react";

interface PolicySection {
  title: string;
  content: React.ReactNode;
}

const policyData: PolicySection[] = [
  {
    title: "Eligibility",
    content: (
      <p>
        Semamart.com offers different return and replacement policies for different categories
        of products. Please see below for details.
      </p>
    ),
  },
  {
    title: "Products",
    content: (
      <>
        <h3 className="font-semibold mt-2">Eligibility</h3>
        <p>7-day no questions asked exchange/refund policy.</p>

        <h3 className="font-semibold mt-4">Process</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Initiate request within 7 days of receiving the product(s).</li>
          <li>Provide photos/videos of the product showing the issue and shipping label, bill/invoice.</li>
          <li>Customer service will contact you for clarification if needed.</li>
          <li>Return collection within 3 working days of request approval.</li>
          <li>Replacement will be initiated after approval within 7 working days.</li>
        </ul>

        <h3 className="font-semibold mt-4">Terms and Conditions</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>No custom engravings/embroidery/designs.</li>
          <li>Complete product with no missing parts.</li>
          <li>Unused and undamaged.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Other Products",
    content: (
      <>
        <h3 className="font-semibold mt-2">Eligibility</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Physical damage in transit (refuse package if visibly damaged).</li>
          <li>Manufacturing defects (not working properly).</li>
          <li>Less than 1 month expiry for perishable items.</li>
          <li>Missing parts/accessories.</li>
          <li>Wrong product received.</li>
        </ul>

        <h3 className="font-semibold mt-4">Process</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Initiate request within 7 days of receiving the product(s).</li>
          <li>Provide photos/videos of the issue, shipping label, bill/invoice.</li>
          <li>Customer service will contact you for clarification if needed.</li>
          <li>Return collection within 3 working days of request approval.</li>
          <li>Replacement will be initiated after approval within 7 working days.</li>
        </ul>

        <h3 className="font-semibold mt-4">Terms and Conditions</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Complete product with no missing parts.</li>
          <li>Unused and undamaged.</li>
          <li>No custom engravings/embroidery/designs.</li>
          <li>Replacement offered, refund if out of stock.</li>
          <li>Sterile products only returnable for wrong delivery.</li>
          <li>Semamart may deny requests deemed not genuine.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Order Cancellation",
    content: (
      <>
        <h3 className="font-semibold mt-2">Eligibility</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Within 6 hours of order placement and order not shipped.</li>
          <li>Delivery delayed by more than 21 days (except for specific items).</li>
        </ul>

        <h3 className="font-semibold mt-4">Process</h3>
        <p>Inform customer service to cancel the order.</p>

        <h3 className="font-semibold mt-4">Refund</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Semamart wallet (instant).</li>
          <li>Designated card/bank account/UPI (7 days).</li>
          <li>NEFT/RTGS transfer (10 days).</li>
        </ul>
      </>
    ),
  },
];

const ReturnsPolicy: React.FC = () => {
  // Explicitly set state type as number | null
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Returns & Replacements Policy
      </h1>

      {policyData.map((section, index) => (
        <div key={index} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setActiveIndex(activeIndex === index ? null : index)
            }
            className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 focus:outline-none flex justify-between items-center"
          >
            <span className="font-semibold">{section.title}</span>
            <span>{activeIndex === index ? "-" : "+"}</span>
          </button>

          {activeIndex === index && (
            <div className="p-4 bg-white text-gray-700">{section.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReturnsPolicy;
