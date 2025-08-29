"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { Logo } from "@/components/UI/Logo";
import { loginFailureToast } from "@/components/UI/Toasts";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (email === "sema@gmail.com" && password === "Sema@123") {
      // ✅ store Admin in localStorage
      localStorage.setItem(
        "user-storage",
        JSON.stringify({
          state: {
            user: {
              id: "1",
              name: "Super Admin",
              role: "Admin",
              email: "sema@gmail.com",
            },
          },
        })
      );

      navigate("/admin"); // redirect to dashboard
    } else {
      loginFailureToast("Invalid email or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <h2 className="text-3xl font-extrabold text-[#1C647C] drop-shadow-lg text-center">
            Admin Login
          </h2>
          <p className="text-base text-gray-700 mt-1 text-center font-medium">
            Restricted access for administrators only
          </p>
        </div>

        {/* Card */}
        <section className="mt-4 bg-white/80 backdrop-blur-3xl p-8 rounded-2xl shadow-2xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#1C647C]"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#1C647C]"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-2 top-2 cursor-pointer text-[#1C647C]"
                    size={22}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-2 top-2 cursor-pointer text-[#1C647C]"
                    size={22}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-[#1C647C] hover:bg-[#14506A] transition-all"
              >
                Login
              </button>
            </div>

            {/* Back to site */}
            <div className="flex items-center justify-center mt-2">
              <span className="text-sm text-gray-700">Go back to </span>
              <Link
                to="/"
                className="text-[#1C647C] pl-1 font-semibold hover:underline"
              >
                Home
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
