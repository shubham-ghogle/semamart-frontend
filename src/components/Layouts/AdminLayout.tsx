import { Outlet } from "react-router-dom";
import AdminHeader from "../Admin/AdminHeader";
import AdminNavbar from "../Admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      {/* use auto for the sidebar column so its width can change (w-20 when collapsed, w-64 when expanded) */}
      <section className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 py-8">
        <AdminNavbar />

        {/* Main content area */}
        <main className="min-h-[calc(100vh-120px)]">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
