import { useState, useRef, useEffect } from "react";
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
import { IoIosArrowForward } from "react-icons/io";

type ProductVariantRow = {
  id: string;
  thumbnail: string;
  colorOption?: string;
  size?: string;
  stock: number;
  originalPrice: number;
  discountPrice: number;
  commission: number;
  commissionHistory: { updatedAt: string; commission: number }[];
};

type ProductRow = {
  id: string;
  productName: string;
  createdAt: string;
  productId: string;
  sku: string;
  sellerVisibility: boolean;
  adminVisibility: boolean;
  badge: boolean;
  rawCreatedAt: Date;
  productCategories: string[];
  totalOrderedQuantity?: number;
  variants: ProductVariantRow[];
};

type AdminAllProductTableProps = {
  products: Product[];
};

export default function AdminAllProductTable({
  products,
}: AdminAllProductTableProps) {
  const getLowestPrice = (row: ProductRow) =>
    row.variants.length > 0
      ? Math.min(...row.variants.map((variant) => variant.originalPrice))
      : 0;
  const getHighestPrice = (row: ProductRow) =>
    row.variants.length > 0
      ? Math.max(...row.variants.map((variant) => variant.originalPrice))
      : 0;
  const qc = useQueryClient();
  const [sortBy, setSortBy] = useState("newest");
  // Filter states
  const [category, setCategory] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Category dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<any>(null);
  const [subcategoryMap, setSubcategoryMap] = useState<
    Record<string, any[]>
  >({});
  const categoryRef = useRef<HTMLDivElement | null>(null);

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(API_URL + "category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch subcategories on hover
  const handleMouseEnter = (category: any) => {
    setHoveredCategory(category);
    if (!subcategoryMap[category._id]) {
      fetch(`${API_URL}category/${category._id}/subcategories`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch subcategories");
          return res.json();
        })
        .then((data: any[]) => {
          setSubcategoryMap((prev) => ({ ...prev, [category._id]: data || [] }));
        })
        .catch((err) => {
          console.error("Failed to fetch subcategories:", err);
          setSubcategoryMap((prev) => ({ ...prev, [category._id]: [] }));
        });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
        setHoveredCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Badge mutation (from remote)
  const { mutate: mutateBadge, status: badgeStatus } = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(
        API_URL + `product/update-badge/${productId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update badge");
      }

      return data; // 👈 return full response
    },

    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success(data?.message || "Badge updated");
    },

    onError: (err: any) => {
      toast.error(err?.message || "Error updating badge");
    },
  });

  // flatten to rows, apply filtering, and sorting (your code + badge field from remote)
  const rows: ProductRow[] = (() => {
      let filteredRows: ProductRow[] = products.map((pro) => ({
      id: pro._id,
      productName: pro.name,
      sku: pro.sku,
      createdAt: new Date(pro.createdAt).toLocaleDateString("en-IN"),
      productId: pro._id,
      adminVisibility: pro.visibilityByAdmin,
      sellerVisibility: pro.visibilityBySeller,
      badge: pro.badge ?? false,
      rawCreatedAt: new Date(pro.createdAt),
      productCategories: pro.category || [],
      totalOrderedQuantity: pro.totalOrderedQuantity || 0,
      variants: (pro.variants || []).map((v) => ({
        id: v._id,
        thumbnail: BASE_URL + "images/" + v.thumbnail,
        colorOption: v.colorOption || "-",
        size: v.size || "-",
        stock: v.stock,
        originalPrice: v.originalPrice,
        discountPrice: v.discountPrice ?? 0,
        commission: v?.commission ?? pro?.commission ?? 0,
        commissionHistory: v.commissionHistory || pro.commissionHistory || [],
      })),
    }));

    // Apply category filter (supports both categories and subcategories)
    if (category) {
      filteredRows = filteredRows.filter(row => {
        const productCategories = row.productCategories || [];
        
        // Check if product directly has the selected category/subcategory
        if (productCategories.includes(category)) {
          return true;
        }
        
        // If selected is a main category, check if product has any of its subcategories
        const selectedCategory = categoriesData?.find((cat: any) => cat._id === category);
        if (selectedCategory?.subcategories) {
          return productCategories.some((prodCat: string) => 
            selectedCategory.subcategories.includes(prodCat)
          );
        }
        
        return false;
      });
    }

    // Apply status filter
    if (productStatus) {
      const isActive = productStatus === "Active";
      filteredRows = filteredRows.filter(row => row.adminVisibility === isActive);
    }

    // Apply price range filter
    if (minPrice !== "") {
      filteredRows = filteredRows.filter(row =>
        row.variants.some((variant) => variant.originalPrice >= minPrice),
      );
    }
    if (maxPrice !== "") {
      filteredRows = filteredRows.filter(row =>
        row.variants.some((variant) => variant.originalPrice <= maxPrice),
      );
    }

    // Apply sorting
    return [...filteredRows].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.rawCreatedAt?.getTime() || 0) - (a.rawCreatedAt?.getTime() || 0);
        case "oldest":
          return (a.rawCreatedAt?.getTime() || 0) - (b.rawCreatedAt?.getTime() || 0);
        case "price-low":
          return getLowestPrice(a) - getLowestPrice(b);
        case "price-high":
          return getHighestPrice(b) - getHighestPrice(a);
        case "bestSelling":
          // Best selling is based on total ordered quantity
          return (b.totalOrderedQuantity || 0) - (a.totalOrderedQuantity || 0);
        default:
          return (b.rawCreatedAt?.getTime() || 0) - (a.rawCreatedAt?.getTime() || 0);
      }
    });
  })();

  const columns: ColumnDef<ProductRow>[] = [
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
    // Badge column from remote
    {
      accessorKey: "badge",
      header: "Badge",
      cell: ({ row }) => (
        <Switch
          checked={row.original.badge}
          onCheckedChange={() => mutateBadge(row.original.productId)}
          disabled={badgeStatus === "pending"}
        />
      ),
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
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{row.original.productName}</p>
          <p className="text-xs text-slate-500">SKU: {row.original.sku || "-"}</p>
          <p className="text-xs text-slate-500">Created: {row.original.createdAt}</p>
        </div>
      ),
    },
    {
      id: "variants",
      header: "Variants",
      cell: ({ row }) => (
        <div className="space-y-3">
          {row.original.variants.map((variant, index) => (
            <div
              key={variant.id}
              className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[72px_1fr_auto]"
            >
              <img
                src={variant.thumbnail}
                alt={`Variant ${index + 1}`}
                className="h-[72px] w-[72px] rounded-lg object-cover"
              />
              <div className="grid gap-1 text-sm text-slate-600 md:grid-cols-2">
                <p className="font-semibold text-slate-900">
                  {[variant.colorOption].filter((value) => value && value !== "-").join(" / ") || `Variant ${index + 1}`}
                </p>
                <p>Stock: {variant.stock}</p>
                <p>MRP: Rs. {variant.originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                <p>Selling: Rs. {(variant.discountPrice ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                <p className="font-medium text-[#1C647C]">
                  Commission: Rs. {(variant.commission ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                {/* <p className="text-xs">
                  Size: {variant.size || "-"}
                </p> */}
              </div>
              <div className="flex items-start gap-2">
                <UpdateCommissionDialog
                  currentCommission={variant.commission}
                  productId={row.original.productId}
                  variantId={variant.id}
                />
                <DisplayCommission history={variant.commissionHistory} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
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
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        {/* Filter bar - all in one row with horizontal scroll */}
        <div className="mb-4 flex flex-nowrap items-end gap-3 overflow-x-auto no-scrollbar w-full">
          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Sort By</label>
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[120px]"
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

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Category</label>
            <div ref={categoryRef} className="relative">
              <button
                onClick={() => {
                  setIsCategoryOpen((p) => !p);
                  setHoveredCategory(null);
                }}
                className="flex items-center px-3 bg-white text-sm font-medium gap-2 border border-gray-200 h-10 rounded-lg hover:bg-gray-50 min-w-[140px] justify-between focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <span className="truncate">
                {category 
                  ? (
                      Object.values(subcategoryMap).flat().find((sub: any) => sub._id === category)?.name || 
                      categoriesData?.find((cat: any) => cat._id === category)?.name 
                    )
                  : "All"
                }
              </span>
                <IoIosArrowForward className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-90' : ''}`} size={16} />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 flex">
                  <div className="bg-white shadow-lg border w-64 max-h-[70vh] overflow-auto text-sm">
                    <ul className="text-sm font-medium text-gray-800">
                      {categoriesData?.map((cat: any) => (
                        <li
                          key={cat._id}
                          className={`group flex justify-between items-center cursor-pointer px-4 py-3 hover:bg-gray-100 ${hoveredCategory?._id === cat._id ? "bg-gray-100" : ""}`}
                          onMouseEnter={() => handleMouseEnter(cat)}
                          onClick={() => {
                            setCategory(cat._id);
                            setIsCategoryOpen(false);
                            setHoveredCategory(null);
                          }}
                        >
                          <span>{cat.name}</span>
                          <IoIosArrowForward size={18} className="text-gray-500" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Subcategory panel */}
                  {hoveredCategory &&
                    subcategoryMap[hoveredCategory._id] &&
                    subcategoryMap[hoveredCategory._id].length > 0 && (
                      <div className="bg-white shadow-lg border w-72 max-h-[70vh] overflow-auto p-3 text-sm">
                        {subcategoryMap[hoveredCategory._id].map((sub: any) => (
                          <div
                            key={sub._id}
                            className="text-gray-700 cursor-pointer py-2 px-2 hover:bg-gray-100"
                            onClick={() => {
                              setCategory(sub._id);
                              setIsCategoryOpen(false);
                              setHoveredCategory(null);
                            }}
                          >
                            {sub.name}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Status</label>
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[100px]"
              value={productStatus}
              onChange={(e) => setProductStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Min</label>
            <input
              type="number"
              placeholder="Min"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-20"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Max</label>
            <input
              type="number"
              placeholder="Max"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col shrink-0 ml-auto">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">&nbsp;</label>
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-[#1C647C] hover:bg-[#164d5f] rounded-lg shadow-sm transition-all duration-200 h-10 whitespace-nowrap"
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </div>
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
        {status === "pending" || badgeStatus === "pending" && <ScreenOverlayLoaderUi />}
      </div>
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
