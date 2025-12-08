// src/components/UIComponents/SidebarNavlinks.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";

type Props = {
  icon: React.ReactNode;
  to: string;
  label: string;
  end?: boolean;
  onClick?: () => void;
  external?: boolean; // new prop
};

export default function SidebarNavlinks({ icon, to, label, end = false, onClick, external = false }: Props) {
  // If external, use <a> instead of NavLink
  if (external) {
    return (
      <li>
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="block rounded-lg transition-colors hover:bg-sky-50"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="text-sky-600">{icon}</div>
            <span className="text-sm text-gray-700">{label}</span>
             <span className="text-sm text-gray-700 flex items-center gap-1">
               <FiExternalLink className="text-gray-400" size={14} />
            </span>
          </div>
        </a>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) =>
          `block rounded-lg transition-colors ${
            isActive ? "bg-sky-50 ring-1 ring-sky-100" : "hover:bg-sky-50"
          }`
        }
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="text-sky-600">{icon}</div>
          <span className="text-sm text-gray-700">{label}</span>
        </div>
      </NavLink>
    </li>
  );
}
