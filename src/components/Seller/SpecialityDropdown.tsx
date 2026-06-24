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
  const [currentPackageId, setCurrentPackageId] = useState("");

  const { data } = useQuery({
    queryKey: ["special-package"],
    queryFn: () => getSpecialityPackages(),
  });

  useEffect(() => {
    const ids = Array.from(
      new Set([
        ...values.map((entry) => entry.packageId).filter(Boolean),
        currentPackageId,
      ].filter(Boolean)),
    );
    ids.forEach((id) => {
      if (packageTypesById[id]) return;
      getSpecialityPackagesTypes(id).then((res) => {
        const packageTypes = Array.isArray(res) ? res : res?.packageTypes || [];
        const pt = packageTypes.map((e: any) => ({ label: e.name, value: e._id }));
        setPackageTypesById((prev) => ({ ...prev, [id]: pt }));
      });
    });
  }, [values, currentPackageId, packageTypesById]);

  const packageOptions = data?.map((el) => ({ label: el.name, value: el._id })) || [];
  const selectedValues = values.filter((entry) => entry.packageId || entry.typeId);

  const currentTypeOptions = packageTypesById[currentPackageId] || [];

  function addRow(packageId: string, typeId: string) {
    if (!packageId || !typeId) return;
    const alreadyExists = values.some(
      (entry) =>
        entry.packageId === packageId && entry.typeId === typeId,
    );
    if (alreadyExists) {
      setCurrentPackageId("");
      return;
    }
    onChange([
      ...values,
      { packageId, typeId },
    ]);
    setCurrentPackageId("");
  }

  function removeRow(entryToRemove: { packageId: string; typeId: string }) {
    onChange(
      values.filter(
        (entry) =>
          entry.packageId !== entryToRemove.packageId ||
          entry.typeId !== entryToRemove.typeId,
      ),
    );
  }

  function getPackageLabel(packageId: string) {
    return packageOptions.find((option) => option.value === packageId)?.label || packageId;
  }

  function getTypeLabel(packageId: string, typeId: string) {
    return (
      packageTypesById[packageId]?.find((option) => option.value === typeId)?.label ||
      typeId
    );
  }

  return (
    <div className="space-y-3">
      {selectedValues.length > 0 && (
        <div className="space-y-2">
          {selectedValues.map((entry, index) => (
            <div
              key={`${entry.packageId}-${entry.typeId}-${index}`}
              className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2"
            >
              <div className="text-sm text-gray-700">
                {getPackageLabel(entry.packageId)}
                {entry.typeId ? ` / ${getTypeLabel(entry.packageId, entry.typeId)}` : ""}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(entry)}
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-center">
        <Autocomplete
          listItems={packageOptions}
          placeholder="Select speciality package"
          setValue={(packageId) => {
            setCurrentPackageId(packageId);
          }}
          value={currentPackageId}
        />
        <Autocomplete
          listItems={currentTypeOptions}
          placeholder="Select speciality package type"
          setValue={(typeId) => {
            if (!currentPackageId) return;
            addRow(currentPackageId, typeId);
          }}
          value=""
        />
        <p className="text-xs text-gray-500">Selection is added automatically.</p>
      </div>
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
  const url = API_URL + "special-package/" + id + "/package-types";
  const res = await fetch(url);
  if (!res.ok) throw new Error();
  return res.json();
}
