import { Outlet } from "react-router-dom";
import AccountHeader from "../Account/AccountHeader";
import AccountNavbar from "../Account/AccountNavbar";

export default function AccountLayout() {
  return (
    <div className="bg-gray-50 min-h-screen overflow-hidden">
      {/* Fixed Account Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AccountHeader />
      </div>

      <div className="pt-[80px] h-full flex">
        {/* Sidebar */}
        <div className="hidden md:block fixed left-0 top-[80px] h-[calc(100vh-80px)] z-40 pl-4">
          <AccountNavbar />
        </div>

        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-[var(--account-sidebar-width,320px)] transition-all duration-200 h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
