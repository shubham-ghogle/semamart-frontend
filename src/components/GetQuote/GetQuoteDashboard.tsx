import React from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  change?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => {
  const isPositive = change ? change.trim().startsWith("+") : false;

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col gap-2 hover:shadow-xl transition duration-300">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>

      {change && (
        <span
          className={`text-sm font-medium ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {change}
        </span>
      )}
    </div>
  );
};

const GetQuoteDashboard: React.FC = () => {
  return (
    <div className=" bg-gray-100 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Customers"
            value="12,340"
            
          />
          <StatCard
            title="Requirements"
            value="$45,600"
          />
          <StatCard
            title="Quotations"
            value="1,230"
          />
          <StatCard
            title="Purchases Orders Products"
            value="3.4%"
          />
        </div>

        
      </div>
    </div>
  );
};

export default GetQuoteDashboard;