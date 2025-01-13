import { Outlet } from "react-router";
import AdminHeader from "../Admin/AdminHeader";
import AdminNavbar from "../Admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <main className="grid grid-cols-[250px_1fr]">
        <AdminNavbar />
        <Outlet />
      </main>
    </>
  );
}
