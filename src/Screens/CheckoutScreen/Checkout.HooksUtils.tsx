import { redirect } from "react-router";

export function checkoutScreenLoader() {
  const user = localStorage.getItem("user-storage")

  if (!user) {
    return redirect("/")
  }

  const userData = JSON.parse(user);

  if (
    !userData.state ||
    !userData.state.user ||
    !userData.state.user.role
    || userData.state.user.role === "Admin"
  ) {
    return redirect("/")
  }

  return null
}
