import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MEDIQOP_DEPARTMENTS } from "./data";

export default function MediqopDepartmentsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const sortedDepartments = useMemo(
    () => [...MEDIQOP_DEPARTMENTS].sort((a, b) => a.localeCompare(b)),
    []
  );
  const visibleDepartments = isExpanded
    ? sortedDepartments
    : sortedDepartments.slice(0, 5);

  return (
    <section className="w-full">
      <div
        className="rounded-[28px] border border-[#d9e7ec] bg-[linear-gradient(135deg,#f8fcfd_0%,#eef7fa_100%)] px-5 py-6 shadow-sm sm:px-7 sm:py-8"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => setIsExpanded(false)}
        tabIndex={0}
      >
        <h2 className="text-2xl font-bold text-[#123d4d] sm:text-3xl">
          Browse Departments.
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visibleDepartments.map((department) => (
            <Link
              key={department}
              to={`/medicop/products?department=${encodeURIComponent(department)}`}
              className="group rounded-2xl border border-white/70 bg-white/90 px-4 py-4 shadow-[0_10px_30px_rgba(21,78,100,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1C647C] text-xs font-bold text-white">
                  {String(sortedDepartments.indexOf(department) + 1).padStart(2, "0")}
                </div>
                <p className="text-sm font-semibold leading-5 text-[#173f4b]">{department}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
