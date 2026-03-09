import { FiMail, FiPhoneCall } from "react-icons/fi";

type ContactUsScreenProps = {
  title?: string;
};

export default function ContactUsScreen({ title = "Contact Us" }: ContactUsScreenProps) {
  return (
    <div className="min-h-[calc(100vh-180px)] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">{title}</h1>
        <p className="text-center text-gray-500 mb-8">We are here to help. Reach out to us anytime.</p>

        <div className="grid gap-5">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-sky-50 border border-sky-100">
            <div className="text-sky-700 text-xl mt-1">
              <FiPhoneCall />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">+91 73038 03555</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">+91 96677 47553</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="text-emerald-700 text-xl mt-1">
              <FiMail />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a
                href="mailto:info@semamart.com"
                className="text-base sm:text-lg font-semibold text-gray-900 hover:text-emerald-700"
              >
                info@semamart.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
