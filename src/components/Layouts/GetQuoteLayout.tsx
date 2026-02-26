import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const GetQuoteLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-lg transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-5 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">GetQuote Admin</h2>

        <nav className="flex flex-col gap-3 flex-grow">
          <NavLink to="/getquote-admin" end className={linkClasses}>
            Dashboard
          </NavLink>

          <NavLink to="manager" className={linkClasses}>
            Manager
          </NavLink>

          <NavLink to="salesman" className={linkClasses}>
            Salesman
          </NavLink>

          <NavLink to="product-manager" className={linkClasses}>
            Product Manager
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default GetQuoteLayout;