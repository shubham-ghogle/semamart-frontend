import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useMutation } from "@tanstack/react-query";

import { Logo } from "@/components/UIComponents/Logo";
import { loginFailureToast } from "@/components/UIComponents/Toasts";
import { postUser } from "../LoginScreen/Login.Hooks";
import { useUserStore } from "@/store/userStore";
import type { User } from "@/Types/types";
// import { API_URL } from "@/data";



/* -------------------- Role Type -------------------- */
// type Role = {
//   _id: string;
//   name: string;
//   createdAt?: string;
//   updatedAt?: string;
// };

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setRole] = useState<string>("Admin"); 
  // const [roles, setRoles] = useState<Role[]>([]);
  // const [rolesLoading, setRolesLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const navigate = useNavigate();
  const addUser = useUserStore((state) => state.addUser);

  /* -------------------- Fetch Roles -------------------- */
  // const fetchRoles = async () => {
  //   try {
  //     setRolesLoading(true);

  //     const res = await fetch(`${API_URL}user/get-roles`, {
  //       credentials: "include",
  //     });

  //     const data = await res.json();

  //     if (!res.ok) throw new Error(data.message || "Failed to fetch roles");

  //     const fetchedRoles: Role[] = data.roles || [];

  //     // Inject Admin manually at the top
  //     const adminRole: Role = {
  //       _id: "admin-static-id",
  //       name: "Admin",
  //     };

  //     setRoles([adminRole, ...fetchedRoles]);

  //     // Always default select Admin
  //     setRole("Admin");
  //   } catch (err) {
  //     console.error("Failed to fetch roles:", err);

  //     // Even if API fails, still show Admin
  //     setRoles([
  //       {
  //         _id: "admin-static-id",
  //         name: "Admin",
  //       },
  //     ]);
  //     setRole("Admin");
  //   } finally {
  //     setRolesLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchRoles();
  // }, []);

  /* -------------------- Login Mutation -------------------- */
  const { mutate, status } = useMutation({
    mutationFn: postUser,
    onSuccess: (data: any) => {
      const maybeUser = data?.user as User | undefined;

      if (!maybeUser) {
        loginFailureToast("Login failed (unexpected response)");
        return;
      }

      addUser(maybeUser);
      navigate("/admin");
    },
    onError: (err: any) => {
      loginFailureToast(err?.message || "Invalid email or password");
    },
  });

  const isLoading = status === "pending";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    mutate({
      email,
      password,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <h2 className="text-3xl font-extrabold text-[#1C647C] text-center">
            Administrators Login
          </h2>
          <p className="text-base text-gray-700 mt-1 text-center font-medium">
            Restricted access for administrators only
          </p>
        </div>

        {/* Form */}
        <section className="mt-4 bg-white/80 backdrop-blur-3xl p-8 rounded-2xl shadow-2xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1C647C]">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1C647C] focus:border-[#1C647C]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1C647C]">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={visible ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1C647C] focus:border-[#1C647C]"
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
            {/* <div>
              <label className="block text-sm font-semibold text-[#1C647C] mb-1">
                Select Role
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={rolesLoading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1C647C] focus:border-[#1C647C]"
              >
                {roles.map((r) => (
                  <option key={r._id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[40px] flex justify-center items-center text-sm font-semibold rounded-md text-white bg-[#1C647C] hover:bg-[#14506A] transition-all disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            {/* Back */}
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
