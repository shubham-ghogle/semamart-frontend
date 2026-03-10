import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getMedicopProductById,
  saveGeneratedRequirement,
} from "@/medicop/storage";
import MedicopPageShell from "@/medicop/MedicopPageShell";

// State and district data
const stateDistrictData: { [key: string]: string[] } = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup Rural", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dangs", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panipat", "Panchkula", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul-Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirapalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
};

const RequirementScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMedicopMode = new URLSearchParams(location.search).get("mode") === "medicop";
  const leadData = (location.state as any)?.leadData as
    | {
        entityType?: string;
        entityName?: string;
        state?: string;
        district?: string;
        contactPersonName?: string;
        contactPersonDesignation?: string;
        contactNumber?: string;
        email?: string;
        noOfBeds?: string;
      }
    | undefined;
  const selectedMedicopProducts = ((location.state as any)?.medicopProducts ?? []) as Array<{
    productId: string;
    qty: number;
  }>;

  if (isMedicopMode) {
    const productRows = selectedMedicopProducts.map((item, index) => ({
      srNo: index + 1,
      productId: item.productId,
      productName: getMedicopProductById(item.productId)?.name ?? item.productId,
      quantity: item.qty,
    }));

    const medicopContent = (
      <div className="bg-white overflow-hidden">
        <div className="flex">
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <img
                      src="/Mediqop-Logo.png"
                      alt="Mediqop Logo"
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <p className="text-xs uppercase text-gray-500 tracking-wide">Medical Requirement</p>
                      <h1 className="text-3xl font-bold text-[#1C647C]">Mediqop</h1>
                    </div>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Lead Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <p>Organization: {leadData?.entityName || "Dummy Hospital"}</p>
                    <p>Type: {leadData?.entityType || "Hospital"}</p>
                    <p>State: {leadData?.state || "Maharashtra"}</p>
                    <p>District: {leadData?.district || "Pune"}</p>
                    <p>Contact Person: {leadData?.contactPersonName || "Demo User"}</p>
                    <p>Designation: {leadData?.contactPersonDesignation || "Purchase Manager"}</p>
                    <p>Phone: {leadData?.contactNumber || "9999999999"}</p>
                    <p>Email: {leadData?.email || "demo@mediqop.com"}</p>
                    <p>No of beds: {leadData?.noOfBeds || "0"}</p>
                  </div>
                </div>

                <div className="overflow-x-auto mb-8">
                  <DataTable
                    data={productRows}
                    columns={[
                      { accessorKey: "srNo", header: "Sr. No." },
                      { accessorKey: "scope", header: "Scope" },
                      { accessorKey: "department", header: "Department" },
                      { accessorKey: "productName", header: "Product Name" },
                      { accessorKey: "quantity", header: "Quantity" },
                    ]}
                    docName="medicop-products"
                    disableExport={true}
                    disableColumnVisibility={true}
                    disableSearch={true}
                    enableStatusFilter={false}
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      const req = saveGeneratedRequirement({
                        salesman: "Current User",
                        entityType: leadData?.entityType || "Hospital",
                        entityName: leadData?.entityName || "Dummy Hospital",
                        state: leadData?.state || "Maharashtra",
                        district: leadData?.district || "Pune",
                        customerName: leadData?.contactPersonName || "Demo User",
                        designation: leadData?.contactPersonDesignation || "Purchase Manager",
                        phoneNumber: leadData?.contactNumber || "9999999999",
                        email: leadData?.email || "demo@mediqop.com",
                        items: productRows.map((row) => ({
                          productId: row.productId,
                          productName: row.productName,
                          quantity: row.quantity,
                        })),
                      });
                      navigate("/get-quote-admin/salesman", {
                        state: { openRequirementTab: true, generatedRequirement: req },
                      });
                    }}
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Generate Requirement
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return <MedicopPageShell>{medicopContent}</MedicopPageShell>;
  }

  const [products, setProducts] = useState([
    { srNo: 1, productName: "Medical Equipment 1", quantity: 2 },
    { srNo: 2, productName: "Medical Equipment 2", quantity: 5 },
  ]);

  const [newProduct, setNewProduct] = useState({
    productName: "",
    quantity: 1,
  });

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const productColumns = [
    { 
      accessorKey: "srNo", 
      header: "Sr. No.", 
      cell: ({ row }: any) => <div>{row.index + 1}</div> 
    },
    { accessorKey: "productName", header: "Product Name" },
    { accessorKey: "quantity", header: "Quantity" },
    { 
      accessorKey: "action", 
      header: "Action", 
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => editProduct(row.index)}>
            <FaEdit size={16} />
          </Button>
          <Button variant="ghost" onClick={() => deleteProduct(row.index)}>
            <FaTrash size={16} />
          </Button>
        </div>
      )
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));
  };

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.productName.trim() && newProduct.quantity > 0) {
      setProducts(prev => [
        ...prev,
        { ...newProduct, srNo: prev.length + 1 }
      ]);
      setNewProduct({ productName: "", quantity: 1 });
    }
  };

  const editProduct = (index: number) => {
    const product = products[index];
    setNewProduct({
      productName: product.productName,
      quantity: product.quantity,
    });
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const deleteProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Requirement Screen</h1>
              
              {/* Hospital Details */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Hospital Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter hospital name"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter address"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedState} onValueChange={(value) => {
                      setSelectedState(value);
                      setSelectedDistrict("");
                    }}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(stateDistrictData).map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder={selectedState ? "Search or select a District" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedState && stateDistrictData[selectedState].map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter mobile number"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Products</h3>
                
                {/* Add Product Form */}
                <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Add New Product</h4>
                  <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={newProduct.productName}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Product Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={newProduct.quantity}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Quantity"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        className="w-full h-10 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <FaPlus size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <DataTable
                    data={products}
                    columns={productColumns}
                    docName="products"
                    searchColId="productName"
                    searchPlaceholder="Search by product name"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => console.log("Submit requirement")}
                  className="w-full h-12 bg-teal-600 text-white hover:bg-teal-700 text-lg font-medium"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementScreen;
