// File: src/components/AccountLayout.tsx
import { Outlet } from "react-router-dom";
import Header from "../Header/Header"; // keep your real header
import AccountNavbar from "../Account/AccountNavbar";


export default function AccountLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 py-8">
        {/* Sidebar (AccountNavbar handles its own responsive drawer on small screens) */}
        <AccountNavbar />

        {/* Main content area */}
        <main className="min-h-[calc(100vh-120px)]">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
