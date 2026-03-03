const Quotation = () => {
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
    //   placeOfSupply: "Jharkhand",
    //   placeOfDelivery: "Delhi",
    },
    billing: {
      name: "Neelam Multispecialty Hospital",
      location: "Delhi",
      pin: "110045",
      email: "rajneelam528@gmail.com",
      phone: "8076410997",
    },
    // shipping: {
    //   name: "Neelam Multispecialty Hospital",
    //   address: "Dwarka New delhi, Dwarka, Delhi",
    //   pin: "110045",
    //   phone: "8076410997",
    // },
    items: [
  {
    sNo: 1,
    desc: "ICU Bed",
    hsn: "94020",
    qty: 1,
    unitPrice: 56000.0,
    discountedPrice: 47000.0,
    total: 47000.0,
  },
  {
    sNo: 2,
    desc: "Ventilator Machine",
    hsn: "90190",
    qty: 2,
    unitPrice: 85000.0,
    discountedPrice: 80000.0,
    total: 160000.0,
  },
  {
    sNo: 3,
    desc: "Patient Monitor",
    hsn: "90181",
    qty: 3,
    unitPrice: 35000.0,
    discountedPrice: 32000.0,
    total: 96000.0,
  },
  {
    sNo: 4,
    desc: "Syringe Pump",
    hsn: "90183",
    qty: 4,
    unitPrice: 12000.0,
    discountedPrice: 11000.0,
    total: 44000.0,
  },
  {
    sNo: 5,
    desc: "Hospital Mattress",
    hsn: "94041",
    qty: 5,
    unitPrice: 5000.0,
    discountedPrice: 4500.0,
    total: 22500.0,
  },
],
    taxes: [
      { type: "CGST", rate: "9%", amount: 4230.0 },
      { type: "SGST", rate: "9%", amount: 4230.0 },
    ],
    summary: {
      totalPrice: 47000.0,
      taxAmount: 8460.0,
      grandTotal: 369500,
      amountInWords: "Three Lakh Sixty Nine Thousand Five Hundred Rupees Only",
    },
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
          <h2 className="font-bold text-teal-800 text-lg uppercase leading-tight">{data.company.name}</h2>
          <p className="max-w-[250px] ml-auto text-gray-600 mt-1">{data.company.address}</p>
          <p className="text-gray-600">Pin Code: {data.company.pin}</p>
          <p className="text-gray-600">Phone No: {data.company.phones.join(" / ")}</p>
          <p className="text-gray-600">{data.company.email}</p>
          <p className="font-bold text-teal-900 mt-2 border-t pt-1 inline-block">GSTIN: {data.company.gstin}</p>
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="flex justify-between py-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Ex-Tax Quotation</h3>
          {/* <p className="mt-2 text-sm"><span className="font-semibold text-gray-500">Place of Supply:</span> {data.invoiceDetails.placeOfSupply}</p> */}
        </div>
        <div className="text-right text-sm">
          <p><span className="font-semibold text-gray-500 uppercase">Ex-Tax Quotation No:</span> <span className="font-bold text-base">{data.invoiceDetails.no}</span></p>
          <p><span className="font-semibold text-gray-500 uppercase text-[10px]">Date:</span> {data.invoiceDetails.date}</p>
          {/* <p><span className="font-semibold text-gray-500 uppercase text-[10px]">Delivery:</span> {data.invoiceDetails.placeOfDelivery}</p> */}
        </div>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="border p-4 rounded bg-gray-50/30">
          <h4 className="font-bold border-b border-gray-200 mb-2 pb-1 text-teal-800 uppercase text-[10px] tracking-widest">Customer</h4>
          <p className="font-bold text-sm text-gray-900">{data.billing.name}</p>
          <div className="text-xs leading-relaxed text-gray-600 mt-1">
            <p>{data.billing.location}</p>
            <p>PIN: {data.billing.pin}</p>
            <p>Email: {data.billing.email}</p>
            <p>Phone: {data.billing.phone}</p>
          </div>
        </div>
        {/* <div className="border p-4 rounded bg-gray-50/30">
          <h4 className="font-bold border-b border-gray-200 mb-2 pb-1 text-teal-800 uppercase text-[10px] tracking-widest">Shipping Address</h4>
          <p className="font-bold text-sm text-gray-900">{data.shipping.name}</p>
          <div className="text-xs leading-relaxed text-gray-600 mt-1">
            <p>{data.shipping.address}</p>
            <p>PIN: {data.shipping.pin}</p>
            <p>Phone: {data.shipping.phone}</p>
          </div>
        </div> */}
      </div>

      {/* Items Table */}
      <div className="overflow-hidden border rounded-lg mb-6 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-teal-800 text-white text-[10px] uppercase tracking-wider">
              <th className="p-3 border-r border-teal-700">S.No</th>
              <th className="p-3 border-r border-teal-700 w-1/3">Description of Goods</th>
              {/* <th className="p-3 border-r border-teal-700">HSN</th> */}
              <th className="p-3 border-r border-teal-700 text-center">Qty</th>
              <th className="p-3 border-r border-teal-700 text-right">Unit Price</th>
              <th className="p-3 border-r border-teal-700 text-right">Discounted</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.items.map((item, idx) => (
              <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                <td className="p-3 border-r text-center text-gray-500">{item.sNo}</td>
                <td className="p-3 border-r font-semibold text-gray-800">{item.desc}</td>
                {/* <td className="p-3 border-r text-gray-600 font-mono text-xs">{item.hsn}</td> */}
                <td className="p-3 border-r text-center">{item.qty}</td>
                <td className="p-3 border-r text-right text-gray-500">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                <td className="p-3 border-r text-right font-medium text-teal-700">₹{item.discountedPrice.toLocaleString("en-IN")}</td>
                <td className="p-3 text-right font-bold text-gray-900">₹{item.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    {/* Grand Total Only */}
        <div className="flex justify-end">
        <div className="w-1/3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-teal-900">
                Grand Total:
            </span>
            <span className="text-xl font-black text-teal-800">
                ₹{data.summary.grandTotal.toLocaleString("en-IN")}
            </span>
            </div>
        </div>
        </div>

      {/* Footer Details */}
      <div className="mt-8 border-l-4 border-teal-800 p-4 bg-teal-50/30 rounded-r-lg">
        <p className="text-[9px] font-bold uppercase text-teal-800/60 mb-1">Amount In Words:</p>
        <p className="font-bold text-sm text-gray-800 italic">"{data.summary.amountInWords}"</p>
      </div>

      {/* Signatory Section */}
      <div className="mt-12 flex flex-col items-end">
        <div className="relative flex flex-col items-center">
            {/* Logo used as Signatory Stamp */}
            <div className="opacity-80 mix-blend-multiply flex flex-col items-center">
                <img 
                    src="/Auth.png" 
                    alt="Authorized Stamp" 
                    className="h-40 w-auto grayscale contrast-125 brightness-75 mb-1"
                />
                <div className="text-[9px] font-black text-teal-900 uppercase tracking-widest border-t border-teal-900/20 pt-1">
                    Authorized Signatory
                </div>
            </div>
            {/* Visual Signature Line */}
            <div className="mt-4 w-40 h-[1px] bg-gray-300"></div>
        </div>
        <p className="mt-6 w-full text-center text-[9px] text-gray-400 font-medium uppercase tracking-[0.2em]">
            System Generated E-TAX QUOTATION • No Signature Required
            </p>
      </div>
    </div>
  );
};

export default Quotation;