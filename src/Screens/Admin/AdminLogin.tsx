"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useMutation } from "@tanstack/react-query";

import { Logo } from "@/components/UIComponents/Logo";
import { loginFailureToast } from "@/components/UIComponents/Toasts";
import { postUser } from "../LoginScreen/Login.Hooks";
import { useUserStore } from "@/store/userStore";
import type { User } from "@/Types/types";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("Admin"); // Default role is Admin
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const addUser = useUserStore((state) => state.addUser);

  const { mutate, status } = useMutation({
    mutationFn: postUser,
    onSuccess: (data: any) => {
      const maybeUser = data?.user as User | undefined;
      if (!maybeUser) {
        console.error("postUser returned unexpected shape:", data);
        loginFailureToast("Login failed (unexpected response)");
        return;
      }

      // Optional: ensure the returned role matches selected role
      if (maybeUser.role !== role) {
        loginFailureToast(`User is not assigned the ${role} role`);
        return;
      }

      // Save user with permissions to global store
      addUser(maybeUser);

      // Navigate to admin page for all roles
      navigate("/admin");
    },
    onError: (err: any) => {
      console.error("Admin login error:", err);
      loginFailureToast(err?.message || "Invalid email, password, or role");
    },
  });

  const isLoading = status === "pending";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Ensure role is sent; defaults to "Admin"
    const selectedRole = role || "Admin";

    mutate({ email, password, role: selectedRole });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <h2 className="text-3xl font-extrabold text-[#1C647C] drop-shadow-lg text-center">
            Administrators Login
          </h2>
          <p className="text-base text-gray-700 mt-1 text-center font-medium">
            Restricted access for administrators only
          </p>
        </div>

        {/* Form Section */}
        <section className="mt-4 bg-white/80 backdrop-blur-3xl p-8 rounded-2xl shadow-2xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1C647C]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1C647C]">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={visible ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C]"
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

            {/* Role Dropdown */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-[#1C647C] mb-1">
                Select Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="DigitalMedia">DigitalMedia</option>
              </select>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[40px] flex justify-center py-2 px-4 text-sm font-semibold rounded-md text-white bg-[#1C647C] hover:bg-[#14506A] transition-all disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </div>

            {/* Back to home */}
            <div className="flex items-center justify-center mt-2">
              <span className="text-sm text-gray-700">Go back to </span>
              <Link to="/" className="text-[#1C647C] pl-1 font-semibold hover:underline">
                Home
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
