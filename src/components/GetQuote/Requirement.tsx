

const Requirement = () => {
  const data = {
    company: {
      name: "Sema Healthcare Pvt. Ltd.",
      address: "317, 3rd Floor, SS Plaza, Mahavir Enclave, Dwarka Sec-1, Delhi",
      pin: "110075",
      phones: ["01149982773", "9667747553"],
      email: "Info@semamart.com",
      gstin: "07ABKCS8538F1ZX",
    },
    invoiceDetails: {
      no: "SM/2026/19",
      date: "13/2/2026, 3:38:14 am",
    },
    billing: {
      name: "Neelam Multispecialty Hospital",
      location: "Delhi",
      pin: "110045",
      email: "rajneelam528@gmail.com",
      phone: "8076410997",
    },
    items: [
  {
    sNo: 1,
    desc: "ICU Bed",
    qty: 1,
  },
  {
    sNo: 2,
    desc: "Ventilator Machine",
    qty: 2,
  },
  {
    sNo: 3,
    desc: "Patient Monitor",
    qty: 3,
  },
  {
    sNo: 4,
    desc: "Syringe Pump",
    qty: 4,
  },
  {
    sNo: 5,
    desc: "Hospital Mattress",
    qty: 5,
  },
],
    
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border shadow-sm font-sans text-gray-800 print:shadow-none print:border-none print:p-0">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6">
        <div className="flex flex-col">
          <img 
            src="/logo.png" 
            alt="Semamart Logo" 
            className="h-16 w-auto object-contain mb-2"
          />
          
        </div>
        <div className="text-right text-sm">
          <h2 className="font-bold text-teal-800 text-lg uppercase leading-tight">
            {data.company.name}
          </h2>
          <p className="max-w-[250px] ml-auto text-gray-600 mt-1">
            {data.company.address}
          </p>
          <p className="text-gray-600">Pin Code: {data.company.pin}</p>
          <p className="text-gray-600">
            Phone No: {data.company.phones.join(" / ")}
          </p>
          <p className="text-gray-600">{data.company.email}</p>
          <p className="font-bold text-teal-900 mt-2 border-t pt-1 inline-block">
            GSTIN: {data.company.gstin}
          </p>
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="flex justify-between py-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            Requirement
          </h3>
        </div>
        <div className="text-right text-sm">
          <p>
            <span className="font-semibold text-gray-500 uppercase">
              Requirement No:
            </span>{" "}
            <span className="font-bold text-base">
              {data.invoiceDetails.no}
            </span>
          </p>
          <p>
            <span className="font-semibold text-gray-500 uppercase text-[10px]">
              Date:
            </span>{" "}
            {data.invoiceDetails.date}
          </p>
        </div>
      </div>

      {/* Billing Address */}
      <div className="mb-8">
        <div className="border p-4 rounded bg-gray-50/30 w-1/2">
          <h4 className="font-bold border-b border-gray-200 mb-2 pb-1 text-teal-800 uppercase text-[10px] tracking-widest">
            Customer
          </h4>
          <p className="font-bold text-sm text-gray-900">
            {data.billing.name}
          </p>
          <div className="text-xs leading-relaxed text-gray-600 mt-1">
            <p>{data.billing.location}</p>
            <p>PIN: {data.billing.pin}</p>
            <p>Email: {data.billing.email}</p>
            <p>Phone: {data.billing.phone}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden border rounded-lg mb-6 shadow-sm">
  <table className="w-full border-collapse table-fixed">
    <thead>
      <tr className="bg-teal-800 text-white text-[10px] uppercase tracking-wider">
        <th className="p-2 w-[8%] border-r border-teal-700 text-left">
          S.No
        </th>
        <th className="p-2 w-[72%] border-r border-teal-700 text-left">
          Description of Goods
        </th>
        <th className="p-2 w-[20%] text-left">
          Qty
        </th>
      </tr>
    </thead>

    <tbody className="text-sm">
      {data.items.map((item, idx) => (
        <tr key={idx} className="border-t">
          <td className="p-2 border-r text-left">
            {item.sNo}
          </td>

          <td className="p-2 border-r text-left font-semibold">
            {item.desc}
          </td>

          <td className="p-2 text-left">
            {item.qty}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      

</div>
  );
};

export default Requirement;