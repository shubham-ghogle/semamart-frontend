import { useState, useRef, useEffect } from "react";
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
import { IoIosArrowForward } from "react-icons/io";


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
  totalOrderedQuantity?: number; // Add total ordered quantity
  badge: boolean; // Added badge field from remote
  avgRating: number; // Added avgRating from remote
};

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

  // Badge mutation (from remote)
  const { mutate: mutateBadge, status: badgeMutStatus } = useMutation({
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
        commission: v?.commission ?? pro?.commission ?? 0,
        seller: pro?.shopId?.businessName ?? "-",
        sellerVisibility: typeof pro.visibilityBySeller === "boolean" ? pro.visibilityBySeller : true,
        adminVisibility: typeof pro.visibilityByAdmin === "boolean" ? pro.visibilityByAdmin : false,
        rawCreatedAt: pro?.createdAt ? new Date(pro.createdAt) : null,
        productCategories: pro.category || [], // Include product categories
        totalOrderedQuantity: pro.totalOrderedQuantity || 0, // Include total ordered quantity
        badge: typeof pro.badge === "boolean" ? pro.badge : false, // Added badge field
        avgRating: pro.avgRating || 0, // Added avgRating field
      }))
    );

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
          // Best selling is based on total ordered quantity
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
      header: "Commission Amount",
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
        variantId={row.original.id}
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

        {/* Filter bar - all in one row */}
        <div className="mb-4 flex flex-nowrap items-center gap-2 p-1 bg-gray-50 rounded-xl overflow-x-auto no-scrollbar w-full">
          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Sort By</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[100px]"
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
              <span>
                {category 
                  ? (
                      // First check if it's a subcategory
                      Object.values(subcategoryMap).flat().find((sub: any) => sub._id === category)?.name || 
                      // Then check if it's a main category
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
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[80px]"
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
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-20"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col shrink-0">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Max Price</label>
          <input
            type="number"
            placeholder="Max"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-20"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col shrink-0 ml-auto mr-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">&nbsp;</label>
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-[#1C647C] hover:bg-[#164d5f] rounded-lg h-10"
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
      />

      {(adminMutStatus === "pending" || badgeMutStatus === "pending") && <ScreenOverlayLoaderUi />}
      </div>
    </div>
  );
}
