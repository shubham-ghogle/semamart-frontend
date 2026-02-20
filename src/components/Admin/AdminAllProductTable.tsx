import { useState } from "react";
import { Product } from "@/Types/types";
import { DataTable } from "../ui/data-table";
import { Link } from "react-router";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { ColumnDef } from "@tanstack/react-table";
import { API_URL, BASE_URL } from "../../data";
import UpdateCommissionDialog from "./UpdateCommissionDialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "../ui/switch";
import { ScreenOverlayLoaderUi } from "../UIComponents/LoaderUi";
import { toast } from "react-toastify";
import DisplayCommission from "./DisplayCommission";

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
  sku: string;
  commission: number;
  commissionHistoryDate: string;
  commissionHistoryAmount: number;
  sellerVisibility: boolean;
  adminVisibility: boolean;
  commissionHistory: { updatedAt: string; commission: number }[];
  rawCreatedAt: Date;
  productCategories: string[]; // Add product categories
};

type AdminAllProductTableProps = {
  products: Product[];
};

export default function AdminAllProductTable({
  products,
}: AdminAllProductTableProps) {
  const qc = useQueryClient();
  const [sortBy, setSortBy] = useState("newest");
  // Filter states
  const [category, setCategory] = useState("");
  const [productStatus, setProductStatus] = useState("");
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

  const { mutate: mutateVisibility, status } = useMutation({
    mutationFn: (data: { proIds: string[]; isVisible: boolean }) =>
      updateVisibility(data.proIds, data.isVisible),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError(error: any) {
      qc.invalidateQueries({ queryKey: ["seller-products"] });
      toast.error(error.message);
    },
  });

  // Reset filters
  const handleResetFilters = () => {
    setSortBy("newest");
    setCategory("");
    setProductStatus("");
    setMinPrice("");
    setMaxPrice("");
  };

  // flatten to rows, apply filtering, and sorting
  const rows: VariantRow[] = (() => {
    let filteredRows: VariantRow[] = products.flatMap((pro) =>
      pro.variants.map((v) => {
        const lastCommission =
          Array.isArray(pro.commissionHistory) && pro.commissionHistory.length > 0
            ? pro.commissionHistory[pro.commissionHistory.length - 1]
            : null;

        return {
          id: v._id,
          productName: pro.name,
          sku: pro.sku,
          thumbnail: BASE_URL + "images/" + v.thumbnail,
          colorOption: v.colorOption || "-",
          size: v.size || "-",
          stock: v.stock,
          originalPrice: v.originalPrice,
          discountPrice: v.discountPrice ?? 0,
          createdAt: new Date(pro.createdAt).toLocaleDateString("en-IN"),
          productId: pro._id,
          commission: pro.commission || 0,
          commissionHistoryDate: lastCommission
            ? new Date(lastCommission.updatedAt).toLocaleDateString("en-IN")
            : "-",
          commissionHistoryAmount: lastCommission?.commission ?? 0,
          adminVisibility: pro.visibilityByAdmin,
          sellerVisibility: pro.visibilityBySeller,
          commissionHistory: pro.commissionHistory || [],
          rawCreatedAt: new Date(pro.createdAt),
          productCategories: pro.category || [], // Include product categories
        };
      }),
    );

    // Apply category filter
    if (category) {
      filteredRows = filteredRows.filter(row => {
        const productCategories = row.productCategories || [];
        return productCategories.includes(category);
      });
    }

    // Apply status filter
    if (productStatus) {
      const isActive = productStatus === "Active";
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
          return b.stock - a.stock;
        default:
          return (b.rawCreatedAt?.getTime() || 0) - (a.rawCreatedAt?.getTime() || 0);
      }
    });
  })();

  const columns: ColumnDef<VariantRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "adminVisibility",
      header: "Admin Visibility",
      cell: ({ row }) => (
        <Switch
          id="admin-product-visibility"
          checked={row.original.adminVisibility}
          onCheckedChange={(e) =>
            mutateVisibility({ proIds: [row.original.productId], isVisible: e })
          }
          disabled={status === "pending"}
        />
      ),
    },
    {
      accessorKey: "sellerVisibility",
      header: "Seller Visibility",
      cell: ({ row }) => (
        <Switch id="seller-product-visibility" checked={row.original.sellerVisibility} disabled />
      ),
    },
    { accessorKey: "productName", header: "Product Name" },
    { accessorKey: "sku", header: "SKU" },
    {
      accessorKey: "thumbnail",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail}
          alt="thumb"
          className="w-12 h-12 object-cover rounded"
        />
      ),
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
      header: "Discount Price",
      cell: ({ row }) =>
        row.original.discountPrice.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    { accessorKey: "createdAt", header: "Created On" },
    { accessorKey: "commission", header: "Commission" },
    // {
    //   accessorKey: "commissionHistory",
    //   header: "Commission History",
    //   cell: ({ row }) => (
    //     <p>
    //       Previous Amount: {row.original.commissionHistoryAmount} | Updated At:{" "}
    //       {row.original.commissionHistoryDate}
    //     </p>
    //   ),
    // },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Link to={`/product/${row.original.productId}`} target="_blank">
            <AiOutlineEye size={20} />
          </Link>
          <a href={`/product/${row.original.productId}`}>
            <AiOutlineEdit size={20} />
          </a>
          <UpdateCommissionDialog
            currentCommission={row.original.commission}
            productId={row.original.productId}
          />
          <DisplayCommission history={row.original.commissionHistory} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 w-full">
      {/* Filter Criteria Row */}
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
            value={productStatus}
            onChange={(e) => setProductStatus(e.target.value)}
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
        docName="products"
        disabeAdminVisibilitySwitch={false}
        onVisibilityChange={(proIds: string[], isVisible: boolean) =>
          mutateVisibility({ isVisible, proIds })
        }
      />
      {status === "pending" && <ScreenOverlayLoaderUi />}
    </div>
  );
}

async function updateVisibility(productIds: string[], isVisible: boolean) {
  const res = await fetch(API_URL + "product/admin-visibility", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds, isVisible }),
  });

  if (!res.ok) {
    throw new Error("Could not update");
  }
  return res;
}
