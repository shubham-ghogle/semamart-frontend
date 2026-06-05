import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // Imported React Portal for breaking stacking context
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL, BASE_URL } from "@/data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { AiOutlineEye } from "react-icons/ai";
import { ScreenOverlayLoaderUi } from "@/components/UIComponents/LoaderUi";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import ProductCommissionManager from "./ProductCommissionManager";

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
  seller: string;
  sellerVisibility: boolean;
  adminVisibility: boolean;
  commissionHistoryDate: string;
  commissionHistoryAmount: number;
  rawCreatedAt?: Date;
  productCategories: string[];
  totalOrderedQuantity?: number;
  badge: boolean;
  avgRating: number;
  bulkOrders: {
    id: string;
    qty: number;
    price: number;
    commission: number;
  }[];
};

const PRODUCT_ROW_STYLES = [
  "bg-sky-50/70",
  "bg-emerald-50/70",
  "bg-amber-50/70",
  "bg-rose-50/70",
  "bg-violet-50/70",
  "bg-cyan-50/70",
];

function getProductRowClassName(productId: string) {
  const hash = Array.from(productId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PRODUCT_ROW_STYLES[hash % PRODUCT_ROW_STYLES.length];
}

function getVariantLabel(row: Pick<VariantRow, "colorOption" | "size">) {
  return [row.colorOption, row.size]
    .filter((value) => value && value !== "-")
    .join(" / ") || "Default Variant";
}

export default function AdminProduct() {
  const qc = useQueryClient();

  // Filter states
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Category dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<any>(null);
  const [subcategoryMap, setSubcategoryMap] = useState<Record<string, any[]>>({});
  const categoryRef = useRef<HTMLDivElement | null>(null);

  // Dynamic dropdown positions state
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(API_URL + "category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      return Array.isArray(data) ? data : data?.categories || [];
    },
  });

  // Calculate coordinates whenever dropdown toggles or window scrolls/resizes
  const updateDropdownCoords = () => {
    if (categoryRef.current) {
      const rect = categoryRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleMouseEnter = (category: any) => {
    setHoveredCategory(category);
    if (!subcategoryMap[category._id]) {
      fetch(`${API_URL}category/${category._id}/subcategories`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch subcategories");
          return res.json();
        })
        .then((data: any[] | { subcategories?: any[] }) => {
          const subcategories = Array.isArray(data) ? data : data?.subcategories || [];
          setSubcategoryMap((prev) => ({ ...prev, [category._id]: subcategories }));
        })
        .catch((err) => {
          console.error("Failed to fetch subcategories:", err);
          setSubcategoryMap((prev) => ({ ...prev, [category._id]: [] }));
        });
    }
  };

  // Close dropdown when clicking outside & handle scroll re-calculations
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        const modalPortal = document.getElementById("admin-category-portal-root");
        if (modalPortal && modalPortal.contains(event.target as Node)) return;
        setIsCategoryOpen(false);
        setHoveredCategory(null);
      }
    }

    if (isCategoryOpen) {
      updateDropdownCoords();
      window.addEventListener("scroll", updateDropdownCoords, true);
      window.addEventListener("resize", updateDropdownCoords);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updateDropdownCoords, true);
      window.removeEventListener("resize", updateDropdownCoords);
    };
  }, [isCategoryOpen]);

  // Reset filters
  const handleResetFilters = () => {
    setSortBy("newest");
    setCategory("");
    setStatus("");
    setMinPrice("");
    setMaxPrice("");
  };

  // Fetch admin products
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

  // Badge mutation
  const { mutate: mutateBadge, status: badgeMutStatus } = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(API_URL + `product/update-badge/${productId}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update badge");
      return data;
    },
    onSuccess: (data) => {
      const { productId, badge } = data;
      qc.setQueryData(["admin-products"], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((product) =>
          product._id === productId ? { ...product, badge } : product
        );
      });
      toast.success(data?.message || "Badge updated");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating badge");
    },
  });

  // Flatten rows, filtering, and sorting
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
        commission: v?.commission ?? pro?.commission ?? 0,
        seller: pro?.shopId?.businessName ?? "-",
        sellerVisibility: typeof pro.visibilityBySeller === "boolean" ? pro.visibilityBySeller : true,
        adminVisibility: typeof pro.visibilityByAdmin === "boolean" ? pro.visibilityByAdmin : false,
        rawCreatedAt: pro?.createdAt ? new Date(pro.createdAt) : null,
        productCategories: pro.category || [],
        totalOrderedQuantity: pro.totalOrderedQuantity || 0,
        badge: typeof pro.badge === "boolean" ? pro.badge : false,
        avgRating: pro.avgRating || 0,
        bulkOrders: Array.isArray(v?.bulkOrders)
          ? v.bulkOrders.map((bulk: any) => ({
              id: bulk._id,
              qty: bulk.qty ?? 0,
              price: bulk.price ?? 0,
              commission: bulk.commission ?? v?.commission ?? pro?.commission ?? 0,
            }))
          : [],
      }))
    );

    if (category) {
      filteredRows = filteredRows.filter((row) => {
        const productCategories = row.productCategories || [];
        if (productCategories.includes(category)) return true;
        const selectedCategory = categoriesData?.find((cat: any) => cat._id === category);
        if (selectedCategory?.subcategories) {
          return productCategories.some((prodCat: string) =>
            selectedCategory.subcategories.includes(prodCat)
          );
        }
        return false;
      });
    }

    if (status) {
      const isActive = status === "Active";
      filteredRows = filteredRows.filter((row) => row.adminVisibility === isActive);
    }

    if (minPrice !== "") {
      filteredRows = filteredRows.filter((row) => row.originalPrice >= minPrice);
    }
    if (maxPrice !== "") {
      filteredRows = filteredRows.filter((row) => row.originalPrice <= maxPrice);
    }

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
          return (b.totalOrderedQuantity || 0) - (a.totalOrderedQuantity || 0);
        default:
          return (b.rawCreatedAt?.getTime() || 0) - (a.rawCreatedAt?.getTime() || 0);
      }
    });
  })();

  const columns: ColumnDef<VariantRow>[] = [
    {
      id: "badge",
      header: "Badge",
      cell: ({ row }) => (
        <Switch
          checked={row.original.badge}
          disabled={badgeMutStatus === "pending"}
          onCheckedChange={() => mutateBadge(row.original.productId)}
        />
      ),
    },
    {
      id: "adminVisibility",
      header: "Admin",
      cell: ({ row }) => (
        <Switch
          checked={row.original.adminVisibility}
          disabled={adminMutStatus === "pending"}
          onCheckedChange={(e) => {
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
        <img src={row.original.thumbnail} alt="thumb" className="h-12 w-12 min-w-12 rounded object-cover" />
      ),
    },
    {
      accessorKey: "seller",
      header: "Seller",
      cell: ({ row }) => (
        <div className="max-w-[160px] whitespace-normal break-words text-sm leading-5">
          {row.original.seller}
        </div>
      ),
    },
    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[220px] whitespace-normal break-words leading-5">
          <p className="font-medium">{row.original.productName}</p>
          <p className="text-xs text-slate-500">{getVariantLabel(row.original)}</p>
        </div>
      ),
    },
    {
      accessorKey: "colorOption",
      header: "Color",
      cell: ({ row }) => (
        <div className="max-w-[120px] whitespace-normal break-words leading-5">
          {row.original.colorOption || "-"}
        </div>
      ),
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => (
        <div className="max-w-[120px] whitespace-normal break-words leading-5">
          {row.original.size || "-"}
        </div>
      ),
    },
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
      header: "Commission Amount",
      cell: ({ row }) =>
        row.original.commission.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
    },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex min-w-[220px] flex-wrap items-center gap-2">
          <Link to={`/product/${row.original.productId}`} target="_blank" className="shrink-0">
            <AiOutlineEye size={20} />
          </Link>
          <ProductCommissionManager
            productId={row.original.productId}
            variantId={row.original.id}
            productCommission={row.original.commission}
            bulkOrders={row.original.bulkOrders}
          />
        </div>
      ),
    },
  ];

  if (isLoading) return <ScreenOverlayLoaderUi />;
  if (isError) return <p className="p-4">Unable to load products</p>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h1 className="text-xl font-semibold mb-4">All Products</h1>

        {/* Filter bar parent wrapper without overflow-hidden styles */}
        <div className="mb-4 flex flex-nowrap items-center gap-2 p-1 bg-gray-50 rounded-xl overflow-x-auto no-scrollbar w-full relative">
          
          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Sort By</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[100px] bg-white"
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
                className="flex items-center px-3 bg-white text-sm font-medium gap-2 border border-gray-200 h-10 rounded-lg hover:bg-gray-50 min-w-[120px] justify-between focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <span className="truncate max-w-[90px]">
                  {category
                    ? Object.values(subcategoryMap).flat().find((sub: any) => sub._id === category)?.name ||
                      categoriesData?.find((cat: any) => cat._id === category)?.name
                    : "All"}
                </span>
                <IoIosArrowForward className={`transition-transform duration-200 ${isCategoryOpen ? "rotate-90" : ""}`} size={16} />
              </button>

              {/* REACT PORTAL ATTACHMENT FOR DROPDOWN OVERLAYS */}
              {isCategoryOpen &&
                typeof window !== "undefined" &&
                createPortal(
                  <div
                    id="admin-category-portal-root"
                    style={{
                      position: "absolute",
                      top: dropdownCoords.top,
                      left: dropdownCoords.left,
                    }}
                    className="flex bg-white shadow-2xl border border-gray-200 rounded-xl overflow-hidden max-h-[380px] z-[999999]"
                  >
                    {/* Main Categories Column */}
                    <div className="w-64 overflow-y-auto py-1 bg-white border-r border-gray-100">
                      <ul className="text-sm font-medium text-gray-700">
                        {categoriesData?.map((cat: any) => (
                          <li
                            key={cat._id}
                            className={`flex justify-between items-center cursor-pointer px-4 py-2.5 transition-colors hover:bg-slate-50 ${hoveredCategory?._id === cat._id ? "bg-slate-100 text-slate-900" : ""}`}
                            onMouseEnter={() => handleMouseEnter(cat)}
                            onClick={() => {
                              setCategory(cat._id);
                              setIsCategoryOpen(false);
                              setHoveredCategory(null);
                            }}
                          >
                            <span className="truncate pr-2">{cat.name}</span>
                            <IoIosArrowForward size={14} className="text-gray-400 shrink-0" />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Subcategories Column */}
                    {hoveredCategory &&
                      subcategoryMap[hoveredCategory._id] &&
                      subcategoryMap[hoveredCategory._id].length > 0 && (
                        <div className="w-64 bg-slate-50 overflow-y-auto p-1.5 border-l border-gray-100 flex flex-col gap-0.5">
                          {subcategoryMap[hoveredCategory._id].map((sub: any) => (
                            <div
                              key={sub._id}
                              className="text-gray-600 cursor-pointer py-2 px-3 rounded-lg text-sm hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all truncate"
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
                  </div>,
                  document.body
                )}
            </div>
          </div>

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Status</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[80px] bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Min Price</label>
            <input
              type="number"
              placeholder="Min"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-20 bg-white"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Max Price</label>
            <input
              type="number"
              placeholder="Max"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-20 bg-white"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col shrink-0 ml-auto mr-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">&nbsp;</label>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-[#1C647C] hover:bg-[#164d5f] rounded-lg h-10 transition-colors"
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </div>
        </div>

        <DataTable
          data={rows}
          columns={columns}
          docName="admin-products"
          disabeSellerVisibilitySwitch
          onVisibilityChange={(ids: string[], visible: boolean) =>
            mutateAdminVisibility({ productIds: ids, isVisible: visible })
          }
          enableCalender={true}
          dateFieldId="createdAt"
          getRowClassName={(row) => getProductRowClassName((row as VariantRow).productId)}
        />

        {(adminMutStatus === "pending" || badgeMutStatus === "pending") && <ScreenOverlayLoaderUi />}
      </div>
    </div>
  );
}