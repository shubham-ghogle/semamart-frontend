import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"

// --- Types ---
type ProductSpec = {
  srNo: number
  thumbnail: string
  specName: string
  speciality: string
  subSpeciality: string
  department: string
}

// --- Mock Data ---
const productRows: ProductSpec[] = [
  { srNo: 1, thumbnail: "/products/monitor.jpg", specName: "ICU Patient Monitor", speciality: "ICU Setup Packages", subSpeciality: "ICU Monitoring Bundle", department: "CARDIOLOGY" },
  { srNo: 2, thumbnail: "/products/ventilator.jpg", specName: "Ventilator Machine", speciality: "ICU Setup Packages", subSpeciality: "Ventilator + ABG + Infusion Kit Bundle", department: "RESPIRATORY MEDICINE" },
  { srNo: 3, thumbnail: "/products/lab.jpg", specName: "Biochemistry Analyzer", speciality: "Diagnostic Lab Packages", subSpeciality: "Pathology Lab Setup", department: "PATHOLOGY" },
]

export default function ProductSpecMaster() {
  const [searchText, setSearchText] = useState("")
  const [selectedSpeciality, setSelectedSpeciality] = useState("all")
  const [selectedSubSpeciality, setSelectedSubSpeciality] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Filter Logic
  const filteredData = useMemo(() => {
    return productRows.filter((item) => {
      const matchesSearch = !searchText || item.specName.toLowerCase().includes(searchText.toLowerCase())
      const matchesSpec = selectedSpeciality === "all" || item.speciality === selectedSpeciality
      const matchesSub = selectedSubSpeciality === "all" || item.subSpeciality === selectedSubSpeciality
      const matchesDept = selectedDepartment === "all" || item.department === selectedDepartment
      return matchesSearch && matchesSpec && matchesSub && matchesDept
    })
  }, [searchText, selectedSpeciality, selectedSubSpeciality, selectedDepartment])

  const resetFilters = () => {
    setSearchText("")
    setSelectedSpeciality("all")
    setSelectedSubSpeciality("all")
    setSelectedDepartment("all")
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      

      {/* UNIFIED CONTAINER: This removes the gap */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        
        {/* HEADER & FILTER BAR */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Product Filter
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <Input
              placeholder="Search Spec Name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-gray-50/50"
            />

            {/* Speciality */}
            <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
              <SelectTrigger><SelectValue placeholder="All Specialities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialities</SelectItem>
                <SelectItem value="ICU Setup Packages">ICU Setup Packages</SelectItem>
                <SelectItem value="Diagnostic Lab Packages">Diagnostic Lab Packages</SelectItem>
              </SelectContent>
            </Select>

            {/* Sub-speciality */}
            <Select value={selectedSubSpeciality} onValueChange={setSelectedSubSpeciality}>
              <SelectTrigger><SelectValue placeholder="All Sub-specialities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub-specialities</SelectItem>
                <SelectItem value="ICU Monitoring Bundle">ICU Monitoring Bundle</SelectItem>
                <SelectItem value="Pathology Lab Setup">Pathology Lab Setup</SelectItem>
              </SelectContent>
            </Select>

            {/* Department */}
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="CARDIOLOGY">Cardiology</SelectItem>
                <SelectItem value="PATHOLOGY">Pathology</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button
              className="bg-[#1C647C] hover:bg-[#164d5f] text-white transition-colors"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* TABLE SECTION: Direct child of the unified container */}
        <div className="w-full">
          <DataTable
            data={filteredData}
            columns={columns}
            docName="product-spec-master"
            disableExport
            disableColumnVisibility
            disableSearch // We are using our custom search above
          />
        </div>
      </div>
    </div>
  )
}

// --- Column Definitions ---
const columns = [
  {
    accessorKey: "srNo",
    header: "Sr. No.",
    cell: ({ row }: any) => <span className="text-gray-600 font-medium">{row.index + 1}</span>,
  },
  {
    accessorKey: "thumbnail",
    header: "Image",
    cell: ({ row }: any) => (
      <div className="w-10 h-10 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
        <img
          src={row.original.thumbnail || "/placeholder.png"}
          alt="spec"
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/40")}
        />
      </div>
    ),
  },
  {
    accessorKey: "specName",
    header: "Spec Name",
    cell: ({ row }: any) => <span className="font-medium text-gray-900">{row.original.specName}</span>,
  },
  {
    accessorKey: "speciality",
    header: "Speciality",
    cell: ({ row }: any) => (
      <span className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-semibold">
        {row.original.speciality}
      </span>
    ),
  },
  {
    accessorKey: "subSpeciality",
    header: "Sub-speciality",
    cell: ({ row }: any) => <span className="text-gray-700">{row.original.subSpeciality}</span>,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }: any) => <span className="text-gray-700 tracking-tight">{row.original.department}</span>,
  },
]