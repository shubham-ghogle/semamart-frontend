import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MedicopPageShell from "@/medicop/MedicopPageShell";
import { MEDICOP_PRODUCTS, MEDIQOP_DEPARTMENTS } from "@/medicop/data";
import { updateGeneratedRequirement } from "@/medicop/storage";

interface Item {
  sNo: number;
  productId?: string;
  desc: string;
  qty: number;
  department: string;
}

const defaultItems: Item[] = [
  { sNo: 1, desc: "ICU Bed", qty: 1, department: "INTENSIVE CARE UNIT (ICU)" },
  { sNo: 2, desc: "Ventilator Machine", qty: 2, department: "RESPIRATORY MEDICINE" },
  { sNo: 3, desc: "Patient Monitor", qty: 3, department: "CARDIOLOGY" },
  { sNo: 4, desc: "Syringe Pump", qty: 4, department: "ANESTHESIOLOGY" },
  { sNo: 5, desc: "Hospital Mattress", qty: 5, department: "GENERAL SURGERY" },
];

const Requirement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMedicopMode = new URLSearchParams(location.search).get("mode") === "medicop";
  const generated = (location.state as any)?.generatedRequirement;
  const editable = Boolean((location.state as any)?.editable);

  const [editableRows, setEditableRows] = useState<Item[]>(
    (generated?.items?.map((item: any, idx: number) => ({
      sNo: idx + 1,
      productId: item.productId,
      desc: item.productName || "",
      qty: item.quantity || 1,
      department: item.department || "",
    })) || defaultItems)
  );
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const items = useMemo(() => editableRows, [editableRows]);

  const renumberRows = (rows: Item[]) => rows.map((row, idx) => ({ ...row, sNo: idx + 1 }));

  const data = {
    company: {
      name: isMedicopMode ? "Mediqop Healthcare Pvt. Ltd." : "Sema Healthcare Pvt. Ltd.",
      address: "317, 3rd Floor, SS Plaza, Mahavir Enclave, Dwarka Sec-1, Delhi",
      pin: "110075",
      phones: ["01149982773", "9667747553"],
      email: isMedicopMode ? "support@mediqop.com" : "Info@semamart.com",
      gstin: "07ABKCS8538F1ZX",
    },
    invoiceDetails: {
      no: generated?.uid || "SM/2026/19",
      date: generated?.date || new Date().toLocaleString(),
    },
    billing: {
      name: generated?.entityName || "Neelam Multispecialty Hospital",
      location: generated?.state || "Delhi",
      district: generated?.district || "",
      address: generated?.address || "",
      pin: "110045",
      email: generated?.email || "rajneelam528@gmail.com",
      phone: generated?.phoneNumber || "8076410997",
      alternateMobileNumber: generated?.alternateMobileNumber || "",
      entityType: generated?.entityType || "",
      contactPerson: generated?.customerName || "",
      designation: generated?.designation || "",
      department: generated?.department || "",
      noOfBeds: generated?.noOfBeds || "",
    },
  };

  const filteredCatalogProducts = useMemo(() => {
    return MEDICOP_PRODUCTS.filter((product) => {
      const matchesDepartment =
        selectedDepartments.length === 0 ||
        product.departments.some((department) => selectedDepartments.includes(department));
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.departments.some((department) => department.toLowerCase().includes(term));
      return matchesDepartment && matchesSearch;
    });
  }, [search, selectedDepartments]);

  const updateRowQty = (sNo: number, delta: -1 | 1) => {
    setEditableRows((prev) =>
      prev.map((row) =>
        row.sNo === sNo ? { ...row, qty: Math.max(1, row.qty + delta) } : row
      )
    );
  };

  const toggleDepartment = (department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((item) => item !== department)
        : [...prev, department]
    );
  };

  const addProductFromCatalog = (productId: string) => {
    const product = MEDICOP_PRODUCTS.find((item) => item.id === productId);
    if (!product) return;

    setEditableRows((prev) => {
      const existing = prev.find((row) => row.productId === product.id || row.desc === product.name);
      if (existing) {
        return prev.map((row) =>
          row.sNo === existing.sNo ? { ...row, qty: row.qty + 1 } : row
        );
      }

      return renumberRows([
        ...prev,
        {
          sNo: prev.length + 1,
          productId: product.id,
          desc: product.name,
          qty: product.moq,
          department: product.departments[0] || "",
        },
      ]);
    });
  };

  const content = (
    <div className="mx-auto max-w-4xl border bg-white p-8 font-sans text-gray-800 shadow-sm print:border-none print:p-0 print:shadow-none">
      <div className="flex items-start justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          {isMedicopMode ? (
            <img src="/Mediqop-Logo.png" alt="Mediqop Logo" className="h-14 w-auto object-contain" />
          ) : (
            <img src="/logo.png" alt="Semamart Logo" className="mb-2 h-16 w-auto object-contain" />
          )}
        </div>
        <div className="text-right text-sm">
          <h2 className="text-lg font-bold uppercase leading-tight text-teal-800">{data.company.name}</h2>
          <p className="mt-1 ml-auto max-w-[250px] text-gray-600">{data.company.address}</p>
          <p className="text-gray-600">Pin Code: {data.company.pin}</p>
          <p className="text-gray-600">Phone No: {data.company.phones.join(" / ")}</p>
          <p className="text-gray-600">{data.company.email}</p>
          <p className="mt-2 inline-block border-t pt-1 font-bold text-teal-900">GSTIN: {data.company.gstin}</p>
        </div>
      </div>

      <div className="flex justify-between py-6">
        <h3 className="text-2xl font-black tracking-tight text-gray-900">Requirement</h3>
        <div className="text-right text-sm">
          <p>
            <span className="text-base font-bold">{data.invoiceDetails.no}</span>
          </p>
          <p>{data.invoiceDetails.date}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="w-1/2 rounded border bg-gray-50/30 p-4">
          <h4 className="mb-2 border-b border-gray-200 pb-1 text-[10px] font-bold uppercase tracking-widest text-teal-800">
            Customer
          </h4>
          <p className="text-sm font-bold text-gray-900">{data.billing.name}</p>
          <div className="mt-1 text-xs leading-relaxed text-gray-600">
            <p>{data.billing.location}</p>
            <p>{data.billing.district}</p>
            <p>{data.billing.address}</p>
            <p>PIN: {data.billing.pin}</p>
            <p>Email: {data.billing.email}</p>
            <p>Phone: {data.billing.phone}</p>
            <p>Alternate Phone: {data.billing.alternateMobileNumber || "NA"}</p>
            <p>Type: {data.billing.entityType || "NA"}</p>
            <p>Contact Person: {data.billing.contactPerson || "NA"}</p>
            <p>Designation: {data.billing.designation || "NA"}</p>
            <p>Department: {data.billing.department || "NA"}</p>
            <p>No of beds: {data.billing.noOfBeds || "0"}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-lg border shadow-sm">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-teal-800 text-[10px] uppercase tracking-wider text-white">
              <th className="w-[8%] border-r border-teal-700 p-2 text-left">S.No</th>
              <th className="w-[56%] border-r border-teal-700 p-2 text-left">Description of Goods</th>
              <th className="w-[20%] border-r border-teal-700 p-2 text-left">Department</th>
              <th className="w-[16%] border-r border-teal-700 p-2 text-left">Qty</th>
              {editable && <th className="w-[10%] p-2 text-left">Action</th>}
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((item) => (
              <tr key={item.sNo} className="border-t">
                <td className="border-r p-2 text-left">{item.sNo}</td>
                <td className="border-r p-2 text-left font-semibold">
                  {editable ? (
                    <input
                      type="text"
                      value={item.desc}
                      onChange={(e) =>
                        setEditableRows((prev) =>
                          prev.map((row) => (row.sNo === item.sNo ? { ...row, desc: e.target.value } : row))
                        )
                      }
                      className="w-full rounded border px-2 py-1"
                    />
                  ) : (
                    item.desc
                  )}
                </td>
                <td className="border-r p-2 text-left">
                  {editable ? (
                    <input
                      type="text"
                      value={item.department}
                      onChange={(e) =>
                        setEditableRows((prev) =>
                          prev.map((row) =>
                            row.sNo === item.sNo ? { ...row, department: e.target.value } : row
                          )
                        )
                      }
                      className="w-full rounded border px-2 py-1"
                    />
                  ) : (
                    item.department || "-"
                  )}
                </td>
                <td className="p-2 text-left">
                  {editable ? (
                    <div className="flex w-fit items-center overflow-hidden rounded-lg border border-[#d3dee3]">
                      <button
                        type="button"
                        onClick={() => updateRowQty(item.sNo, -1)}
                        className="flex h-9 w-9 items-center justify-center bg-[#f2f7f8] text-lg font-semibold text-[#1C647C]"
                      >
                        -
                      </button>
                      <div className="flex h-9 min-w-[42px] items-center justify-center border-x border-[#d3dee3] px-3 font-medium text-[#123d4d]">
                        {item.qty}
                      </div>
                      <button
                        type="button"
                        onClick={() => updateRowQty(item.sNo, 1)}
                        className="flex h-9 w-9 items-center justify-center bg-[#f2f7f8] text-lg font-semibold text-[#1C647C]"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    item.qty
                  )}
                </td>
                {editable && (
                  <td className="p-2 text-left">
                    <button
                      type="button"
                      onClick={() =>
                        setEditableRows((prev) => renumberRows(prev.filter((row) => row.sNo !== item.sNo)))
                      }
                      className="text-xs font-semibold text-red-600"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isMedicopMode && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
          >
            Back
          </button>
          {editable && (
            <button
              type="button"
              onClick={() => setIsCatalogOpen(true)}
              className="rounded-lg border border-[#1C647C] px-4 py-2 text-[#1C647C]"
            >
              Add Product
            </button>
          )}
          {editable ? (
            <button
              onClick={() => {
                if (generated?.uid) {
                  updateGeneratedRequirement(generated.uid, {
                    entityType: data.billing.entityType,
                    entityName: data.billing.name,
                    address: data.billing.address,
                    state: data.billing.location,
                    district: data.billing.district,
                    customerName: data.billing.contactPerson,
                    designation: data.billing.designation,
                    phoneNumber: data.billing.phone,
                    alternateMobileNumber: data.billing.alternateMobileNumber,
                    email: data.billing.email,
                    department: data.billing.department,
                    noOfBeds: data.billing.noOfBeds,
                    items: editableRows.map((row) => ({
                      productId: row.productId || `custom-${row.sNo}`,
                      productName: row.desc,
                      quantity: row.qty,
                      department: row.department,
                    })),
                  });
                }
                navigate("/get-quote-admin/salesman", { state: { openRequirementTab: true } });
              }}
              className="rounded-lg bg-teal-600 px-4 py-2 text-white"
            >
              Update Requirement
            </button>
          ) : (
            <button
              onClick={() => navigate("/get-quote-admin/salesman", { state: { openRequirementTab: true } })}
              className="rounded-lg bg-teal-600 px-4 py-2 text-white"
            >
              Generate Requirement
            </button>
          )}
        </div>
      )}

      {editable && isCatalogOpen ? (
        <div className="fixed inset-0 z-[90] flex bg-black/40">
          <div className="ml-auto flex h-full w-full max-w-[1320px] bg-[#f7fbfc]">
            <aside className="w-[290px] border-r border-[#d9e7ec] bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#123d4d]">Departments</h3>
                <button
                  type="button"
                  onClick={() => setIsCatalogOpen(false)}
                  className="text-sm font-semibold text-[#1C647C]"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                {MEDIQOP_DEPARTMENTS.map((department) => (
                  <label key={department} className="flex cursor-pointer items-start gap-3 text-sm text-[#173f4b]">
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(department)}
                      onChange={() => toggleDepartment(department)}
                      className="mt-0.5 h-4 w-4 accent-[#1C647C]"
                    />
                    <span>{department}</span>
                  </label>
                ))}
              </div>
            </aside>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1C647C]">
                    Add Product
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-[#123d4d]">Mediqop Catalog</h2>
                </div>
                <div className="w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="Search products"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-full border border-[#d1dde2] bg-white px-4 py-3 text-sm text-[#123d4d] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredCatalogProducts.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-[20px] border border-[#d9e7ec] bg-white shadow-sm"
                  >
                    <div className="flex h-[180px] items-center justify-center bg-[#f4f8f9] p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-[#173f4b]">{product.name}</h4>
                      <p className="mt-1 text-sm font-semibold text-[#1C647C]">MOQ: {product.moq}</p>
                      <p className="mt-2 text-xs text-[#5b7179]">{product.departments.join(", ")}</p>
                      <button
                        type="button"
                        onClick={() => addProductFromCatalog(product.id)}
                        className="mt-4 inline-flex items-center rounded-full bg-[#1C647C] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Add Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCatalogProducts.length === 0 ? (
                <p className="mt-10 text-center text-sm text-gray-500">No products found for the selected departments.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (isMedicopMode) {
    return <MedicopPageShell>{content}</MedicopPageShell>;
  }

  return content;
};

export default Requirement;
