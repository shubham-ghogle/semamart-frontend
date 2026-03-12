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

type ProductSpec = {
  srNo: number
  thumbnail: string
  specName: string
  speciality: string
  subSpeciality: string
  department: string
}

const productRows: ProductSpec[] = [
  {
    srNo: 1,
    thumbnail: "/image60.png",
    specName: "ICU Patient Monitor",
    speciality: "ICU Setup Packages",
    subSpeciality: "ICU Monitoring Bundle",
    department: "CARDIOLOGY",
  },
  {
    srNo: 2,
    thumbnail: "/image60.png",
    specName: "Ventilator Machine",
    speciality: "ICU Setup Packages",
    subSpeciality: "Ventilator + ABG + Infusion Kit Bundle",
    department: "RESPIRATORY MEDICINE",
  },
  {
    srNo: 3,
    thumbnail: "/image60.png",
    specName: "Biochemistry Analyzer",
    speciality: "Diagnostic Lab Packages",
    subSpeciality: "Pathology Lab Setup",
    department: "PATHOLOGY",
  },
]

export default function ProductSpecMaster() {
  const [searchText, setSearchText] = useState("")
  const [selectedSpeciality, setSelectedSpeciality] = useState("all")
  const [selectedSubSpeciality, setSelectedSubSpeciality] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Dynamic filter options
  const specialities = [...new Set(productRows.map((p) => p.speciality))]
  const departments = [...new Set(productRows.map((p) => p.department))]

  const subSpecialityOptions = useMemo(() => {
    if (selectedSpeciality === "all") return []

    return [
      ...new Set(
        productRows
          .filter((item) => item.speciality === selectedSpeciality)
          .map((item) => item.subSpeciality)
      ),
    ]
  }, [selectedSpeciality])

  // Filter logic
  const filteredData = useMemo(() => {
    return productRows.filter((item) => {
      const search = searchText.toLowerCase()

      const matchesSearch =
        !searchText ||
        item.specName.toLowerCase().includes(search) ||
        item.speciality.toLowerCase().includes(search) ||
        item.subSpeciality.toLowerCase().includes(search) ||
        item.department.toLowerCase().includes(search)

      const matchesSpec =
        selectedSpeciality === "all" ||
        item.speciality === selectedSpeciality

      const matchesSub =
        selectedSubSpeciality === "all" ||
        item.subSpeciality === selectedSubSpeciality

      const matchesDept =
        selectedDepartment === "all" ||
        item.department === selectedDepartment

      return matchesSearch && matchesSpec && matchesSub && matchesDept
    })
  }, [
    searchText,
    selectedSpeciality,
    selectedSubSpeciality,
    selectedDepartment,
  ])

  const resetFilters = () => {
    setSearchText("")
    setSelectedSpeciality("all")
    setSelectedSubSpeciality("all")
    setSelectedDepartment("all")
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* Header + Filters */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Product Filter
          </h2>

          {/* Equal spacing filter grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Search */}
            <Input
              placeholder="Search Spec Name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-gray-50"
            />

            {/* Speciality */}
            <Select
              value={selectedSpeciality}
              onValueChange={(value) => {
                setSelectedSpeciality(value)
                setSelectedSubSpeciality("all")
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Specialities" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Specialities</SelectItem>

                {specialities.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sub Speciality */}
            <Select
              value={selectedSubSpeciality}
              onValueChange={setSelectedSubSpeciality}
              disabled={selectedSpeciality === "all"}
            >
              <SelectTrigger className="w-full disabled:opacity-50">
                <SelectValue
                  placeholder={
                    selectedSpeciality === "all"
                      ? "Select Speciality First"
                      : "All Sub-specialities"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Sub-specialities</SelectItem>

                {subSpecialityOptions.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department */}
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Departments</SelectItem>

                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset */}
            <Button
              onClick={resetFilters}
              className="bg-[#1C647C] hover:bg-[#164d5f] text-white w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full">
          <DataTable
            data={filteredData}
            columns={columns}
            docName="product-spec-master"
            disableExport
            disableColumnVisibility
            disableSearch
          />
        </div>
      </div>
    </div>
  )
}

const columns = [
  {
    accessorKey: "srNo",
    header: "Sr. No.",
    cell: ({ row }: any) => (
      <span className="text-gray-600 font-medium">
        {row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }: any) => (
      <div className="w-10 h-10 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
        <img
          src={row.original.thumbnail || "/placeholder.png"}
          alt="spec"
          className="w-full h-full object-cover"
          onError={(e) =>
            (e.currentTarget.src = "https://via.placeholder.com/40")
          }
        />
      </div>
    ),
  },
  {
    accessorKey: "specName",
    header: "Spec Name",
    cell: ({ row }: any) => (
      <span className="font-medium text-gray-900">
        {row.original.specName}
      </span>
    ),
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
    cell: ({ row }: any) => (
      <span className="text-gray-700">
        {row.original.subSpeciality}
      </span>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }: any) => (
      <span className="text-gray-700 tracking-tight">
        {row.original.department}
      </span>
    ),
  },
]