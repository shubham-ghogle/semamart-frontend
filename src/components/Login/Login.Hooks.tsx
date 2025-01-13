import { redirect } from "react-router";
import { User } from "../../Types/types";

type UserData = {
  email: string;
  password: string;
};

type PostUserApiResponse = {
  success: boolean;
  user: User;
  token: string;
};

export async function postUser(userData: UserData) {
  const res = await fetch("/api/v2/user/login-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    throw new Error();
  }
  const data = (await res.json()) as PostUserApiResponse;
  return data;
}

export function getUserFromLocalLoader() {
  const user = localStorage.getItem("user-storage");
  if (user) {
    const userData = JSON.parse(user);
    if (userData.state.user) {
      return redirect("/");
    }
    return null;
  }
  return null;
}
