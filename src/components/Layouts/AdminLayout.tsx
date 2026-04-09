import { Outlet } from "react-router-dom";
import AdminHeader from "../Admin/AdminHeader";
import AdminNavbar from "../Admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      {/* fixed sidebar / navbar rendered as sibling */}
      <AdminNavbar />

      <main className="transition-all duration-200 overflow-y-auto" style={{ minHeight: "calc(100vh - var(--admin-header-height, 80px))" }}>
        <section className="w-full px-2 sm:px-4 md:px-6 py-4 md:py-8">
          <Outlet />
        </section>

        <style>{`
          @media (min-width: 768px) {
            main > section {
              padding-left: calc(var(--admin-sidebar-width, 5rem) + 1rem);
            }
          }
        `}</style>
      </main>
    </div>
  );
}