import { ReactNode } from "react";
import { Link } from "react-router";

type DashboardCardProps = {
  icon: ReactNode;
  value: string | number;
  linkTo: string;
  linkLabel: string;
  heading: string;
};

export function DashboardCard({
  icon,
  value,
  linkTo,
  linkLabel,
  heading,
}: DashboardCardProps) {
  return (
    <article className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 pt-5">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-[400] text-darkGray">
          {heading}
        </h3>
      </div>
      <h5 className="mt-4 text-2xl font-normal pl-8">{value}</h5>
      <Link to={linkTo}>
        <h5 className="mt-4 text-[#077f9c]">{linkLabel}</h5>
      </Link>
    </article>
  );
}
