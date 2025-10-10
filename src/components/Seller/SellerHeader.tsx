import { Link, useNavigate } from "react-router";
import { useSellerStore } from "../../store/sellerStore";
import { Button } from "../ui/button";

export default function SellerHeader() {
  const { seller, removeSeller } = useSellerStore((state) => state);
  const c = useNavigate();

  async function logoutHandler() {
    try {
      const url = seller ? "/api/v2/shop/logout" : "/api/v2/user/logout";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Something went wrong");
      removeSeller();
      c("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 left-0 z-30  px-4">
      <div className="container mx-auto h-[80px] flex items-center justify-between">
        <div>
          <Link to="/">
            <img src="/logo.svg" alt="brand-logo" width={250} />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <img
            src={
              seller && seller.avatar
                ? "/baseUrl" + "/" + seller.avatar
                : "/placeholder.png"
            }
            width={40}
            alt="admin avatar"
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
          <Button onClick={logoutHandler}>Logout</Button>
        </div>
      </div>
    </header>
  );
}
