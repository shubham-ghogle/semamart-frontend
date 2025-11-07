import React, { useEffect, useState } from "react";
import { Link } from "react-router";

export default function Footer() {
  const [activeLink, setActiveLink] = useState<string | null>(null);

  const linkContents: Record<string, string> = {
    "Privacy Policy":
      "This is a demo Privacy Policy text. It explains how we collect and use data. Replace with your real policy content.",
    "Refund and Cancellation Policy":
      "Demo Refund & Cancellation Policy — customers may request refunds within X days. Replace with the real policy.",
    "Cookie Policy":
      "Demo Cookie Policy — we use cookies to improve UX. Replace with the actual cookie policy text.",
    Disclaimer:
      "Demo Disclaimer — information is provided as-is. Replace with your legal disclaimer.",
    "Shipping & Delivery Policy":
      "Demo Shipping & Delivery Policy — estimated delivery times, carriers, and charges. Replace with full details.",
    "About Us":
      "Demo About Us — SEMA Healthcare is a trusted medical e-commerce partner. Replace with your full company story.",
    "Terms and Conditions":
      "Demo Terms & Conditions — legal terms for using the service. Replace with full terms.",
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveLink(null);
      }
    }
    if (activeLink) {
      document.addEventListener("keydown", onKey);
      // lock scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [activeLink]);

  const handleLinkClick = (e: React.MouseEvent, item: string) => {
    e.preventDefault();
    setActiveLink(item);
  };

  return (
    <footer className="text-dark-gray mt-24 bg-bg-gray font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap- sm:px-8 px-5 pt-5">
        {/* Brand Section */}
        <article className="px-5 text-center sm:text-start flex flex-col items-center sm:items-center">
          <img src="/logo.png" alt="brand logo" width={400} className="mb-4" />
          <section className="grid grid-cols-2 place-items-center gap-4">
            <img src="/footer-lion.png" alt="lion art" width={200} />
            <img src="/footer-art.png" alt="footer art" width={100} />
          </section>
          <p className="text-dark-blue font-medium mt-6 text-sm sm:text-base leading-relaxed">
            1% of every purchase is contributed to sustainable development.
          </p>
        </article>

        {/* Company Info */}
        <article className="text-base sm:text-lg space-y-2 font-light">
          <p className="font-semibold text-dark-blue">
            SEMA Healthcare Private Limited
          </p>
          {/* <p>
            Shyam Plaza, Third Floor, Mahaveer Enclave, Dwarka, Delhi – 110045
          </p> */}
          <p>
            <a
              href="mailto:info@semamart.com"
              className="hover:text-dark-blue transition"
            >
              info@semamart.com
            </a>
          </p>
          <p>GST: 07ABKCS8538F1ZX</p>
          <p>
            <a href="tel:+919319654455" className="hover:text-dark-blue">
              +91 93196 54455 +91 73037 69555
            </a>
          </p>
        </article>

        {/* Links */}
        <article className="text-base sm:text-lg space-y-2 font-light">
          <h3 className="text-lg font-semibold mb-2 text-dark-blue">Quick Links</h3>
          {[
            "Privacy Policy",
            "Refund and Cancellation Policy",
            "Cookie Policy",
            "Disclaimer",
            "Shipping & Delivery Policy",
            "About Us",
            "Terms and Conditions",
          ].map((item, i) => (
            <p key={i}>
              <Link
                to="#"
                onClick={(e) => handleLinkClick(e as any, item)}
                className="hover:text-dark-blue transition"
              >
                {item}
              </Link>
            </p>
          ))}
        </article>
      </div>

      {/* Bottom bar */}
      <div className="bg-bg-gray grid place-items-center mt-6 py-3 border-t border-gray-300">
        <p className="text-dark-blue text-sm sm:text-base font-semibold tracking-wide">
          © {new Date().getFullYear()} semamart.com. All Rights Reserved.
        </p>
      </div>

      {/* Modal */}
      {activeLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
          onClick={() => setActiveLink(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              onClick={() => setActiveLink(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="p-6">
              <h2 id="modal-title" className="text-xl font-semibold mb-4">
                {activeLink}
              </h2>
              <div className="prose max-w-none text-sm leading-relaxed text-gray-700 mb-6">
                <p>{linkContents[activeLink] ?? "No content available."}</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveLink(null)}
                  className="px-4 py-2 rounded-md bg-[#1C647C] text-white hover:bg-[#14506A] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
