import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Logo } from "@/components/UIComponents/Logo";
import { resetPassword } from "./PasswordReset.Hooks";

type AccountType = "user" | "seller";

export default function ResetPasswordScreen() {
  const { role, token } = useParams();
  const navigate = useNavigate();
  const accountType = useMemo(() => {
    if (role === "user" || role === "seller") return role as AccountType;
    return null;
  }, [role]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!accountType || !token) return;
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("pending");
    setMessage("");
    try {
      const data = await resetPassword(
        accountType,
        token,
        newPassword,
        confirmPassword
      );
      setStatus("success");
      setMessage(data?.message || "Password reset successful.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || "Failed to reset password.");
    }
  }

  if (!accountType || !token) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Invalid reset link</h2>
          <p className="mt-2 text-gray-600">The password reset link is invalid.</p>
          <Link to="/auth/forgot-password" className="inline-block mt-4 text-[#1C647C] font-medium">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3 scale-[1.8] sm:scale-100">
            <Logo />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1C647C] drop-shadow-lg text-center">
            Reset Password
          </h2>
          <p className="text-base text-gray-700 mt-1 text-center font-medium">
            Set a new password for your {accountType} account
          </p>
        </div>
      </section>

      <section className="mt-4 mx-auto w-full max-w-md bg-white/80 backdrop-blur-3xl p-8 rounded-2xl shadow-2xl border border-gray-200">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#1C647C]">
              New password
            </label>
            <div className="mt-1 relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-2 top-2 text-[#1C647C]"
              >
                {showNewPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1C647C]">
              Confirm password
            </label>
            <div className="mt-1 relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-2 top-2 text-[#1C647C]"
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
              </button>
            </div>
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
            {status === "pending" ? "Please wait..." : "Reset Password"}
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

