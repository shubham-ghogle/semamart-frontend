"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useMutation } from "@tanstack/react-query";

import { useUserStore } from "../../store/userStore";
import { useSellerStore } from "../../store/sellerStore";
import { postSeller, postUser } from "../../Screens/LoginScreen/Login.Hooks";
import { loginFailureToast } from "../UIComponents/Toasts";
import { Logo } from "../UIComponents/Logo";
import type { Seller, User } from "../../Types/types";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [accountType, setAccountType] = useState<string | null>(null);

  const navigate = useNavigate();

  const addUser = useUserStore((state) => state.addUser);
  const addSeller = useSellerStore((state) => state.addSeller);

  const userMutation = useMutation({
    mutationFn: postUser,
    onSuccess: (data: any) => {
      const maybeUser = data?.user as User | undefined;
      if (!maybeUser) {
        console.error("postUser returned unexpected shape:", data);
        loginFailureToast("Login failed (unexpected response)");
        return;
      }
      addUser(maybeUser);
      navigate("/");
    },
    onError: (err: any) => {
      console.error("User login error:", err);
      loginFailureToast(err?.message || "Login failed");
    },
  });

  const sellerMutation = useMutation({
     mutationFn: postSeller,
     onSuccess: (data) => {
       const maybeSeller = data?.user as Seller | undefined;
       if (!maybeSeller) {
         console.error("postSeller returned unexpected shape:", data);
         loginFailureToast("Seller login failed (unexpected response)");
         return;
       }
       addSeller(maybeSeller);
       navigate("/seller");
     },
     onError: (a) => {
       loginFailureToast(a.message);
     },
   });

   function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (accountType === "seller") {
      sellerMutation.mutate({ email, password });
    } else {
      userMutation.mutate({ email, password });
    }
  }

  return (
    <>
      <section className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3 scale-[1.8] sm:scale-100">
  <Logo />
</div>

          <h2 className="text-3xl font-extrabold text-[#1C647C] drop-shadow-lg text-center">
            Welcome to Semamart
          </h2>
          <p className="text-base text-gray-700 mt-1 text-center font-medium">
            Your trusted medical e-commerce partner
          </p>
        </div>
      </section>
      <section className="mt-4 mx-auto w-full max-w-md bg-white/80 backdrop-blur-3xl p-8 rounded-2xl shadow-2xl border border-gray-200">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#1C647C]">
              Email address
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="Please enter valid email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#1C647C]">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                type={visible ? "text" : "password"}
                name="password"
                autoComplete="password"
                required
                placeholder="Please enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs placeholder-gray-400 focus:outline-none focus:ring-[#1C647C] focus:border-[#1C647C] sm:text-sm"
              />
              {visible ? (
                <AiOutlineEye className="absolute right-2 top-2 cursor-pointer text-[#1C647C]" size={22} onClick={() => setVisible(false)} />
              ) : (
                <AiOutlineEyeInvisible className="absolute right-2 top-2 cursor-pointer text-[#1C647C]" size={22} onClick={() => setVisible(true)} />
              )}
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold text-[#1C647C] mb-1">Account type</p>
            <section className="flex items-center justify-around">
               <article className="flex items-center gap-1">
                 <input type="radio" id="user" name="account_type" value="user" checked={accountType === "user"} onChange={(e) => setAccountType(e.target.value)} className="accent-[#1C647C]" />
                 <label htmlFor="user" className="text-sm text-gray-700 font-medium">Institute</label>
               </article>
                <article className="flex items-center gap-1">
                  <input type="radio" id="seller" name="account_type" value="seller" checked={accountType === "seller"} onChange={(e) => setAccountType(e.target.value)} className="accent-[#1C647C]" />
                  <label htmlFor="seller" className="text-sm text-gray-700 font-medium">Seller</label>
                </article>
            </section>
          </div>

          <div className="flex items-center">
            <input type="checkbox" name="remember-me" id="remember-me" className="h-4 w-4 text-[#1C647C] focus:ring-[#1C647C] border-gray-300 rounded-sm" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
          </div>

          <div>
            <button type="submit" className="w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-[#1C647C] hover:bg-[#14506A] transition-all">
              Login
            </button>
            <div className="text-sm mt-2 text-center">
              <a href=".forgot-password" className="font-medium text-[#1C647C] hover:text-[#14506A]">Forgot your password?</a>
            </div>
          </div>

          <div className="flex items-center justify-center mt-2">
            <span className="text-sm text-gray-700">Don't have an account?</span>
            <Link to="/signup" className="text-[#1C647C] pl-2 font-semibold hover:underline">Sign Up</Link>
          </div>
        </form>
      </section>
    </>
  );
}
