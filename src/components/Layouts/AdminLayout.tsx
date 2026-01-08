import { Outlet } from "react-router-dom";
import AdminHeader from "../Admin/AdminHeader";
import AdminNavbar from "../Admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      {/* Render navbar as a sibling — the navbar component is fixed on md+ and
          shows a mobile header/drawer on small screens (unchanged). */}
      <AdminNavbar />

      {/* Main content — add left padding only on larger screens so the fixed sidebar
          doesn't overlap content. We add a small <style> block with a media query
          that uses the --admin-sidebar-width variable controlled by header/navbar. */}
      <main className="min-h-[calc(100vh-120px)] transition-all duration-200">
        <section className="container mx-auto px-4 md:px-6 py-8">
          <Outlet />
        </section>

        <style>{`
          /* apply left padding on md+ only (md ~= 768px) */
          @media (min-width: 768px) {
            main {
              padding-left: var(--admin-sidebar-width, 5rem);
            }
          }
          /* on smaller screens, no extra left padding */
        `}</style>
      </main>
    </div>
  );
}
