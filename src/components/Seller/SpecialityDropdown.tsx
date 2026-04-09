import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/data";
import { Autocomplete } from "../ui/autocomplete";
import { Button } from "../ui/button";
import { X } from "lucide-react";

type SpecialityDropdownProps = {
  values: { packageId: string; typeId: string }[];
  onChange: (values: { packageId: string; typeId: string }[]) => void;
  viewMode?: boolean;
};

type Option = { label: string; value: string };

export default function SpecialityDropdown({
  values,
  onChange,
}: SpecialityDropdownProps) {
  const [packageTypesById, setPackageTypesById] = useState<Record<string, Option[]>>({});

  const { data } = useQuery({
    queryKey: ["special-package"],
    queryFn: () => getSpecialityPackages(),
  });

  useEffect(() => {
    const ids = values.map((entry) => entry.packageId).filter(Boolean);
    ids.forEach((id) => {
      if (packageTypesById[id]) return;
      getSpecialityPackagesTypes(id).then((res) => {
        const pt = res.packageTypes?.map((e: any) => ({ label: e.name, value: e._id })) || [];
        setPackageTypesById((prev) => ({ ...prev, [id]: pt }));
      });
    });
  }, [values, packageTypesById]);

  const packageOptions = data?.map((el) => ({ label: el.name, value: el._id })) || [];

  function updateRow(index: number, patch: Partial<{ packageId: string; typeId: string }>) {
    const next = [...values];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function addRow() {
    onChange([...(values.length ? values : []), { packageId: "", typeId: "" }]);
  }

  function removeRow(index: number) {
    const next = [...values];
    next.splice(index, 1);
    onChange(next.length ? next : [{ packageId: "", typeId: "" }]);
  }

  return (
    <div className="space-y-3">
      {values.map((entry, index) => (
        <div key={`${entry.packageId || "speciality"}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
          <Autocomplete
            listItems={packageOptions}
            placeholder="Select speciality package"
            setValue={(packageId) => updateRow(index, { packageId, typeId: "" })}
            value={entry.packageId}
          />
          <Autocomplete
            listItems={packageTypesById[entry.packageId] || []}
            placeholder="Select speciality package type"
            setValue={(typeId) => updateRow(index, { typeId })}
            value={entry.typeId}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeRow(index)}
            disabled={values.length === 1 && !values[0].packageId && !values[0].typeId}
          >
            <X className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addRow}>
        + Add Speciality
      </Button>
    </div>
  );
}

async function getSpecialityPackages() {
  const url = API_URL + "special-package";
  const res = await fetch(url);
  if (!res.ok) throw new Error();
  return (await res.json()) as { name: string; _id: string }[];
}

async function getSpecialityPackagesTypes(id: string) {
  const url = API_URL + "special-package/" + id;
  const res = await fetch(url);
  if (!res.ok) throw new Error();
  return res.json();
}
