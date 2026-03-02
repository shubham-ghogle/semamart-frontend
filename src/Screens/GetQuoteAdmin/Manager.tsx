import { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import { GrWorkshop } from "react-icons/gr";
import { FaSignOutAlt, FaEye, FaUsers, FaFileAlt, FaQuoteRight, FaBox } from "react-icons/fa";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import RequirementModal from "@/components/ui/RequirementModal";

// Sample data for demonstration
const sampleCustomers = [
  { srNo: 1, uid: "CUST001", date: "2024-01-15", salesman: "John Doe", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh", designation: "Principal", phoneNumber: "9876543210", email: "rajesh@xyz.edu" },
  { srNo: 2, uid: "CUST002", date: "2024-01-16", salesman: "Jane Smith", entityType: "Hospital", entityName: "ABC Hospital", state: "Delhi", district: "New Delhi", customerName: "Dr. Priya", designation: "Director", phoneNumber: "9876543211", email: "priya@abchospital.com" },
  { srNo: 3, uid: "CUST003", date: "2024-01-17", salesman: "Mike Johnson", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil", designation: "Medical Practitioner", phoneNumber: "9876543212", email: "anil@healthcareclinic.com" },
];

const sampleRequirements = [
  { srNo: 1, uid: "REQ001", date: "2024-01-15", salesman: "John Doe", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh", designation: "Principal", phoneNumber: "9876543210", email: "rajesh@xyz.edu" },
  { srNo: 2, uid: "REQ002", date: "2024-01-16", salesman: "Jane Smith", entityType: "Hospital", entityName: "ABC Hospital", state: "Delhi", district: "New Delhi", customerName: "Dr. Priya", designation: "Director", phoneNumber: "9876543211", email: "priya@abchospital.com" },
  { srNo: 3, uid: "REQ003", date: "2024-01-17", salesman: "Mike Johnson", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil", designation: "Medical Practitioner", phoneNumber: "9876543212", email: "anil@healthcareclinic.com" },
];

const sampleQuotations = [
  { srNo: 1, uid: "QUOT001", date: "2024-01-15", salesman: "John Doe", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh", designation: "Principal", phoneNumber: "9876543210", email: "rajesh@xyz.edu" },
  { srNo: 2, uid: "QUOT002", date: "2024-01-16", salesman: "Jane Smith", entityType: "Hospital", entityName: "ABC Hospital", state: "Delhi", district: "New Delhi", customerName: "Dr. Priya", designation: "Director", phoneNumber: "9876543211", email: "priya@abchospital.com" },
  { srNo: 3, uid: "QUOT003", date: "2024-01-17", salesman: "Mike Johnson", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil", designation: "Medical Practitioner", phoneNumber: "9876543212", email: "anil@healthcareclinic.com" },
];

const samplePOs = [
  { srNo: 1, uid: "PO001", date: "2024-01-15", salesman: "John Doe", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh", designation: "Principal", phoneNumber: "9876543210", email: "rajesh@xyz.edu" },
  { srNo: 2, uid: "PO002", date: "2024-01-16", salesman: "Jane Smith", entityType: "Hospital", entityName: "ABC Hospital", state: "Delhi", district: "New Delhi", customerName: "Dr. Priya", designation: "Director", phoneNumber: "9876543211", email: "priya@abchospital.com" },
  { srNo: 3, uid: "PO003", date: "2024-01-17", salesman: "Mike Johnson", entityType: "Clinic", entityName: "Health Care Clinic", state: "Pune", district: "Pune", customerName: "Dr. Anil", designation: "Medical Practitioner", phoneNumber: "9876543212", email: "anil@healthcareclinic.com" },
];

const OVERVIEW_ITEMS = [
  { label: "Customer", color: "from-blue-500 to-indigo-500", IconComponent: FaUsers },
  { label: "Requirement", color: "from-green-500 to-emerald-500", IconComponent: FaFileAlt },
  { label: "Quotation", color: "from-yellow-500 to-orange-500", IconComponent: FaQuoteRight },
  { label: "Product", color: "from-purple-500 to-violet-500", IconComponent: FaBox },
];

const sampleRecentActivity = [
  { date: "2024-01-15", uid: "REQ001", status: "Requirement", salesman: "John Doe", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh" },
  { date: "2024-01-16", uid: "QUOT002", status: "Quotation", salesman: "Jane Smith", entityType: "Hospital", entityName: "ABC Hospital", state: "Delhi", district: "New Delhi", customerName: "Dr. Priya" },
];

const Manager = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  const handleRequirementSubmit = (data: { salesman: string; entityName: string }) => {
    console.log("Requirement data submitted:", data);
    setShowRequirementModal(false);
    // Navigate to requirement list page
    setActiveTab("requirement");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <RxDashboard /> },
    { id: "customer", label: "Customer", icon: <GrWorkshop /> },
    { id: "requirement", label: "Requirement", icon: <GrWorkshop /> },
    { id: "quotation", label: "Quotation", icon: <GrWorkshop /> },
    { id: "products", label: "Products", icon: <GrWorkshop /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  const handleMenuClick = (itemId: string) => {
    if (itemId === "requirement") {
      setShowRequirementModal(true);
    } else {
      setActiveTab(itemId);
    }
  };

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
    { accessorKey: "srNo", header: "Sr. No.", cell: ({ row }: any) => <div>{row.index + 1}</div> },
    { accessorKey: "uid", header: "UID" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "salesman", header: "Salesman" },
    { accessorKey: "entityName", header: "Entity Name" },
    { accessorKey: "date", header: "Date" },
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
    { accessorKey: "srNo", header: "Sr. No.", cell: ({ row }: any) => <div>{row.index + 1}</div> },
    { accessorKey: "uid", header: "UID" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "salesman", header: "Salesman" },
    { accessorKey: "entityName", header: "Entity Name" },
    { accessorKey: "date", header: "Date" },
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



  // Recent Activity columns
  const recentActivityColumns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "uid", header: "UID" },
    { 
      accessorKey: "status", 
      header: "Status", 
      cell: ({ row }: any) => {
        const status = row.original.status;
        const statusClasses = {
          "Requirement": "px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium",
          "Quotation": "px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
        };
        return <span className={statusClasses[status as keyof typeof statusClasses] || "px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"}>{status}</span>;
      }
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
                    onClick={() => handleMenuClick(item.id)}
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
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Manager Dashboard</h1>
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>

                </div>

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
                      disableExport={true}
                      disableColumnVisibility={true}
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
                    searchPlaceholder="Search by customer/entity name"
                    disableExport={true}
                    disableColumnVisibility={true}
                    enableSalesmanFilter={true}
                    salesmanOptions={["John Doe", "Jane Smith", "Mike Johnson"]}
                    salesmanColumnId="salesman"
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
                    searchColId="entityName"
                    searchPlaceholder="Search by customer/entity name"
                    disableExport={true}
                    disableColumnVisibility={true}
                    enableSalesmanFilter={true}
                    salesmanOptions={["John Doe", "Jane Smith", "Mike Johnson"]}
                    salesmanColumnId="salesman"
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

        {/* Requirement Modal */}
        <RequirementModal
          open={showRequirementModal}
          onOpenChange={setShowRequirementModal}
          onSubmit={handleRequirementSubmit}
        />
      </div>
    </div>
  );
};

export default Manager;
