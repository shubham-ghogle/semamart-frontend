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
        className="transition-all duration-200 overflow-y-auto"
        style={{ minHeight: "calc(100vh - var(--account-header-height, 80px))" }}
      >
        <section className="px-4 md:px-6 py-8 w-full">
          <Outlet />
        </section>

        <style>{`
          @media (min-width: 768px) {
            main > section {
              padding-left: calc(var(--account-sidebar-width, 0px) + 1rem);
            }
          }
        `}</style>
      </main>
    </div>
  );
}
