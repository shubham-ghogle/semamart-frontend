import React, { useState } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";

// Type for each section
interface Section {
  title: string;
  content: string;
}

// Your Disclaimer sections
const sections: Section[] = [
  {
    title: "Introduction",
    content:
      "This Disclaimer governs your use of the website https://semamart.com/ (the “Site”). By accessing or using the Site, you agree to be bound by the terms and conditions of this Disclaimer. If you do not agree to all the terms and conditions of this Disclaimer, you may not access or use the Site.",
  },
  {
    title: "Website Content",
    content:
      "The information and materials contained on the Site, including but not limited to text, graphics, images, links, and other materials, are provided for informational purposes only. They do not constitute professional advice, medical advice, diagnosis, or treatment.",
  },
  {
    title: "Accuracy of Information",
    content:
      "While we strive to provide accurate and up-to-date information on the Site, we make no guarantees or warranties regarding the accuracy, completeness, or reliability of any information or content found on the Site.",
  },
  {
    title: "Use of Information",
    content:
      "You may use the information and materials on the Site for personal, non-commercial purposes only. You may not modify, copy, reproduce, distribute, transmit, display, sell, license, or otherwise exploit any information or materials from the Site for commercial purposes without our prior written consent.",
  },
  {
    title: "Contact Us",
    content:
      "Email: info@semamart.com\nAddress: Shyam Plaza, Third Floor, Mahaveer Enclave, Dwarka, Delhi – 110045",
  },
];

// Main page component
const DisclaimerPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 to-indigo-50 min-h-screen py-10 px-4 md:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-blue-700 animate-pulse">
          Disclaimer
        </h1>

        {sections.map((section, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <button
              onClick={() => toggleSection(idx)}
              className="w-full flex justify-between items-center p-4 bg-blue-50 hover:bg-blue-100 focus:outline-none"
            >
              <span className="text-lg font-semibold text-gray-800">
                {section.title}
              </span>
              {openIndex === idx ? (
                <AiOutlineUp className="w-6 h-6 text-blue-600" />
              ) : (
                <AiOutlineDown className="w-6 h-6 text-blue-600" />
              )}
            </button>

            {openIndex === idx && (
              <div className="p-4 bg-white text-gray-700 whitespace-pre-line">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisclaimerPage;
