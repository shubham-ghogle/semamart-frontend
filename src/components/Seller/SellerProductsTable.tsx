import { useState, useRef, useEffect } from "react";
import { API_URL, BASE_URL } from "@/data";
import { Product } from "@/Types/types";
import { ColumnDef } from "@tanstack/react-table";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { DataTable } from "../ui/data-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ScreenOverlayLoaderUi } from "../UIComponents/LoaderUi";
import { Switch } from "../ui/switch";
import { IoIosArrowForward } from "react-icons/io";
import { useSellerSession } from "@/Screens/Seller/sellerSession";

// Import your project's custom shadcn/radix dropdown primitives here
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  sellerVisibility: boolean;
  rawCreatedAt: Date;
  productCategories: string[];
  totalOrderedQuantity?: number;
  avgRating: number;
  variants: ProductVariantRow[];
};

type SellerProductTableProps = {
  products: Product[];
};

export default function SellerProductTable({
  products,
}: SellerProductTableProps) {
  const { shopId, canAccess } = useSellerSession();
  const getLowestPrice = (row: ProductRow) =>
    row.variants.length > 0
      ? Math.min(...row.variants.map((variant) => variant.originalPrice))
      : 0;
  const getHighestPrice = (row: ProductRow) =>
    row.variants.length > 0
      ? Math.max(...row.variants.map((variant) => variant.originalPrice))
      : 0;
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<any>(null);
  const [subcategoryMap, setSubcategoryMap] = useState<
    Record<string, any[]>
  >({});
  const categoryRef = useRef<HTMLDivElement | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(API_URL + "category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      return Array.isArray(data) ? data : data?.categories || [];
    },
  });

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

  const handleResetFilters = () => {
    setSortBy("newest");
    setCategory("");
    setProductStatus("");
    setMinPrice("");
    setMaxPrice("");
  };

  const rows: ProductRow[] = (() => {
    let filteredRows: ProductRow[] = products.map((pro) => ({
      id: pro._id,
      productName: pro.name,
      createdAt: new Date(pro.createdAt).toLocaleDateString("en-IN"),
      productId: pro._id,
      sellerVisibility: pro.visibilityBySeller !== false,
      rawCreatedAt: new Date(pro.createdAt),
      productCategories: pro.category || [],
      totalOrderedQuantity: pro.totalOrderedQuantity || 0,
      avgRating: pro.avgRating ?? 0,
      variants: (pro.variants || []).map((v) => ({
        id: v._id,
        thumbnail: BASE_URL + "images/" + v.thumbnail,
        colorOption: v.colorOption || "-",
        size: v.size || "-",
        stock: v.stock,
        originalPrice: v.originalPrice,
        discountPrice: v.discountPrice ?? 0,
        commission: v.commission ?? pro.commission ?? 0,
        commissionHistory: v.commissionHistory || pro.commissionHistory || [],
      })),
    }));

    if (category) {
      filteredRows = filteredRows.filter(row => {
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

    if (productStatus) {
      const isActive = productStatus === "Active";
      filteredRows = filteredRows.filter(row => row.sellerVisibility === isActive);
    }

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

    return [...filteredRows].sort((a, b) => {
      switch (sortBy) {
        case "newest": return (b.rawCreatedAt?.getTime() || 0) - (a.rawCreatedAt?.getTime() || 0);
        case "oldest": return (a.rawCreatedAt?.getTime() || 0) - (b.rawCreatedAt?.getTime() || 0);
        case "price-low": return getLowestPrice(a) - getLowestPrice(b);
        case "price-high": return getHighestPrice(b) - getHighestPrice(a);
        case "bestSelling": return (b.totalOrderedQuantity || 0) - (a.totalOrderedQuantity || 0);
        default: return (b.rawCreatedAt?.getTime() || 0) - (a.rawCreatedAt?.getTime() || 0);
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
    },
    {
      accessorKey: "sellerVisibility",
      header: "Visibility",
      cell: ({ row }) => (
        <Switch
          id="seller-prodcut-visibiity"
          checked={row.original.sellerVisibility}
          onCheckedChange={(e) => mutateVisibility({ proIds: [row.original.productId], isVisible: e })}
          disabled={status === "pending"}
        />
      ),
    },
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="space-y-1 max-w-[150px] sm:max-w-[200px]">
          <p className="overflow-hidden text-ellipsis font-semibold text-slate-900 text-sm">
            {row.original.productName}
          </p>
          <p className="text-xs text-slate-500">Created: {row.original.createdAt}</p>
        </div>
      ),
    },
    {
      id: "variants",
      header: "Variants",
      cell: ({ row }) => (
        <div className="space-y-2">
          {row.original.variants.map((variant, index) => (
            <div key={variant.id} className="flex flex-col sm:grid sm:gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3 sm:grid-cols-[60px_1fr]">
              <img src={variant.thumbnail} alt={`Variant ${index + 1}`} className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] rounded-lg object-cover self-start" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600">
                <p className="font-semibold text-slate-900 col-span-2 sm:col-span-1 truncate">
                  {[variant.colorOption, variant.size].filter((value) => value && value !== "-").join(" / ") || `Variant ${index + 1}`}
                </p>
                <p className="truncate">Stock: {variant.stock}</p>
                <p className="truncate">MRP: Rs. {variant.originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                <p className="truncate">Selling: Rs. {(variant.discountPrice ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                <p className="font-medium text-[#1C647C] col-span-2 sm:col-span-1 truncate">
                  Commission: Rs. {(variant.commission ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    { accessorKey: "avgRating", header: "Rating" },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-4 items-center">
          <Link to={`edit/${row.original.productId}`}><AiOutlineEdit size={20} /></Link>
          <Link to={`/product/${row.original.productId}`} target="_blank"><AiOutlineEye size={20} className="text-gray-500" /></Link>
        </div>
      ),
    },
  ];

  const qc = useQueryClient();
  const { mutate: mutateVisibility, status } = useMutation({
    mutationFn: (data: { proIds: string[]; isVisible: boolean }) => updateVisibility(data.proIds, data.isVisible),
    onSuccess: async () => { qc.invalidateQueries({ queryKey: ["seller-products", shopId] }); },
    onError(error) { toast.error(error?.message || "Failed to update visibility"); qc.invalidateQueries({ queryKey: ["seller-products", shopId] }); },
  });

  if (!canAccess("AllProducts")) {
    return <div className="rounded-xl border bg-white p-4 text-gray-600">You do not have access to view products.</div>;
  }

  return (
    <>
      {/* Outer filter bar container layout styling */}
      <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 w-full relative">
        <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 no-scrollbar w-full">
          
          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Sort By</label>
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[120px]"
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
            <div ref={categoryRef}>
              
              {/* RADIX ROOT COMPONENT DROPDOWN CONTAINER */}
              <DropdownMenu open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center px-3 bg-white text-sm font-medium gap-2 border border-gray-200 h-10 rounded-lg hover:bg-gray-50 min-w-[150px] justify-between focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <span className="truncate max-w-[110px]">
                      {category 
                        ? (
                            Object.values(subcategoryMap).flat().find((sub: any) => sub._id === category)?.name || 
                            categoriesData?.find((cat: any) => cat._id === category)?.name 
                          )
                        : "All"
                      }
                    </span>
                    <IoIosArrowForward className={`transition-transform duration-200 shrink-0 ${isCategoryOpen ? 'rotate-90' : ''}`} size={16} />
                  </button>
                </DropdownMenuTrigger>

                {/* Content portal element rendering outside parent tree hierarchy */}
                <DropdownMenuContent 
                  align="start" 
                  sideOffset={6}
                  className="p-0 bg-white shadow-2xl border border-gray-200 rounded-xl overflow-hidden flex flex-row max-h-[380px] z-[99999]"
                >
                  {/* Main Categories Menu */}
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

                  {/* Subcategories Side Split Box */}
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
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Status</label>
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[100px]"
              value={productStatus}
              onChange={(e) => setProductStatus(e.target.value)}
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
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-24"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col shrink-0">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Max Price</label>
            <input
              type="number"
              placeholder="Max"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-24"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col shrink-0 ml-auto pl-4">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">&nbsp;</label>
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-[#1C647C] hover:bg-[#164d5f] rounded-lg h-10 transition-colors"
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        docName="products"
        disabeSellerVisibilitySwitch={false}
        onVisibilityChange={(proIds: string[], isVisible: boolean) =>
          mutateVisibility({ isVisible: isVisible, proIds: proIds })
        }
      />
      {status === "pending" && <ScreenOverlayLoaderUi />}
    </>
  );
}

async function updateVisibility(productIds: string[], isVisible: boolean) {
  const res = await fetch(API_URL + "product/seller-visibility", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds, isVisible }),
  });

  if (!res.ok) throw new Error("Could not update");
  return res;
}