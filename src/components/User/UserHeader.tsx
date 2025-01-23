import { Link } from "react-router";
import { useUserStore } from "../../store/userStore";

export default function UserHeader() {
  const user = useUserStore((state) => state.user);

  return (
    <header className="w-full bg-white shadow sticky top-0 left-0 z-30  px-4">
      <div className="container mx-auto h-[80px]  flex items-center justify-between">
        <div>
          <Link to="/">
            <img src="/logo.svg" alt="brand-logo" width={250} />
          </Link>
        </div>
        <img
          src={
            user && user.avatar
              ? "/baseUrl" + "/" + user.avatar
              : "/placeholder.png"
          }
          width={40}
          alt="admin avatar"
          className="w-[50px] h-[50px] rounded-full object-cover"
        />
      </div>
    </header>
  );
}
