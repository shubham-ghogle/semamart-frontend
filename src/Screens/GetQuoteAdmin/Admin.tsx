import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RxDashboard } from "react-icons/rx";
import { GrWorkshop } from "react-icons/gr";
import { FaSignOutAlt, FaEye, FaUsers, FaFileAlt, FaQuoteRight } from "react-icons/fa";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import RequirementModal from "@/components/ui/RequirementModal";
import ViewModal from "@/components/ui/ViewModal";

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

const sampleManagers = [
  { srNo: 1, uid: "MGR001", name: "John Doe", email: "john.doe@example.com", phoneNumber: "9876543210" },
  { srNo: 2, uid: "MGR002", name: "Jane Smith", email: "jane.smith@example.com", phoneNumber: "9876543211" },
  { srNo: 3, uid: "MGR003", name: "Mike Johnson", email: "mike.johnson@example.com", phoneNumber: "9876543212" },
];

const sampleSalesmen = [
  { srNo: 1, uid: "SLS001", name: "Tom Brown", email: "tom.brown@example.com", phoneNumber: "9876543213" },
  { srNo: 2, uid: "SLS002", name: "Sarah Wilson", email: "sarah.wilson@example.com", phoneNumber: "9876543214" },
  { srNo: 3, uid: "SLS003", name: "David Lee", email: "david.lee@example.com", phoneNumber: "9876543215" },
  { srNo: 4, uid: "SLS004", name: "Emma Davis", email: "emma.davis@example.com", phoneNumber: "9876543216" },
];

const OVERVIEW_ITEMS = [
  { label: "Customer", color: "from-blue-500 to-indigo-500", IconComponent: FaUsers },
  { label: "Requirement", color: "from-green-500 to-emerald-500", IconComponent: FaFileAlt },
  { label: "Quotation", color: "from-yellow-500 to-orange-500", IconComponent: FaQuoteRight },
  { label: "Manager", color: "from-purple-500 to-violet-500", IconComponent: FaUsers },
  { label: "Salesman", color: "from-pink-500 to-rose-500", IconComponent: FaUsers },
];

