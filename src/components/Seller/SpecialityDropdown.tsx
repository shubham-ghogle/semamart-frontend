import { API_URL } from "@/data";
import { Autocomplete } from "../ui/autocomplete";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type SpecialityDropdownProps = {
  value: string;
  setValue: (v: string) => void;
  packageTypeValue: string;
  setPackageValue: (v: string) => void;
  viewMode?: boolean

}
export default function SpecialityDropdown({ viewMode, value, setValue, packageTypeValue, setPackageValue }: SpecialityDropdownProps) {

  const [packageTypes, setPackageTypes] = useState<{ label: string; value: string }[]>([])

  const { data } = useQuery({
    queryKey: ["special-package"],
    queryFn: () => getSpecialityPackages()
  })

  const { mutate } = useMutation({
    mutationFn: (id: string) => getSpecialityPackagesTypes(id),
    onSuccess: (data) => {
      const pt = data.packageTypes?.map((e: any) => ({ label: e.name, value: e._id })) || []
      setPackageTypes(pt)
    }
  })


  useEffect(() => {
    if (value === "") return
    mutate(value)
    if (!viewMode) {
      setPackageValue("")
    }
  }, [value])


  return (
    <div className="grid grid-cols-2 items-center gap-4">
      <Autocomplete
        listItems={data?.map(el => ({ label: el.name, value: el._id })) || []}
        placeholder="Select speciality package"
        setValue={v => setValue(v)}
        value={value}
      />
      <Autocomplete
        listItems={packageTypes}
        placeholder="Select speciality package type"
        setValue={v => setPackageValue(v)}
        value={packageTypeValue}
      />
    </div>
  )
}

async function getSpecialityPackages() {
  const url = API_URL + "special-package"
  const res = await fetch(url)
  if (!res.ok) throw new Error()
  const data = await res.json() as { name: string; _id: string }[]
  return data
}

async function getSpecialityPackagesTypes(id: string) {
  const url = API_URL + "special-package/" + id
  const res = await fetch(url)
  if (!res.ok) throw new Error()
  const data = await res.json()
  return data
}

