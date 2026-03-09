import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Logo } from "@/components/UIComponents/Logo";
import { confirmEmailChange } from "./EmailChange.Hooks";

type AccountType = "user" | "seller";

export default function ConfirmEmailChangeScreen() {
  const { role, token } = useParams();
  const accountType = useMemo(() => {
    if (role === "user" || role === "seller") return role as AccountType;
    return null;
  }, [role]);

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("Verifying your email change link...");

  useEffect(() => {
    async function run() {
      if (!accountType || !token) {
        setStatus("error");
        setMessage("Invalid email change link.");
        return;
      }

      try {
        const data = await confirmEmailChange(accountType, token);
        setStatus("success");
        setMessage(data?.message || "Your email has been changed successfully.");
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.message || "Failed to confirm email change.");
      }
    }
    void run();
  }, [accountType, token]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md bg-white/80 backdrop-blur-3xl p-8 rounded-2xl shadow-2xl border border-gray-200 text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <h2 className="text-2xl font-bold text-[#1C647C]">
          Confirm Email Change
        </h2>
        <p
          className={`mt-4 text-sm ${
            status === "success" ? "text-green-700" : status === "error" ? "text-red-600" : "text-gray-600"
          }`}
        >
          {message}
        </p>
        <div className="mt-6">
          <Link to="/login" className="font-medium text-[#1C647C] hover:text-[#14506A]">
            Go to Login
          </Link>
        </div>
      </section>
    </div>
  );
}

