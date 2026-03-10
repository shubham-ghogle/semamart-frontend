import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MedicopPageShell from "@/medicop/MedicopPageShell";
import { updateGeneratedRequirement } from "@/medicop/storage";

const defaultItems = [
  { sNo: 1, desc: "ICU Bed", qty: 1 },
  { sNo: 2, desc: "Ventilator Machine", qty: 2 },
  { sNo: 3, desc: "Patient Monitor", qty: 3 },
  { sNo: 4, desc: "Syringe Pump", qty: 4 },
  { sNo: 5, desc: "Hospital Mattress", qty: 5 },
];

const Requirement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMedicopMode = new URLSearchParams(location.search).get("mode") === "medicop";

  const generated = (location.state as any)?.generatedRequirement as
    | {
        uid: string;
        date: string;
        entityName: string;
        state: string;
        email: string;
        phoneNumber: string;
        items?: Array<{ productName: string; quantity: number }>;
      }
    | undefined;

  const editable = Boolean((location.state as any)?.editable);

  const [editableRows, setEditableRows] = useState(
    (generated?.items || defaultItems.map((x) => ({ productName: x.desc, quantity: x.qty }))).map(
      (item, idx) => ({
        sNo: idx + 1,
        desc: item.productName,
        qty: item.quantity,
      })
    )
  );

  const items = useMemo(() => editableRows, [editableRows]);
  const renumberRows = (rows: Array<{ sNo: number; desc: string; qty: number }>) =>
    rows.map((row, idx) => ({ ...row, sNo: idx + 1 }));

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
      pin: "110045",
      email: generated?.email || "rajneelam528@gmail.com",
      phone: generated?.phoneNumber || "8076410997",
    },
  };

  const content = (
    <div className="max-w-4xl mx-auto p-8 bg-white border shadow-sm font-sans text-gray-800 print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-start border-b pb-6">
        <div className="flex items-center gap-3">
          {isMedicopMode ? (
            <img src="/Mediqop-Logo.png" alt="Mediqop Logo" className="h-14 w-auto object-contain" />
          ) : (
            <img src="/logo.png" alt="Semamart Logo" className="h-16 w-auto object-contain mb-2" />
          )}
        </div>
        <div className="text-right text-sm">
          <h2 className="font-bold text-teal-800 text-lg uppercase leading-tight">{data.company.name}</h2>
          <p className="max-w-[250px] ml-auto text-gray-600 mt-1">{data.company.address}</p>
          <p className="text-gray-600">Pin Code: {data.company.pin}</p>
          <p className="text-gray-600">Phone No: {data.company.phones.join(" / ")}</p>
          <p className="text-gray-600">{data.company.email}</p>
          <p className="font-bold text-teal-900 mt-2 border-t pt-1 inline-block">GSTIN: {data.company.gstin}</p>
        </div>
      </div>

      <div className="flex justify-between py-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Requirement</h3>
        </div>
        <div className="text-right text-sm">
          <p>
            <span className="font-semibold text-gray-500 uppercase">Requirement No:</span>{" "}
            <span className="font-bold text-base">{data.invoiceDetails.no}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-500 uppercase text-[10px]">Date:</span>{" "}
            {data.invoiceDetails.date}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="border p-4 rounded bg-gray-50/30 w-1/2">
          <h4 className="font-bold border-b border-gray-200 mb-2 pb-1 text-teal-800 uppercase text-[10px] tracking-widest">
            Customer
          </h4>
          <p className="font-bold text-sm text-gray-900">{data.billing.name}</p>
          <div className="text-xs leading-relaxed text-gray-600 mt-1">
            <p>{data.billing.location}</p>
            <p>PIN: {data.billing.pin}</p>
            <p>Email: {data.billing.email}</p>
            <p>Phone: {data.billing.phone}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border rounded-lg mb-6 shadow-sm">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-teal-800 text-white text-[10px] uppercase tracking-wider">
              <th className="p-2 w-[8%] border-r border-teal-700 text-left">S.No</th>
              <th className="p-2 w-[72%] border-r border-teal-700 text-left">Description of Goods</th>
              <th className="p-2 w-[12%] border-r border-teal-700 text-left">Qty</th>
              {editable && <th className="p-2 w-[8%] text-left">Action</th>}
            </tr>
          </thead>

          <tbody className="text-sm">
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 border-r text-left">{item.sNo}</td>
                <td className="p-2 border-r text-left font-semibold">
                  {editable ? (
                    <input
                      type="text"
                      value={item.desc}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditableRows((prev) =>
                          prev.map((row) => (row.sNo === item.sNo ? { ...row, desc: value } : row))
                        );
                      }}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    item.desc
                  )}
                </td>
                <td className="p-2 text-left">
                  {editable ? (
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => {
                        const value = Math.max(1, Number(e.target.value || 1));
                        setEditableRows((prev) =>
                          prev.map((row) => (row.sNo === item.sNo ? { ...row, qty: value } : row))
                        );
                      }}
                      className="w-20 border rounded px-2 py-1"
                    />
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
                      className="text-red-600 text-xs font-semibold"
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
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
          >
            Back
          </button>
          {editable && (
            <button
              type="button"
              onClick={() =>
                setEditableRows((prev) =>
                  renumberRows([
                    ...prev,
                    { sNo: prev.length + 1, desc: "New Product", qty: 1 },
                  ])
                )
              }
              className="px-4 py-2 rounded-lg border border-[#1C647C] text-[#1C647C]"
            >
              Add Product
            </button>
          )}
          {editable ? (
            <button
              onClick={() => {
                if (generated?.uid) {
                  updateGeneratedRequirement(generated.uid, {
                    items: editableRows.map((row) => ({
                      productId: `custom-${row.sNo}`,
                      productName: row.desc,
                      quantity: row.qty,
                    })),
                  });
                }
                navigate("/get-quote-admin/salesman", { state: { openRequirementTab: true } });
              }}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white"
            >
              Update Requirement
            </button>
          ) : (
            <button
              onClick={() => navigate("/get-quote-admin/salesman", { state: { openRequirementTab: true } })}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white"
            >
              Generate Requirement
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isMedicopMode) {
    return <MedicopPageShell>{content}</MedicopPageShell>;
  }

  return content;
};

export default Requirement;
