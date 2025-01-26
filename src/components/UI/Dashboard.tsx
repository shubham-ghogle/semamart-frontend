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
    <article className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-[18px] leading-5 font-[400] text-[#00000085]">
          {heading}
        </h3>
      </div>
      <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">{value}</h5>
      <Link to={linkTo}>
        <h5 className="pt-4 pl-[2] text-[#077f9c]">{linkLabel}</h5>
      </Link>
    </article>
  );
}
