import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  registerFailureToast,
  sellerRegisterSuccessToast,
  userRegisterSuccessToast,
} from "../../components/UIComponents/Toasts";
import { API_URL } from "@/data";

export function useRegisterSeller() {
  const navigate = useNavigate();
  const { mutateAsync: mutateSeller, status } = useMutation({
    mutationFn: async (newForm: FormData) => {
      const response = await fetch(API_URL+"shop/create-shop", {
        method: "post",
        body: newForm,
      });

      if (!response.ok || response.status !== 201) {
        const errMessage = await response.json();
        throw new Error(errMessage.message);
      }
    },
    onSuccess: () => {
      sellerRegisterSuccessToast();
      navigate("/seller");
    },
    onError: (err) => {
      registerFailureToast(err.message, false);
    },
  });

  return { mutateSeller, status };
}

export function useRegisterUser() {
  const navigate = useNavigate();
  const { mutateAsync: mutateUser, status } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(API_URL+"user/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok || data.success === false) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      return data;
    },
    onSuccess: () => {
      userRegisterSuccessToast();
      navigate("/");
    },

    onError: (err: any) => registerFailureToast(err.message || "Something went wrong", false),
  });

  return { mutateUser, status };
}
