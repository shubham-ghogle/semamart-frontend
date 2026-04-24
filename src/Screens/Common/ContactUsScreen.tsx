import { FiMail, FiPhoneCall } from "react-icons/fi";

type ContactUsScreenProps = {
  title?: string;
};

export default function ContactUsScreen({ title = "Contact Us" }: ContactUsScreenProps) {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full">
        <div className="rounded-[32px] bg-white p-6 sm:p-10 shadow-sm border border-gray-200">
          <div className="text-center mx-auto max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600 mb-3">Customer Support</p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Our team is ready to assist you with orders, account questions, and product support. Reach out anytime and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <FiPhoneCall size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Call Us</p>
                  <p className="mt-1 text-sm text-slate-600">Available 9am–7pm, Monday to Saturday</p>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-sm sm:text-base text-slate-900 font-medium">
                <p>+91 73038 03555</p>
                <p>+91 96677 47553</p>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <FiMail size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Email</p>
                  <p className="mt-1 text-sm text-slate-600">We typically respond within one business day</p>
                </div>
              </div>
              <div className="mt-6 text-base font-medium text-slate-900">
                <a href="mailto:info@semamart.com" className="hover:text-emerald-800">
                  info@semamart.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
