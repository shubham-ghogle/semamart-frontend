import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { Logo } from "@/components/UIComponents/Logo";
import { requestPasswordReset } from "./PasswordReset.Hooks";

type AccountType = "user" | "seller";

export default function ForgotPasswordScreen() {
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("pending");
    setMessage("");
    try {
      const data = await requestPasswordReset(accountType, email.trim());
      setStatus("success");
      setMessage(
        data?.message ||
          "If an account with this email exists, a reset link has been sent."
      );
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || "Failed to request password reset.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3 scale-[1.8] sm:scale-100">
            <Logo />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1C647C] drop-shadow-lg text-center">
            Forgot Password
          </h2>
          <p className="text-base text-gray-700 mt-1 text-center font-medium">
            Enter your email to receive a reset link
          </p>
        </div>
      </section>

      <section className="mt-4 mx-auto w-full max-w-md bg-white/80 backdrop-blur-3xl p-8 rounded-2xl shadow-2xl border border-gray-200">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <p className="block text-sm font-semibold text-[#1C647C] mb-2">Account type</p>
            <div className="flex items-center justify-around">
              <label className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                <input
                  type="radio"
                  name="account_type"
                  value="user"
                  checked={accountType === "user"}
                  onChange={() => setAccountType("user")}
                  className="accent-[#1C647C]"
                />
                Institute
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                <input
                  type="radio"
                  name="account_type"
                  value="seller"
                  checked={accountType === "seller"}
                  onChange={() => setAccountType("seller")}
                  className="accent-[#1C647C]"
                />
                Seller
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#1C647C]">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter registered email"
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                status === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "pending"}
            className="w-full h-[40px] flex justify-center items-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-[#1C647C] hover:bg-[#14506A] transition-all disabled:opacity-60"
          >
            {status === "pending" ? "Please wait..." : "Send Reset Link"}
          </button>

          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-[#1C647C] hover:text-[#14506A]">
              Back to Login
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

