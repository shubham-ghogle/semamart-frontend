import { useMutation } from "@tanstack/react-query";
import {
  registerFailureToast,
  sellerRegisterSuccessToast,
  userRegisterSuccessToast,
} from "../../components/UI/Toasts";

export function useRegisterSeller() {
  const { mutateAsync: mutateSeller, status } = useMutation({
    mutationFn: async (newForm: FormData) => {
      const response = await fetch("/api/v2/shop/create-shop", {
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
    },
    onError: (err) => {
      registerFailureToast(err.message, false);
    },
  });

  return { mutateSeller, status };
}

export function useRegisterUser() {
  const { mutateAsync: mutateUser, status } = useMutation({
    mutationFn: async (newForm: FormData) => {
      const res = await fetch("/api/v2/user/create-user", {
        method: "post",
        body: newForm,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
    },
    onSuccess: () => {
      userRegisterSuccessToast()
    },
    onError: (err) => {
      registerFailureToast(err.message, false);
    },
  });

  return { mutateUser, status };
}
