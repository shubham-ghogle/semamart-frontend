import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "../../store/userStore";
import { postSeller, postUser } from "../../Screens/LoginScreen/Login.Hooks";
import { useSellerStore } from "../../store/sellerStore";
import { loginFailureToast } from "../UI/Toasts";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [accountType, setAccountType] = useState<string | null>();

  const navigate = useNavigate();

  const addUser = useUserStore((state) => state.addUser);
  const addSeller = useSellerStore((state) => state.addSeller);

  const userMutation = useMutation({
    mutationFn: postUser,
    onSuccess: (data) => {
      addUser(data.user);
      navigate("/");
    },
    onError: (a) => {
      loginFailureToast(a.message);
    },
  });

  const sellerMutation = useMutation({
    mutationFn: postSeller,
    onSuccess: (data) => {
      addSeller(data.user);
      navigate("/");
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
      userMutation.mutate({ password: password, email: email });
    }
  }

  return (
    <>
      <section className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-lg">
          Customer Login
        </h2>
      </section>
      <section className="mt-4 sm:mx-auto sw:w-full sm:max-w-md bg-white/40 backdrop-blur-3xl p-12 rounded-3xl drop-shadow-xl">
        <form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              password
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
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {visible ? (
                <AiOutlineEye
                  className="absolute right-2 top-2 cursor-pointer"
                  size={25}
                  onClick={() => setVisible(false)}
                />
              ) : (
                <AiOutlineEyeInvisible
                  className="absolute right-2 top-2 cursor-pointer"
                  size={25}
                  onClick={() => setVisible(true)}
                />
              )}
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">
              Account type
            </p>
            <section className="flex items-center justify-around">
              <article className="flex items-center gap-1">
                <input
                  required
                  type="radio"
                  id="user"
                  name="account_type"
                  value="user"
                  onChange={(e) => setAccountType(e.target.value)}
                />
                <label htmlFor="user">User</label>
              </article>
              <article>
                <input
                  type="radio"
                  id="seller"
                  name="account_type"
                  value="seller"
                  required
                  onChange={(e) => setAccountType(e.target.value)}
                />
                <label htmlFor="seller">Seller</label>
              </article>
            </section>
          </div>
          {/* password end */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="remember-me"
              id="remember-me"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </label>
          </div>
          <div>
            <button
              type="submit"
              className="relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accentYellow hover:bg-accentBlue"
            >
              Submit
            </button>
            <div className="text-sm mt-2">
              <a
                href=".forgot-password"
                className="font-medium text-darkBlue hover:text-blue-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div className="flex items-center">
            <h4>Not have any account</h4>
            <Link to="/signup" className="text-darkBlue pl-2">
              Sign Up
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}
