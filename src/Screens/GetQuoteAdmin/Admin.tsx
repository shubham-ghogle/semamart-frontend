import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RxDashboard } from "react-icons/rx";
import { GrWorkshop } from "react-icons/gr";
import { FaSignOutAlt, FaEye, FaUsers, FaFileAlt,} from "react-icons/fa";
import RequirementModal from "@/components/ui/RequirementModal";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

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
  { label: "Requirement", color: "from-green-500 to-emerald-500", IconComponent: FaFileAlt },
  // { label: "Quotation", color: "from-yellow-500 to-orange-500", IconComponent: FaQuoteRight },
  { label: "Manager", color: "from-purple-500 to-violet-500", IconComponent: FaUsers },
  { label: "Salesman", color: "from-pink-500 to-rose-500", IconComponent: FaUsers },
];

const sampleRecentActivity = [
  { date: "2024-01-15", uid: "REQ001", status: "Requirement", salesman: "John Doe", entityType: "Institute", entityName: "XYZ Institute", state: "Maharashtra", district: "Mumbai", customerName: "Dr. Rajesh" },
  { date: "2024-01-16", uid: "QUOT002", status: "Requirement", salesman: "Jane Smith", entityType: "Hospital", entityName: "ABC Hospital", state: "Delhi", district: "New Delhi", customerName: "Dr. Priya" },
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
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSpecialityModal, setShowAddSpecialityModal] = useState(false);
  const [showAddScopeModal, setShowAddScopeModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [newScope, setNewScope] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

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

  const handleRequirementSubmit = (data: { salesman: string; entityName: string; type: "requirement" | "quotation" }) => {
    console.log("Requirement data submitted:", data);
    setShowRequirementModal(false);
    setSelectedSalesman(data.salesman);
    setSelectedEntityName(data.entityName);
    // Navigate to the appropriate list page
    setActiveTab(data.type);
  };

  const handleSearch = () => {
    console.log("Searching with:", { selectedSalesman, selectedEntityName });
  };



  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <RxDashboard /> },
    { id: "medical-manager", label: "Medical Manager", icon: <GrWorkshop /> },
    { id: "requirement", label: "Requirement", icon: <GrWorkshop /> },
    // { id: "quotation", label: "Quotation", icon: <GrWorkshop /> },
    { id: "manager", label: "Manager", icon: <GrWorkshop /> },
    { id: "salesman", label: "Salesman", icon: <GrWorkshop /> },
    { id: "product-spec-master", label: "Product Spec Master", icon: <GrWorkshop /> },
    { id: "speciality-master", label: "Speciality Master", icon: <GrWorkshop /> },
    { id: "scope-department-master", label: "Department Master", icon: <GrWorkshop /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  const handleMenuClick = (itemId: string) => {
    if (itemId === "medical-manager") {
      window.location.href = "/medicop";
      return;
    }
    if (itemId === "requirement" || itemId === "quotation") {
      setModalType(itemId as "requirement" | "quotation");
      setShowRequirementModal(true);
    } else if (itemId === "manager" || itemId === "salesman") {
      // Navigate to the appropriate subpage for manager and salesman
      window.location.href = `/get-quote-admin/${itemId}`;
    } else {
      // For other items, stay within the same dashboard and switch tabs
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
                        ? "bg-teal-100 text-teal-700"
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
                      ? "bg-teal-100 text-teal-700"
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

          {activeTab === "product-spec-master" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Product Spec Master</h3>
                <p className="text-gray-600">Product Spec Master functionality will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === "category-master" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Category Master</h3>
                  <Button 
                    className="bg-teal-600 text-white hover:bg-teal-700"
                    onClick={() => setShowAddCategoryModal(true)}
                  >
                    Add Category
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <DataTable
                    data={[
                      { 
                        srNo: 1, 
                        category: "Consumables", 
                        subCategory: "Surgical & Examination Gloves, Masks & Personal Protective Equipment (PPE), Syringes & Needles, IV Sets & Infusion Supplies, Catheters & Tubes, Drapes, Sheets & Underpads, Wound Care & Dressings, Respiratory Consumables, Infection Control & Cleaning, Diagnostic Consumables, General Use Disposables" 
                      },
                      { 
                        srNo: 2, 
                        category: "Instruments", 
                        subCategory: "General Surgical Instruments, ENT Instruments, Gynaecology & Obstetrics Instruments, Orthopaedic Instruments, Ophthalmic Instruments, Dental Instruments, Diagnostic Instruments, Minor OT / OPD Sets, Paediatric & Neonatal Instruments" 
                      },
                      { 
                        srNo: 3, 
                        category: "Medical Equipment", 
                        subCategory: "Patient Monitoring Equipment, ICU & Emergency Equipment, Operation Theatre Equipment, Diagnostic Imaging Equipment, Anesthesia & Airway Equipment, Surgical Equipment, Rehabilitation & Physiotherapy Equipment, Respiratory & Oxygen Therapy Equipment, Sterilization & Disinfection Equipment" 
                      },
                      { 
                        srNo: 4, 
                        category: "Advanced & Robotic Systems", 
                        subCategory: "Robotic Surgery Systems, Endoscopy & Image-Guided Systems, AI-Enabled Diagnostic Platforms, Navigation & Intra-Operative Systems, Robotic Rehabilitation & Assistive Devices, Smart ICU & Remote Monitoring Systems, Telemedicine & Virtual Care Platforms, Robotic Pharmacy & Laboratory Automation, Smart OT Integration Systems" 
                      },
                      { 
                        srNo: 5, 
                        category: "Diagnostics", 
                        subCategory: "Laboratory Equipment, Hematology & Blood Analyzers, Biochemistry & Immunoassay, Microbiology Equipment, Molecular Diagnostics, Diagnostic Kits & Strips, Point-of-Care Testing Devices, Sample Collection & Processing" 
                      },
                      { 
                        srNo: 6, 
                        category: "Hospital Furniture", 
                        subCategory: "Hospital Beds, Examination & OPD Furniture, ICU & Patient Room Furniture, OT & Procedure Room Furniture, Ward Furniture, Stretchers & Trolleys, Pediatric & Neonatal Furniture, Reception & Administrative Furniture, Cafeteria & Utility Furniture" 
                      },
                      { 
                        srNo: 7, 
                        category: "Pharmaceuticals & Therapeutics", 
                        subCategory: "Prescription Drugs, Over-the-Counter, Generic Drugs, Brand Name Drugs, Biologics" 
                      },
                      { 
                        srNo: 8, 
                        category: "Hospital IT & Software", 
                        subCategory: "Hospital Information Systems (HIS), Laboratory Information Systems (LIS), Radiology & Imaging Software (PACS & RIS), Electronic Medical Records (EMR) Systems, Telemedicine & Virtual Care Platforms, Queue & Token Management Systems, Billing, Inventory & Pharmacy Software, HR, Payroll & Roster Systems, Nursing & Clinical Workflow Tools, Hospital Analytics & Dashboard Systems, Security, Access & Backup Systems" 
                      },
                      { 
                        srNo: 9, 
                        category: "Kits & Bundles", 
                        subCategory: "Surgical Procedure Kits, Dressing & Wound Care Kits, Catheterization Kits, Delivery & Obstetric Kits, Sampling & Collection Kits, IV Infusion & Injection Kits, Anesthesia & Airway Management Kits, Emergency & Trauma Kits, Isolation & Infection Control Kits, Diagnostic Bundles" 
                      },
                      { 
                        srNo: 10, 
                        category: "Facility & Utilities", 
                        subCategory: "Housekeeping & Cleaning Equipment, Biomedical Waste (BMW) Management, Laundry & Linen Management, Water Supply & Plumbing, Electrical & Power Backup Systems, Fire Safety & Disaster Management, Maintenance Tools & Engineering Services, Signage & Wayfinding, Air Conditioning, Ventilation & HVAC, Stationery & Patient Band" 
                      },
                    ]}
                    columns={[
                      { accessorKey: "srNo", header: "Sr. No." },
                      { accessorKey: "category", header: "Category" },
                      { 
                        accessorKey: "subCategory", 
                        header: "Sub-category", 
                        cell: ({ row }: any) => (
                          <div className="flex flex-col space-y-1">
                            {row.original.subCategory.split(', ').map((sub: string, index: number) => (
                              <div key={index} className="flex items-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                                {sub}
                              </div>
                            ))}
                          </div>
                        )
                      },
                    ]}
                    docName="category-master"
                    searchColId="category"
                    searchPlaceholder="Search by category"
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                    disableExport={true}
                    disableColumnVisibility={true}
                    disableSearch={true}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "speciality-master" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Speciality Master</h3>
                  <Button 
                    className="bg-teal-600 text-white hover:bg-teal-700"
                    onClick={() => setShowAddSpecialityModal(true)}
                  >
                    Add Speciality
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <DataTable
                    data={[
                      { 
                        srNo: 1, 
                        speciality: "ICU Setup Packages", 
                        subSpeciality: "5-Bed ICU Starter Kit, 10-Bed Modular ICU Package, Pediatric ICU (PICU) Bundle, Neonatal ICU (NICU) Package, Isolation ICU Setup (with Negative Pressure), ICU Monitoring Bundle (monitors, syringe pumps, beds), Ventilator + ABG + Infusion Kit Bundle, ICU Crash Cart with Emergency Drugs" 
                      },
                      { 
                        srNo: 2, 
                        speciality: "Operation Theatre Setup Packages", 
                        subSpeciality: "Basic OT Package (general surgery), Advanced Modular OT Package (orthopedics, neuro), Gynae OT Package (for LSCS and D&C), OT Instrument Sets (major, minor, laparotomy, delivery), OT Lights & Tables Combo, Cautery + Suction + Anesthesia Cart Combo, Disposable OT Consumables Pack, OT Sterilization Zone Setup (CSSD + Autoclave), Laminar Flow OT HVAC Package" 
                      },
                      { 
                        srNo: 3, 
                        speciality: "OPD & Consultation Room Packages", 
                        subSpeciality: "General Medicine OPD Kit, Pediatric OPD Package, ENT OPD Setup (chair, diagnostic set, light), Gynecology OPD Setup (couch, instruments), Dental OPD Package (dental chair, light, handpieces), Dermatology OPD Starter Kit, Ophthalmology OPD Basic Setup, OPD EMR + Queue Token System" 
                      },
                      { 
                        srNo: 4, 
                        speciality: "Diagnostic Lab Packages", 
                        subSpeciality: "Basic Path Lab Setup (biochem + hematology), Microbiology Lab Setup, Molecular Lab Package (PCR, extraction, biosafety), NABL-Compliant Lab Starter Kit, Sample Collection Room Package, Blood Collection + Vacutainer Bundle, Lab Furniture + Storage Cabinets, LIS Software + Barcode Scanner Pack" 
                      },
                      { 
                        srNo: 5, 
                        speciality: "Radiology & Imaging Packages", 
                        subSpeciality: "Basic X-Ray Room Setup (machine + lead shield + PACS), Ultrasound Room Setup (portable/standard unit + couch), CT Room Setup (with lead protection + consoles), Mobile Imaging Van Kit, CR/DR Conversion Package, PACS + RIS Software Bundle, Radiation Safety Compliance Kit (TLDs, aprons), Patient Privacy & Comfort Accessories" 
                      },
                      { 
                        srNo: 6, 
                        speciality: "Labour Room & Maternity Ward Packages", 
                        subSpeciality: "Labour Room Equipment Package, Delivery Instrument Set, CTG + Fetal Doppler Combo, Obstetric OT Kit (for LSCS), Baby Resuscitation Corner Setup, Postnatal Ward Furniture Bundle, Maternity Care Consumables Kit, Kangaroo Mother Care Accessories" 
                      },
                      { 
                        srNo: 7, 
                        speciality: "Dental Clinic Setup Packages", 
                        subSpeciality: "Single Chair Dental Setup, Digital X-Ray + IOPA Kit, Dental Instruments Kit (general, scaling, extraction), Compressor + Suction Machine Bundle, Dental Chair Accessories (scaler, curing light, airotor), Sterilization Zone Setup for Clinic, Dental OPD Software (billing + case records)" 
                      },
                      { 
                        srNo: 8, 
                        speciality: "Dialysis Centre Packages", 
                        subSpeciality: "2-Bed Dialysis Starter Kit, RO Water System for Dialysis, Dialysis Machine + Chair Combo, Dialysis Consumables Bundle (AVF needles, lines, fluids), Patient Monitoring Kit, Dialysis Waste Disposal System, Dialysis Billing Software & Logbooks" 
                      },
                      { 
                        srNo: 9, 
                        speciality: "Emergency & Trauma Room Packages", 
                        subSpeciality: "ER Triage Setup (beds + vitals + signage), Emergency Equipment Pack (defibrillator, monitor, suction), Crash Cart + Emergency Drug Pack, Primary Trauma Care (splints, spine board, head blocks), Disaster & Mass Casualty Kit, Emergency Room Furniture Pack, First Responder Backpack Kit" 
                      },
                      { 
                        srNo: 10, 
                        speciality: "Mobile Clinic & PHC/CHC Kits", 
                        subSpeciality: "Ayushman Bharat HWC Kit, Mobile Clinic Vehicle Kit, PHC Diagnostic Kit (BP, ECG, RBS, urine, Hb), NCD Screening Kit (diabetes, HTN, cancer), Portable Lab + X-Ray + Tablet Based EMR, Rural Telemedicine Kit, Solar Power Kit for PHC/CHC, Maternal & Child Health Combo Kit" 
                      },
                    ]}
                    columns={[
                      { accessorKey: "srNo", header: "Sr. No." },
                      { accessorKey: "speciality", header: "Speciality" },
                      { 
                        accessorKey: "subSpeciality", 
                        header: "Sub-Speciality", 
                        cell: ({ row }: any) => (
                          <div className="flex flex-col space-y-1">
                            {row.original.subSpeciality.split(', ').map((sub: string, index: number) => (
                              <div key={index} className="flex items-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                                {sub}
                              </div>
                            ))}
                          </div>
                        )
                      },
                    ]}
                    docName="speciality-master"
                    searchColId="speciality"
                    searchPlaceholder="Search by speciality"
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                    disableExport={true}
                    disableColumnVisibility={true}
                    disableSearch={true}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "scope-department-master" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Department</h3>
                    <Button 
                      className="bg-teal-600 text-white hover:bg-teal-700"
                      onClick={() => setShowAddDepartmentModal(true)}
                    >
                      Add Department
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <DataTable
                      data={[
                        { srNo: 1, department: "EMERGENCY MEDICINE" },
                        { srNo: 2, department: "ORTHOPEDICS" },
                        { srNo: 3, department: "NEUROLOGY" },
                        { srNo: 4, department: "DENTAL" },
                        { srNo: 5, department: "CARDIOLOGY" },
                        { srNo: 6, department: "EAR NOSE AND THROAT" },
                        { srNo: 7, department: "PATHOLOGY" },
                        { srNo: 8, department: "GASTROENTEROLOGY" },
                        { srNo: 9, department: "RESPIRATORY MEDICINE" },
                        { srNo: 10, department: "MICROBIOLOGY" },
                        { srNo: 11, department: "RADIOLOGY" },
                        { srNo: 12, department: "OB/GYN" },
                        { srNo: 13, department: "ONCOLOGY" },
                        { srNo: 14, department: "NEPHROLOGY" },
                        { srNo: 15, department: "PULMONOLOGY" },
                        { srNo: 16, department: "DERMATOLOGY" },
                        { srNo: 17, department: "ENDOCRINOLOGY" },
                        { srNo: 18, department: "OPHTHALMOLOGY" },
                        { srNo: 19, department: "OTOLARYNGOLOGY" },
                        { srNo: 20, department: "UROLOGY" },
                        { srNo: 21, department: "PSYCHIATRY" },
                        { srNo: 22, department: "ANESTHESIOLOGY" },
                        { srNo: 23, department: "GENERAL SURGERY" },
                        { srNo: 24, department: "PLASTIC AND RECONSTRUCTIVE SURGERY" },
                        { srNo: 25, department: "PHYSICAL MEDICINE AND REHABILITATION" },
                        { srNo: 26, department: "NEONATOLOGY" },
                      ]}
                      columns={[
                        { accessorKey: "srNo", header: "Sr. No." },
                        { accessorKey: "department", header: "Department" },
                      ]}
                    docName="department-master"
                    searchColId="department"
                    searchPlaceholder="Search by department"
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                    disableExport={true}
                    disableColumnVisibility={true}
                    disableSearch={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}



        </div>

        {/* Add Category Modal */}
        <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Input
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category
                </label>
                <Input
                  id="subCategory"
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  placeholder="Enter sub-category name"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategory("");
                  setNewSubCategory("");
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => {
                  // Handle save functionality here
                  console.log("Saving category:", newCategory, newSubCategory);
                  setShowAddCategoryModal(false);
                  setNewCategory("");
                  setNewSubCategory("");
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Speciality Modal */}
        <Dialog open={showAddSpecialityModal} onOpenChange={setShowAddSpecialityModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Speciality</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">
                  Speciality
                </label>
                <Input
                  id="speciality"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter speciality name"
                />
              </div>
              <div>
                <label htmlFor="subSpeciality" className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Speciality
                </label>
                <Input
                  id="subSpeciality"
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  placeholder="Enter sub-speciality name"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddSpecialityModal(false);
                  setNewCategory("");
                  setNewSubCategory("");
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => {
                  // Handle save functionality here
                  console.log("Saving speciality:", newCategory, newSubCategory);
                  setShowAddSpecialityModal(false);
                  setNewCategory("");
                  setNewSubCategory("");
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Scope Modal */}
        <Dialog open={showAddScopeModal} onOpenChange={setShowAddScopeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Scope</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="scope" className="block text-sm font-medium text-gray-700 mb-1">
                  Scope
                </label>
                <Input
                  id="scope"
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  placeholder="Enter scope name"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddScopeModal(false);
                  setNewScope("");
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => {
                  // Handle save functionality here
                  console.log("Saving scope:", newScope);
                  setShowAddScopeModal(false);
                  setNewScope("");
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Department Modal */}
        <Dialog open={showAddDepartmentModal} onOpenChange={setShowAddDepartmentModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <Input
                  id="department"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDepartmentModal(false);
                  setNewDepartment("");
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => {
                  // Handle save functionality here
                  console.log("Saving department:", newDepartment);
                  setShowAddDepartmentModal(false);
                  setNewDepartment("");
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
