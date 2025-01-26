import { Outlet } from "react-router";
import UserHeader from "../User/UserHeader";
import UserNavbar from "../User/UserNavbar";

export default function UserLayout() {
  return (
    <>
      <UserHeader />
      <section className="container mx-auto grid grid-cols-[250px_1fr] min-h-[calc(100vh-80px)]">
        <UserNavbar />
        <main className="bg-bgGray">
          <Outlet />
        </main>
      </section>
    </>
  );
}
