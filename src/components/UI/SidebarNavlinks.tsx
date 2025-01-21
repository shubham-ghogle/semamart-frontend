import { ReactNode } from "react";
import { NavLink } from "react-router";

type SidebarNavlinksParams = {
  to: string;
  end?: boolean;
  label: string;
  icon: ReactNode;
};
export default function SidebarNavlinks({
  to,
  end = false,
  label,
  icon,
}: SidebarNavlinksParams) {
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
