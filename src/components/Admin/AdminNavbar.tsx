import { NavLink } from "react-router";
import { RxDashboard } from "react-icons/rx";
import { LuMessageSquare } from "react-icons/lu";
import { GrWorkshop } from "react-icons/gr";
import { ReactNode } from "react";

export default function AdminNavbar() {
  return (
    <nav className="w-full px-6 pt-6 drop-shadow bg-white">
      <ul className="flex flex-col gap-4 w-full">
        <AdminNavlinks
          icon={<RxDashboard />}
          to="/admin"
          end
          label="Dashboard"
        />
        <AdminNavlinks
          icon={<LuMessageSquare />}
          to="requests"
          label="Requests"
        />
        <AdminNavlinks icon={<GrWorkshop />} to="sellers" label="All Sellers" />
      </ul>
    </nav>
  );
}

type AdminNavlinksParams = {
  to: string;
  end?: boolean;
  label: string;
  icon: ReactNode;
};
function AdminNavlinks({ to, end = false, label, icon }: AdminNavlinksParams) {
  return (
    <li className="w-full">
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          (isActive ? "bg-accentYellow text-white" : "bg-white text-darkBlue") +
          " p-2 rounded transition-all w-full flex items-center gap-2"
        }
      >
        <span className="text-2xl">{icon}</span>
        <p className="font-semibold">{label}</p>
      </NavLink>
    </li>
  );
}
