import { useState, useEffect } from "react";
import { RxDashboard } from "react-icons/rx";
import { GrWorkshop } from "react-icons/gr";
import { FaSignOutAlt, FaEye, FaFileAlt, FaBox, FaEdit } from "react-icons/fa";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

import ViewModal from "@/components/ui/ViewModal";
import { useLocation, useNavigate } from "react-router-dom";
import { getGeneratedRequirements, type GeneratedRequirement } from "@/medicop/storage";

// Sample data for demonstration
const sampleOrganizations = [
  { srNo: 1, name: "XYZ Institute", type: "Institute" },
  { srNo: 2, name: "ABC Hospital", type: "Hospital" },
  { srNo: 3, name: "Health Care Clinic", type: "Clinic" },
];

// Function to map generated requirements to table format
const mapRequirementsToTableFormat = (requirements: GeneratedRequirement[]) => {
  return requirements.map(req => ({
    date: req.date,
    rid: req.uid,
    organizationName: req.entityName,
    organizationType: req.entityType,
  }));
};

// Function to map generated requirements to recent activity format
const mapRequirementsToRecentActivityFormat = (requirements: GeneratedRequirement[]) => {
  return requirements.map(req => ({
    date: req.date,
    organizationName: req.entityName,
    organizationType: req.entityType,
    state: req.state,
    district: req.district,
    rid: req.uid,
  }));
};

const OVERVIEW_ITEMS = [
  { label: "Requirement", color: "from-green-500 to-emerald-500", IconComponent: FaFileAlt },
  { label: "Organization", color: "from-blue-500 to-indigo-500", IconComponent: FaBox },
];

const Salesman = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    (location.state as any)?.openRequirementTab ? "requirement" : "dashboard"
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewModalData, setViewModalData] = useState<any>(null);
  const [viewModalType, setViewModalType] = useState<"customer" | "requirement" | "quotation" | "organization" | "product-manager">("customer");
  const [requirements, setRequirements] = useState<GeneratedRequirement[]>([]);

  // Load requirements on component mount
  useEffect(() => {
    const storedRequirements = getGeneratedRequirements();
    setRequirements(storedRequirements);
  }, []);






  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <RxDashboard /> },
    { id: "organization", label: "Organization", icon: <GrWorkshop /> },
    { id: "requirement", label: "Requirement", icon: <GrWorkshop /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  const handleMenuClick = (itemId: string) => {
    console.log("handleMenuClick called with itemId:", itemId); // Add this line for debugging
    if (itemId === "logout") {
      // Handle logout
    } else {
      setActiveTab(itemId);
    }
  };

  // Organization table columns
  const organizationColumns = [
    { accessorKey: "srNo", header: "Sr. No.", cell: ({ row }: any) => <div>{row.index + 1}</div> },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
     { 
      accessorKey: "action", 
      header: "Requirement", 
      cell: ({ row }: any) => (
        <Button variant="ghost" onClick={() => {
          setViewModalData(row.original);
          setViewModalType("organization");
          setShowViewModal(true);
        }}>
          <FaEye size={16} />
        </Button>
      )
    },
     { 
      accessorKey: "profile", 
      header: "Action", 
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            // Handle profile action
          //   console.log("Profile action for:", row.original.name);
          // }}>
          //   <FaEye size={14} />
          // </Button>
          // <Button variant="ghost" size="sm" onClick={() => {
            // Handle edit action
            console.log("Edit action for:", row.original.name);
          }}>
            <FaEdit size={14} />
          </Button>
        </div>
      )
    },
  ];

  // Requirement table columns
  const requirementColumns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "rid", header: "RID (Requirement ID)" },
    { accessorKey: "organizationName", header: "Organization Name" },
    { accessorKey: "organizationType", header: "Organization Type" },
      { 
        accessorKey: "action", 
        header: "Requirement", 
        cell: ({ row }: any) => (
          <Button variant="ghost" onClick={() => {
            // Find the complete requirement data by RID
            const completeRequirement = requirements.find(req => req.uid === row.original.rid);
            if (completeRequirement) {
              navigate("/requirement?mode=medicop", {
                state: { generatedRequirement: completeRequirement, editable: true },
              });
            }
          }}>
            <FaEye size={16} />
          </Button>
        )
      },
  ];





  // Recent RFQ columns
  const recentActivityColumns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "organizationName", header: "Organization Name" },
    { accessorKey: "organizationType", header: "Organization Type" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "district", header: "District" },
     { 
      accessorKey: "action", 
      header: "Requirement", 
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
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors rounded-md ${
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Salesman Dashboard</h1>
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
                  {OVERVIEW_ITEMS.map((item, index) => {
                    let count = 0;
                    if (item.label === "Requirement") count = requirements.length;
                    if (item.label === "Organization") count = sampleOrganizations.length;
                    
                    return (
                      <div 
                        key={index}
                          onClick={() => {
                            setActiveTab(item.label.toLowerCase().replace(/\s+\(po\)/, ''));
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

                {/* Recent RFQ */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-12 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent RFQ</h3>
                  <div className="overflow-x-auto">
                    <DataTable
                      data={mapRequirementsToRecentActivityFormat(requirements.slice(0, 5))}
                      columns={recentActivityColumns}
                      docName="recent-rfq"
                      searchColId="organizationName"
                      searchPlaceholder="Search by organization name"
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

          {activeTab === "organization" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Organization List</h3>
                <div className="overflow-x-auto">
                  <DataTable
                    data={sampleOrganizations}
                    columns={organizationColumns}
                    docName="organizations"
                    searchColId="name"
                    searchPlaceholder="Search by organization name"
                    enableStatusFilter={false}
                    enableSalesmanFilter={false}
                    disableExport={true}
                    disableColumnVisibility={true}
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
                    data={mapRequirementsToTableFormat(requirements)}
                    columns={requirementColumns}
                    docName="requirements"
                    disableExport={true}
                    disableColumnVisibility={true}
                    disableSearch={true}
                    enableStatusFilter={false}
                  />
                </div>
              </div>
            </div>
          )}





          {activeTab === "products" && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Product Upload Form</h3>
                <p className="text-gray-600 mb-4">Dummy product upload screen for Medical Manager flow.</p>
                <Button
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  onClick={() => navigate("/medicop/product-upload-form")}
                >
                  Open Product Upload Form
                </Button>
              </div>
            </div>
          )}
        </div>

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

export default Salesman;
