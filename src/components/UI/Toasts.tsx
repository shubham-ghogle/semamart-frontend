import { redirect } from "react-router";
import { toast } from "react-toastify";

export function sellerRegisterSuccessToast() {
  toast(
    <div>
      <h2 className="text-2xl font-semibold text-green-600">
        Account Registered
      </h2>
      <p className="text-darkGray mt-2 mb-4">
        Once the account is verified by the admin you can use your account as a
        seller
      </p>
      <button
        onClick={() => redirect("/")}
        className="border-accentBlue border hover:bg-green-700 px-2 py-1 rounded text-accentBlue hover:text-bgGray hover:border-green-700"
      >
        Go back Home
      </button>
    </div>,
    {
      style: {
        width: "390px",
      },
      autoClose: false,
    },
  );
}

export function registerFailureToast(
  err = "Please try again later",
  showHomeBtn = true,
) {
  toast(
    <div>
      <h2 className="text-2xl font-semibold text-red-700 mb-2">
        Error occurred!
      </h2>
      <p className="text-darkGray mt-2 mb-4">{err}</p>
      {showHomeBtn && (
        <button
          onClick={() => redirect("/")}
          className="bg-accentBlue hover:bg-red-600 px-2 py-1 rounded text-bgGray"
        >
          Go back Home
        </button>
      )}
    </div>,
    {
      autoClose: 4000,
      style: {
        width: "390px",
      },
    },
  );
}

export function loginFailureToast(err = "Something went wrong") {
  toast.error(<h2 className="text-lg text-red-500">{err}</h2>, {
    autoClose: 3000,
    style: {
      width: "300px",
    },
    hideProgressBar: false,
  });
}

export function userRegisterSuccessToast() {
  toast(
    <div>
      <h2 className="text-2xl font-semibold text-green-600">
        Account Registered
      </h2>
      <p className="text-darkGray mt-2 mb-4">
        Please verify your account using the link sent to your email.
      </p>
    </div>,
    {
      style: {
        width: "390px",
      },
      autoClose: false,
    },
  );
}