const sampleRecentActivity = [
  { date: "2024-01-15", uid: "REQ001", status: "Requirement", salesman: "John Doe", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh" },
  { date: "2024-01-16", uid: "QUOT002", status: "Quotation", salesman: "Jane Smith", entityType: "Hospital", entityName: "ABC Hospital", state: "Delhi", district: "New Delhi", customerName: "Dr. Priya" },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [modalType, setModalType] = useState<"requirement" | "quotation">("requirement");
  const [selectedSalesman, setSelectedSalesman] = useState<string>("");
  const [selectedEntityName, setSelectedEntityName] = useState<string>("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewModalData, setViewModalData] = useState<any>(null);
  const [viewModalType, setViewModalType] = useState<"customer" | "requirement" | "quotation" | "manager" | "salesman">("customer");

  // Filter requirements based on selected salesman and entity name
  const filteredRequirements = useMemo(() => {
    return sampleRequirements.filter(item => {
      const matchesSalesman = selectedSalesman === "all" || !selectedSalesman || item.salesman === selectedSalesman;
      const matchesEntityName = !selectedEntityName || item.entityName.toLowerCase().includes(selectedEntityName.toLowerCase());
      return matchesSalesman && matchesEntityName;
    });
  }, [selectedSalesman, selectedEntityName]);

  // Filter quotations based on selected salesman and entity name
  const filteredQuotations = useMemo(() => {
    return sampleQuotations.filter(item => {
      const matchesSalesman = selectedSalesman === "all" || !selectedSalesman || item.salesman === selectedSalesman;
      const matchesEntityName = !selectedEntityName || item.entityName.toLowerCase().includes(selectedEntityName.toLowerCase());
      return matchesSalesman && matchesEntityName;
    });
  }, [selectedSalesman, selectedEntityName]);

  const handleSearch = () => {
    console.log("Searching with:", { selectedSalesman, selectedEntityName });
  };

  const handleRequirementSubmit = (data: { salesman: string; entityName: string; type: "requirement" | "quotation" }) => {
    console.log("Requirement data submitted:", data);
    setShowRequirementModal(false);
    setSelectedSalesman(data.salesman);
    setSelectedEntityName(data.entityName);
    // Navigate to the appropriate list page
    setActiveTab(data.type);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <RxDashboard /> },
    { id: "customer", label: "Customer", icon: <GrWorkshop /> },
    { id: "requirement", label: "Requirement", icon: <GrWorkshop /> },
    { id: "quotation", label: "Quotation", icon: <GrWorkshop /> },
    { id: "manager", label: "Manager", icon: <GrWorkshop /> },
    { id: "salesman", label: "Salesman", icon: <GrWorkshop /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  const handleMenuClick = (itemId: string) => {
    if (itemId === "requirement" || itemId === "quotation") {
      setModalType(itemId as "requirement" | "quotation");
      setShowRequirementModal(true);
    } else {
      // Navigate to the appropriate subpage
      let path = itemId;
      if (itemId === "salesmen") {
        path = "salesman"; // Changed back to original URL
      } else if (itemId === "managers") {
        path = "manager"; // Singular for manager
      }
      window.location.href = `/get-quote-admin/${path}`;
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
        <Button variant="ghost" onClick={() => {
          setViewModalData(row.original);
          setViewModalType("customer");
          setShowViewModal(true);
        }}>
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
        <Button variant="ghost" onClick={() => {
          setViewModalData(row.original);
          setViewModalType("requirement");
          setShowViewModal(true);
        }}>
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
        <Button variant="ghost" onClick={() => {
          setViewModalData(row.original);
          setViewModalType("quotation");
          setShowViewModal(true);
        }}>
          <FaEye size={16} />
        </Button>
      )
    },
  ];

  // Manager table columns
  const managerColumns = [
    { accessorKey: "srNo", header: "Sr. No.", cell: ({ row }: any) => <div>{row.index + 1}</div> },
    { accessorKey: "uid", header: "UID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phoneNumber", header: "Phone Number" },
     { 
      accessorKey: "action", 
      header: "Action", 
      cell: ({ row }: any) => (
        <Button variant="ghost" onClick={() => {
          setViewModalData(row.original);
          setViewModalType("manager");
          setShowViewModal(true);
        }}>
          <FaEye size={16} />
        </Button>
      )
    },
  ];

  // Salesman table columns
  const salesmanColumns = [
    { accessorKey: "srNo", header: "Sr. No.", cell: ({ row }: any) => <div>{row.index + 1}</div> },
    { accessorKey: "uid", header: "UID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phoneNumber", header: "Phone Number" },
     { 
      accessorKey: "action", 
      header: "Action", 
      cell: ({ row }: any) => (
        <Button variant="ghost" onClick={() => {
          setViewModalData(row.original);
          setViewModalType("salesman");
          setShowViewModal(true);
        }}>
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
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
                    if (item.label === "Manager") count = sampleManagers.length;
                    if (item.label === "Salesman") count = sampleSalesmen.length;
                    
                    return (
                      <div 
                        key={index}
                        onClick={() => {
                          if (item.label === "Requirement") {
                            setModalType("requirement");
                            setShowRequirementModal(true);
                          } else if (item.label === "Quotation") {
                            setModalType("quotation");
                            setShowRequirementModal(true);
                          } else {
                            setActiveTab(item.label.toLowerCase().replace(/\s+\(po\)/, ''));
                          }
                        }}
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
                      enableStatusFilter={false}
                      enableSalesmanFilter={false}
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
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "requirement" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* Salesman and Entity Name Search */}
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-4 items-center mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salesman</label>
                    <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Salesman" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Doe">John Doe</SelectItem>
                        <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
                    <Input
                      value={selectedEntityName}
                      onChange={(e) => setSelectedEntityName(e.target.value)}
                      placeholder="Search by entity name"
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" className="bg-teal-600 text-white hover:bg-teal-700">
                    Submit
                  </Button>
                </form>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Requirement List</h3>
                <div className="overflow-x-auto">
                   <DataTable
                    data={filteredRequirements}
                    columns={requirementColumns}
                    docName="requirements"
                    disableExport={true}
                    disableColumnVisibility={true}
                    disableSearch={true}
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "quotation" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* Salesman and Entity Name Search */}
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-4 items-center mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salesman</label>
                    <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Salesman" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Doe">John Doe</SelectItem>
                        <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
                    <Input
                      value={selectedEntityName}
                      onChange={(e) => setSelectedEntityName(e.target.value)}
                      placeholder="Search by entity name"
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" className="bg-teal-600 text-white hover:bg-teal-700">
                    Submit
                  </Button>
                </form>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quotation List</h3>
                <div className="overflow-x-auto">
                   <DataTable
                    data={filteredQuotations}
                    columns={quotationColumns}
                    docName="quotations"
                    disableExport={true}
                    disableColumnVisibility={true}
                    disableSearch={true}
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "managers" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Manager List</h3>
                <div className="overflow-x-auto">
                  <DataTable
                    data={sampleManagers}
                    columns={managerColumns}
                    docName="managers"
                    searchColId="name"
                    searchPlaceholder="Search by name"
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "salesmen" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Salesman List</h3>
                <div className="overflow-x-auto">
                  <DataTable
                    data={sampleSalesmen}
                    columns={salesmanColumns}
                    docName="salesmen"
                    searchColId="name"
                    searchPlaceholder="Search by name"
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                  />
                </div>
              </div>
            </div>
          )}



        </div>

        {/* Requirement Modal */}
        <RequirementModal
          open={showRequirementModal}
          onOpenChange={setShowRequirementModal}
          onSubmit={handleRequirementSubmit}
          type={modalType}
        />
        
        {/* View Modal */}
        <ViewModal
          open={showViewModal}
          onOpenChange={setShowViewModal}
          title={`${viewModalType.charAt(0).toUpperCase() + viewModalType.slice(1)} Details`}
          data={viewModalData}
          type={viewModalType}
        />
      </div>
    </div>
  );
};

export default Admin;
