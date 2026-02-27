import { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import { GrWorkshop } from "react-icons/gr";
import { FaSignOutAlt, FaEye, FaUsers, FaFileAlt, FaQuoteRight, FaShoppingBag, FaBox } from "react-icons/fa";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

// Sample data for demonstration
const sampleCustomers = [
  { srNo: 1, uid: "CUST001", date: "2024-01-15", salesman: "Current User", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh", designation: "Principal", phoneNumber: "9876543210", email: "rajesh@xyz.edu" },
  { srNo: 2, uid: "CUST003", date: "2024-01-17", salesman: "Current User", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil", designation: "Medical Practitioner", phoneNumber: "9876543212", email: "anil@healthcareclinic.com" },
];

const sampleRequirements = [
  { srNo: 1, uid: "REQ001", date: "2024-01-15", salesman: "Current User", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh", designation: "Principal", phoneNumber: "9876543210", email: "rajesh@xyz.edu" },
  { srNo: 2, uid: "REQ003", date: "2024-01-17", salesman: "Current User", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil", designation: "Medical Practitioner", phoneNumber: "9876543212", email: "anil@healthcareclinic.com" },
];

const sampleQuotations = [
  { srNo: 1, uid: "QUOT001", date: "2024-01-15", salesman: "Current User", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh", designation: "Principal", phoneNumber: "9876543210", email: "rajesh@xyz.edu" },
  { srNo: 2, uid: "QUOT003", date: "2024-01-17", salesman: "Current User", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil", designation: "Medical Practitioner", phoneNumber: "9876543212", email: "anil@healthcareclinic.com" },
];

const samplePOs = [
  { srNo: 1, uid: "PO001", date: "2024-01-15", salesman: "Current User", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh", designation: "Principal", phoneNumber: "9876543210", email: "rajesh@xyz.edu" },
  { srNo: 2, uid: "PO003", date: "2024-01-17", salesman: "Current User", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil", designation: "Medical Practitioner", phoneNumber: "9876543212", email: "anil@healthcareclinic.com" },
];

const OVERVIEW_ITEMS = [
  { label: "Customer", color: "from-blue-500 to-indigo-500", IconComponent: FaUsers },
  { label: "Requirement", color: "from-green-500 to-emerald-500", IconComponent: FaFileAlt },
  { label: "Quotation", color: "from-yellow-500 to-orange-500", IconComponent: FaQuoteRight },
  { label: "Purchase Order (PO)", color: "from-pink-500 to-rose-500", IconComponent: FaShoppingBag },
  { label: "Product", color: "from-purple-500 to-violet-500", IconComponent: FaBox },
];

const sampleRecentActivity = [
  { date: "2024-01-15", uid: "REQ001", action: "View", salesman: "Current User", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh" },
  { date: "2024-01-17", uid: "QUOT003", action: "View", salesman: "Current User", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil" },
];

const Salesman = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <RxDashboard /> },
    { id: "customer", label: "Customer", icon: <GrWorkshop /> },
    { id: "requirement", label: "Requirement", icon: <GrWorkshop /> },
    { id: "quotation", label: "Quotation", icon: <GrWorkshop /> },
    { id: "po", label: "Purchase Order (PO)", icon: <GrWorkshop /> },
    { id: "products", label: "Products", icon: <GrWorkshop /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  // Customer table columns
  const customerColumns = [
    { accessorKey: "srNo", header: "Sr. No.", cell: ({ row }: any) => <div>{row.index + 1}</div> },
    { accessorKey: "uid", header: "UID", cell: ({ row }: any) => <div>{row.original.uid}</div> },
    { accessorKey: "date", header: "Date", cell: ({ row }: any) => <div>{row.original.date}</div> },
    { accessorKey: "salesman", header: "Salesman", cell: ({ row }: any) => <div>{row.original.salesman}</div> },
    { accessorKey: "entityType", header: "Entity Type", cell: ({ row }: any) => <div>{row.original.entityType}</div> },
    { accessorKey: "entityName", header: "Entity Name", cell: ({ row }: any) => <div>{row.original.entityName}</div> },
    { accessorKey: "state", header: "State", cell: ({ row }: any) => <div>{row.original.state}</div> },
    { accessorKey: "district", header: "District", cell: ({ row }: any) => <div>{row.original.district}</div> },
    { accessorKey: "customerName", header: "Customer Name", cell: ({ row }: any) => <div>{row.original.customerName}</div> },
    { accessorKey: "designation", header: "Designation", cell: ({ row }: any) => <div>{row.original.designation}</div> },
    { accessorKey: "phoneNumber", header: "Phone Number", cell: ({ row }: any) => <div>{row.original.phoneNumber}</div> },
    { accessorKey: "email", header: "Email", cell: ({ row }: any) => <div>{row.original.email}</div> },
    { 
      accessorKey: "action", 
      header: "Action", 
      cell: ({ row }: any) => (
        <Button variant="ghost" onClick={() => console.log("View customer:", row.original.uid)}>
          <FaEye size={16} />
        </Button>
      )
    },
  ];

  // Requirement table columns
  const requirementColumns = [
    { accessorKey: "srNo", header: "Sr. No." },
    { accessorKey: "uid", header: "UID" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "salesman", header: "Salesman" },
    { accessorKey: "entityType", header: "Entity Type" },
    { accessorKey: "entityName", header: "Entity Name" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "district", header: "District" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "phoneNumber", header: "Phone Number" },
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "action", 
      header: "Action", 
      cell: ({ row }: any) => (
        <Button variant="ghost" onClick={() => console.log("View requirement:", row.original.uid)}>
          <FaEye size={16} />
        </Button>
      )
    },
  ];

  // Quotation table columns
  const quotationColumns = [
    { accessorKey: "srNo", header: "Sr. No." },
    { accessorKey: "uid", header: "UID" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "salesman", header: "Salesman" },
    { accessorKey: "entityType", header: "Entity Type" },
    { accessorKey: "entityName", header: "Entity Name" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "district", header: "District" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "phoneNumber", header: "Phone Number" },
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "action", 
      header: "Action", 
      cell: ({ row }: any) => (
        <Button variant="ghost" onClick={() => console.log("View quotation:", row.original.uid)}>
          <FaEye size={16} />
        </Button>
      )
    },
  ];

  // PO table columns
  const poColumns = [
    { accessorKey: "srNo", header: "Sr. No." },
    { accessorKey: "uid", header: "UID" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "salesman", header: "Salesman" },
    { accessorKey: "entityType", header: "Entity Type" },
    { accessorKey: "entityName", header: "Entity Name" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "district", header: "District" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "phoneNumber", header: "Phone Number" },
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "action", 
      header: "Action", 
      cell: ({ row }: any) => (
        <Button variant="ghost" onClick={() => console.log("View PO:", row.original.uid)}>
          <FaEye size={16} />
        </Button>
      )
    },
  ];

  // Recent Activity columns
  const recentActivityColumns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "uid", header: "UID" },
    { 
      accessorKey: "action", 
      header: "Action", 
      cell: ({ row }: any) => (
        <select 
          className="border rounded px-2 py-1 text-sm"
          defaultValue={row.original.action}
        >
          <option value="View">View</option>
          <option value="Requirement">Requirement</option>
          <option value="Quotation">Quotation</option>
          <option value="Purchase Order">Purchase Order</option>
        </select>
      )
    },
    { accessorKey: "salesman", header: "Salesman" },
    { accessorKey: "entityType", header: "Entity Type" },
    { accessorKey: "entityName", header: "Entity Name" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "district", header: "District" },
    { accessorKey: "customerName", header: "Customer Name" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 h-screen fixed">
          <div className="p-6 h-full flex flex-col">
            <div>
              <h2 className="text-xl font-bold mb-6 text-gray-800">Menu</h2>
              <nav className="space-y-1">
                {menuItems.filter(item => item.id !== "logout").map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                      activeTab === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="mt-auto">
              {menuItems.find(item => item.id === "logout") && (
                <button
                  onClick={() => setActiveTab("logout")}
                  className={`flex items-center gap-3 w-full px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    activeTab === "logout"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{menuItems.find(item => item.id === "logout")?.icon}</span>
                  <span>{menuItems.find(item => item.id === "logout")?.label}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
          {/* Dashboard Content */}
          {activeTab === "dashboard" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Salesman Dashboard</h1>
                <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
                  {OVERVIEW_ITEMS.map((item, index) => {
                    let count = 0;
                    if (item.label === "Customer") count = sampleCustomers.length;
                    if (item.label === "Requirement") count = sampleRequirements.length;
                    if (item.label === "Quotation") count = sampleQuotations.length;
                    if (item.label === "Purchase Order (PO)") count = samplePOs.length;
                    if (item.label === "Product") count = 0;
                    
                    return (
                      <div 
                        key={index}
                        onClick={() => setActiveTab(item.label.toLowerCase().replace(/\s+\(po\)/, ''))}
                        className={`bg-gradient-to-r ${item.color} text-white rounded-xl p-5 shadow-lg cursor-pointer hover:scale-105 transition-transform`}
                      >
                        <div className="flex items-center justify-between">
                          <item.IconComponent className="text-3xl" />
                          <span className="text-3xl font-bold">{count}</span>
                        </div>
                        <p className="text-md mt-3 font-medium">{item.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-12 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="overflow-x-auto">
                    <DataTable
                      data={sampleRecentActivity}
                      columns={recentActivityColumns}
                      docName="recent-activity"
                      searchColId="salesman"
                      searchPlaceholder="Search by salesman"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "customer" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Customer List</h3>
                <div className="overflow-x-auto">
                  <DataTable
                    data={sampleCustomers}
                    columns={customerColumns}
                    docName="customers"
                    searchColId="customerName"
                    searchPlaceholder="Search by customer name"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "requirement" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Requirement List</h3>
                <div className="overflow-x-auto">
                  <DataTable
                    data={sampleRequirements}
                    columns={requirementColumns}
                    docName="requirements"
                    searchColId="entityName"
                    searchPlaceholder="Search by entity name"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "quotation" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quotation List</h3>
                <div className="overflow-x-auto">
                  <DataTable
                    data={sampleQuotations}
                    columns={quotationColumns}
                    docName="quotations"
                    searchColId="uid"
                    searchPlaceholder="Search by quotation UID"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "po" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Purchase Order (PO) List</h3>
                <div className="overflow-x-auto">
                  <DataTable
                    data={samplePOs}
                    columns={poColumns}
                    docName="purchase-orders"
                    searchColId="uid"
                    searchPlaceholder="Search by PO UID"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Products</h3>
                <p className="text-gray-600">Products management functionality will be implemented here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Salesman;
