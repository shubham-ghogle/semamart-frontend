import React from "react";
import {
  FaUsers,
  FaFileAlt,
  FaQuoteRight,
  FaShoppingBag,
  FaBox,
} from "react-icons/fa";

type StatCardProps = {
  title: string;
  value: string | number;
  color: string;
  IconComponent: React.ElementType;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  color,
  IconComponent,
}) => {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white 
                  rounded-2xl p-6 shadow-lg 
                  hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>

        <div className="bg-white/20 p-3 rounded-full">
          <IconComponent size={20} />
        </div>
      </div>
    </div>
  );
};

const GetQuoteDashboard: React.FC = () => {
  const stats = [
    {
      label: "Customer",
      value: "12,340",
      color: "from-blue-500 to-indigo-500",
      IconComponent: FaUsers,
    },
    {
      label: "Requirement",
      value: "540",
      color: "from-green-500 to-emerald-500",
      IconComponent: FaFileAlt,
    },
    // {
    //   label: "Quotation",
    //   value: "1,230",
    //   color: "from-yellow-500 to-orange-500",
    //   IconComponent: FaQuoteRight,
    // },
    {
      label: "Purchase Order (PO)",
      value: "320",
      color: "from-pink-500 to-rose-500",
      IconComponent: FaShoppingBag,
    },
    {
      label: "Product",
      value: "890",
      color: "from-purple-500 to-violet-500",
      IconComponent: FaBox,
    },
  ];

  return (
    <div className="bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.label}
            value={stat.value}
            color={stat.color}
            IconComponent={stat.IconComponent}
          />
        ))}
      </div>
    </div>
  );
};

export default GetQuoteDashboard;