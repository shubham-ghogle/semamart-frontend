
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL, BASE_URL } from "@/data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AiOutlineEye } from "react-icons/ai";
import { ScreenOverlayLoaderUi } from "@/components/UIComponents/LoaderUi";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import UpdateCommissionDialog from "../UpdateCommissionDialog";
import { Link } from "react-router-dom";


type VariantRow = {
  id: string;
  productName: string;
  thumbnail: string;
  colorOption?: string;
  size?: string;
  stock: number;
  originalPrice: number;
  discountPrice: number;
  createdAt: string;
  productId: string;
  commission: number;
  sellerVisibility: boolean;
  adminVisibility: boolean;
  commissionHistoryDate: string;
  commissionHistoryAmount: number;
  seller: string;
  rawCreatedAt?: Date;
  productCategories: string[]; // Add product categories
};

export default function AdminProduct() {
  const qc = useQueryClient();

  // Filter states
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(API_URL + "category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Reset filters
  const handleResetFilters = () => {
    setSortBy("newest");
    setCategory("");
    setStatus("");
    setMinPrice("");
    setMaxPrice("");
  };

  // Fetch admin products (server returns { products: [...] } as in your controller)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch(API_URL + "product/admin-all-products", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const body = await res.json();
      return body.products || [];
    },
  });

  // Mutation: Admin Visibility
  const { mutate: mutateAdminVisibility, status: adminMutStatus } = useMutation({
    mutationFn: async (payload: { productIds: string[]; isVisible: boolean }) => {
      // server expects { productIds, isVisible }
      const res = await fetch(API_URL + "product/admin-visibility", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: payload.productIds,
          isVisible: payload.isVisible,
        }),
      });

      if (!res.ok) {
        // try to extract message from body
        let errMsg = "Failed to update admin visibility";
        try {
          const b = await res.json();
          if (b && b.message) errMsg = b.message;
        } catch {}
        throw new Error(errMsg);
      }

      return res.json().catch(() => ({ success: true }));
    },
    onSuccess: () => {
      toast.success("Admin visibility updated");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating admin visibility");
    },
  });

  // flatten to rows, apply filtering, and sorting
  const rows: VariantRow[] = (() => {
    let filteredRows: VariantRow[] = (data || []).flatMap((pro: any) =>
      (pro.variants || []).map((v: any) => ({
        id: v._id,
        productName: pro.name || "-",
        thumbnail: BASE_URL + "images/" + (v?.thumbnail || ""),
        colorOption: v?.colorOption || "-",
        size: v?.size || "-",
        stock: v?.stock ?? 0,
        originalPrice: v?.originalPrice ?? 0,
        discountPrice: v?.discountPrice ?? 0,
        createdAt: pro?.createdAt ? new Date(pro.createdAt).toLocaleDateString("en-IN") : "-",
        productId: pro._id,
        commission: pro?.commission ?? 0,
        seller: pro?.shopId?.businessName ?? "-",
        sellerVisibility: typeof pro.visibilityBySeller === "boolean" ? pro.visibilityBySeller : true,
        adminVisibility: typeof pro.visibilityByAdmin === "boolean" ? pro.visibilityByAdmin : false,
        rawCreatedAt: pro?.createdAt ? new Date(pro.createdAt) : null,
        productCategories: pro.category || [], // Include product categories
      }))
    );

    // Apply category filter
    if (category) {
      filteredRows = filteredRows.filter(row => {
        const productCategories = row.productCategories || [];
        return productCategories.includes(category);
      });
    }

    // Apply status filter
    if (status) {
      const isActive = status === "Active";
      filteredRows = filteredRows.filter(row => row.adminVisibility === isActive);
    }

    // Apply price range filter
    if (minPrice !== "") {
      filteredRows = filteredRows.filter(row => row.originalPrice >= minPrice);
    }
    if (maxPrice !== "") {
      filteredRows = filteredRows.filter(row => row.originalPrice <= maxPrice);
    }

    // Apply sorting
    return [...filteredRows].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.rawCreatedAt?.getTime() || 0) - (a.rawCreatedAt?.getTime() || 0);
        case "oldest":
          return (a.rawCreatedAt?.getTime() || 0) - (b.rawCreatedAt?.getTime() || 0);
        case "price-low":
          return a.originalPrice - b.originalPrice;
        case "price-high":
          return b.originalPrice - a.originalPrice;
        case "bestSelling":
          // Assuming best selling is based on stock (can be modified if sales data is available)
          return b.stock - a.stock;
        default:
          return (b.rawCreatedAt?.getTime() || 0) - (a.rawCreatedAt?.getTime() || 0);
      }
    });
  })();

  const columns: ColumnDef<VariantRow>[] = [
   
    {
      id: "adminVisibility",
      header: "Admin",
      cell: ({ row }) => (
        <Switch
          checked={row.original.adminVisibility}
          disabled={adminMutStatus === "pending"}
          onCheckedChange={(e) => {
            // call mutation with productIds (server expects productIds)
            mutateAdminVisibility({ productIds: [row.original.productId], isVisible: e });
          }}
        />
      ),
    },
    {
      id: "sellerVisibility",
      header: "Seller",
      cell: ({ row }) => <Switch disabled checked={row.original.sellerVisibility} />,
    },
    { accessorKey: "createdAt", header: "Created On" },
    {
      accessorKey: "thumbnail",
      header: "Image",
      cell: ({ row }) => (
        <img src={row.original.thumbnail} alt="thumb" className="w-12 h-12 object-cover rounded" />
      ),
    },
    { accessorKey: "seller", header: "Seller" },
    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => <p className="w-32 overflow-hidden text-ellipsis">{row.original.productName}</p>,
    },
    { accessorKey: "colorOption", header: "Color" },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "originalPrice",
      header: "Price",
      cell: ({ row }) =>
        row.original.originalPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      accessorKey: "discountPrice",
      header: "% Price",
      cell: ({ row }) =>
        row.original.discountPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    
    {
      accessorKey: "commission",
      header: "Platform Fee",
      cell: ({ row }) => row.original.commission.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
      <Link to={`/product/${row.original.productId}`} target="_blank">
        <AiOutlineEye size={20} />
      </Link>
      <UpdateCommissionDialog
        currentCommission={row.original.commission}
        productId={row.original.productId}
      />
    </div>
      ),
    },
  ];

  if (isLoading) return <ScreenOverlayLoaderUi />;
  if (isError) return <p className="p-4">Unable to load products</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">All Products</h1>

      {/* Filter Criteria Row - Below Title, Above Search */}
      <div className="mb-4 flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Sort By</label>
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low">Price Low–High</option>
            <option value="price-high">Price High–Low</option>
            <option value="bestSelling">Best Selling</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Category</label>
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categoriesData?.map((cat: any) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Status</label>
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Min Price</label>
          <input
            type="number"
            placeholder="Min"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-24"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Max Price</label>
          <input
            type="number"
            placeholder="Max"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-24"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        <button 
          className="ml-auto px-4 py-2 text-sm font-medium text-white bg-[#1C647C] hover:bg-[#164d5f] rounded-md shadow-sm transition-all duration-200"
          onClick={handleResetFilters}
        >
          Reset Filter
        </button>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        docName="admin-products"
        // keep seller switch disabled in DataTable (your DataTable prop is `disabeSellerVisibilitySwitch` in earlier code)
        disabeSellerVisibilitySwitch
        onVisibilityChange={(ids: string[], visible: boolean) =>
          // if DataTable triggers multi-change, we forward to admin mutate
          mutateAdminVisibility({ productIds: ids, isVisible: visible })
        }
        enableCalender={true}
        dateFieldId="createdAt"
      />

      {adminMutStatus === "pending" && <ScreenOverlayLoaderUi />}
    </div>
  );
}
