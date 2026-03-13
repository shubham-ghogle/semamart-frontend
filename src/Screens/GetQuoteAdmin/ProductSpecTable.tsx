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
    thumbnail:
      "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=200&q=80",
    specName: "Examination Gloves",
    speciality: "Surgical & Examination Gloves",
    subSpeciality: "Nitrile / Latex Disposable Gloves",
    department: "GENERAL MEDICINE",
  },
  {
    srNo: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=200&q=80",
    specName: "Surgical Face Mask",
    speciality: "Masks & Personal Protective Equipment (PPE)",
    subSpeciality: "3-Ply Disposable Face Mask",
    department: "INFECTION CONTROL",
  },
  {
    srNo: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=200&q=80",
    specName: "Disposable Syringe",
    speciality: "Syringes & Needles",
    subSpeciality: "5ml / 10ml Syringe",
    department: "GENERAL MEDICINE",
  },
  {
    srNo: 4,
    thumbnail:
      "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=200&q=80",
    specName: "Hypodermic Needle",
    speciality: "Syringes & Needles",
    subSpeciality: "Sterile Injection Needles",
    department: "GENERAL MEDICINE",
  },
  {
    srNo: 5,
    thumbnail:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=200&q=80",
    specName: "IV Cannula",
    speciality: "IV Sets & Infusion Supplies",
    subSpeciality: "Peripheral IV Cannula",
    department: "EMERGENCY",
  },
  {
    srNo: 6,
    thumbnail:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80",
    specName: "IV Infusion Set",
    speciality: "IV Sets & Infusion Supplies",
    subSpeciality: "Sterile Disposable IV Set",
    department: "GENERAL MEDICINE",
  },
  {
    srNo: 7,
    thumbnail:
      "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=200&q=80",
    specName: "Foley Catheter",
    speciality: "Catheters & Tubes",
    subSpeciality: "2-Way Latex Foley Catheter",
    department: "UROLOGY",
  },
  {
    srNo: 8,
    thumbnail:
      "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=200&q=80",
    specName: "Surgical Drapes",
    speciality: "Drapes, Sheets & Underpads",
    subSpeciality: "Disposable Surgical Drapes",
    department: "SURGERY",
  },
  {
    srNo: 9,
    thumbnail:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=200&q=80",
    specName: "Gauze Swabs",
    speciality: "Wound Care & Dressings",
    subSpeciality: "Sterile Gauze Pads",
    department: "SURGERY",
  },
  {
    srNo: 10,
    thumbnail:
      "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?auto=format&fit=crop&w=200&q=80",
    specName: "Alcohol Prep Pads",
    speciality: "Infection Control & Cleaning",
    subSpeciality: "70% Isopropyl Alcohol Pads",
    department: "INFECTION CONTROL",
  },
]

export default function ProductSpecMaster() {
  const [searchText, setSearchText] = useState("")
  const [selectedSpeciality, setSelectedSpeciality] = useState("all")
  const [selectedSubSpeciality, setSelectedSubSpeciality] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

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
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Sub-specialities" />
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
              <SelectTrigger>
                <SelectValue placeholder="Departments" />
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

            <Button
              onClick={resetFilters}
              className="bg-[#1C647C] hover:bg-[#164d5f] text-white"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="w-full px-6 pb-6 cursor-pointer">
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
    cell: ({ row }: any) => row.index + 1,
  },
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }: any) => (
      <img
        src={row.original.thumbnail}
        alt="spec"
        className="w-10 h-10 rounded-lg object-cover border"
        onError={(e) =>
          (e.currentTarget.src =
            "https://via.placeholder.com/40")
        }
      />
    ),
  },
  {
    accessorKey: "specName",
    header: "Spec Name",
  },
  {
    accessorKey: "speciality",
    header: "Speciality",
  },
  {
    accessorKey: "subSpeciality",
    header: "Sub-speciality",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
]