// src/components/UIComponents/Dashboard.tsx
import React from "react";
import { Link } from "react-router-dom";

export function DashboardCard({
  heading,
  icon,
  value,
  linkTo,
  linkLabel,
}: {
  heading: string;
  icon?: React.ReactNode;
  value: number | string;
  linkTo?: string;
  linkLabel?: string;
}) {
  const display = typeof value === "number" ? value.toLocaleString("en-IN") : value;
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-white shadow-sm">
            {icon}
          </div>
          <div>
            <div className="text-xs text-gray-500">{heading}</div>
            <div className="text-xl font-semibold text-gray-800">{display}</div>
          </div>
        </div>

        {linkTo ? (
          <div className="self-end">
            <Link to={linkTo} className="text-sm text-sky-600 hover:underline">
              {linkLabel || "View"}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
