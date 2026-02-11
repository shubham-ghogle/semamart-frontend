import { Outlet } from "react-router";
import UserHeader from "../User/UserHeader";
import UserNavbar from "../User/UserNavbar";

export default function UserLayout() {
  return (
    <>
      <UserHeader />
      <div className="flex min-h-[calc(100vh-80px)]">
        <aside className="fixed left-0 top-[80px] bottom-0 w-[250px] bg-white shadow-md z-20">
          <UserNavbar />
        </aside>
        <main className="flex-1 ml-[250px] bg-bg-gray overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
}
