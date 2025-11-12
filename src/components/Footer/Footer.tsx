
import { Link } from "react-router-dom";

export default function Footer() {
  const quickLinks = [
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Refund and Cancellation Policy", path: "/refund-and-cancellation" },
    { label: "Cookie Policy", path: "/cookie-policy" },
    { label: "Disclaimer", path: "/disclaimer" },
    { label: "Shipping & Delivery Policy", path: "/shipping-delivery-policy" },
    { label: "About Us", path: "/about" },
    { label: "Terms and Conditions", path: "/terms-and-conditions" },
  ];

  return (
    <footer className="text-dark-gray mt-24 bg-bg-gray font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:px-8 px-5 pt-5">
        {/* Brand Section */}
        <article className="px-5 text-center sm:text-start flex flex-col items-center sm:items-center">
          <img src="/logo.png" alt="Semamart logo" width={400} className="mb-4" />
          <section className="grid grid-cols-2 place-items-center gap-4">
            <img src="/footer-lion.png" alt="lion art" width={200} />
            <img src="/footer-art.png" alt="footer art" width={100} />
          </section>
          <p className="text-dark-blue font-medium mt-6 text-sm sm:text-base leading-relaxed text-center sm:text-left">
            1% of every purchase is contributed to sustainable development.
          </p>
        </article>

        {/* Company Info */}
        <article className="text-base sm:text-lg space-y-2 font-light text-center sm:text-left">
          <p className="font-semibold text-dark-blue">
            SEMA Healthcare Private Limited
          </p>
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
              +91 93196 54455 | +91 73037 69555
            </a>
          </p>
        </article>

        {/* Quick Links */}
        <article className="text-base sm:text-lg space-y-2 font-light text-center sm:text-left">
          <h3 className="text-lg font-semibold mb-2 text-dark-blue">Quick Links</h3>
          {quickLinks.map((link, i) => (
            <p key={i}>
              <Link
                to={link.path}
                className="hover:text-dark-blue transition"
              >
                {link.label}
              </Link>
            </p>
          ))}
        </article>
      </div>

      {/* Bottom Bar */}
      <div className="bg-bg-gray grid place-items-center mt-6 py-3 border-t border-gray-300">
        <p className="text-dark-blue text-sm sm:text-base font-semibold tracking-wide">
          © {new Date().getFullYear()} semamart.com. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
