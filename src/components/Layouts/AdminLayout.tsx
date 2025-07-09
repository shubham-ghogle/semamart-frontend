import { Outlet } from "react-router";
import AdminHeader from "../Admin/AdminHeader";
import AdminNavbar from "../Admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <section className="bg-bgGray">
        <div className="container mx-auto grid grid-cols-[250px_1fr] min-h-[calc(100vh-80px)]">
          <AdminNavbar />
          <main className="bg-bgGray">
            <Outlet />
          </main>
        </div>
      </section>
    </>
  );
}
