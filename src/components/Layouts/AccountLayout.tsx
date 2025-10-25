import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import AccountNavbar from "../Account/AccountNavbar";

export default function AccountLayout() {
  return (
    <div className="bg-gray-50 h-screen overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div className="pt-[80px] h-full flex">
        {/* Fixed Sidebar for desktop */}
        <div className="hidden md:block fixed mt-12 left-0 w-[320px] h-[calc(100vh-80px)] z-40 pl-4">
          <AccountNavbar />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 ml-0 md:ml-[320px] h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
