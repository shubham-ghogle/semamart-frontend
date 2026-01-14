// src/layouts/AccountLayout.tsx
import { Outlet } from "react-router-dom";
import AccountHeader from "../Account/AccountHeader";
import AccountNavbar from "../Account/AccountNavbar";

export default function AccountLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* header (AccountHeader can be fixed internally or static) */}
      <AccountHeader />

      {/* fixed sidebar / navbar rendered as sibling so mobile header/drawer works */}
      <AccountNavbar />

      <main
        className="transition-all duration-200"
        style={{ minHeight: "calc(100vh - var(--account-header-height, 80px))" }}
      >
        <section className="container mx-auto px-4 md:px-6 py-8">
          <Outlet />
        </section>

        <style>{`
          /* shift content on md+ to avoid overlap with fixed sidebar */
          @media (min-width: 768px) {
            main > section {
              padding-left: calc(var(--account-sidebar-width, 320px) + 1rem);
            }
          }
        `}</style>
      </main>
    </div>
  );
}
