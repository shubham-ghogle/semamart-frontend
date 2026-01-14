import { Outlet } from "react-router-dom";
import AdminHeader from "../Admin/AdminHeader";
import AdminNavbar from "../Admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      {/* fixed sidebar / navbar rendered as sibling */}
      <AdminNavbar />

      <main className="transition-all duration-200" style={{ minHeight: "calc(100vh - var(--admin-header-height, 80px))" }}>
        <section className="container mx-auto px-4 md:px-6 py-8">
          <Outlet />
        </section>

        <style>{`
          /* shift content on md+ to avoid overlap with fixed sidebar */
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