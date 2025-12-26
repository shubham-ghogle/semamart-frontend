import { useRef, useState, useEffect } from "react"
import { Product } from "../../Types/types"
import ProductCard from "./ProductCard"
import { Link } from "react-router-dom"

type ProductShowcaseProps = {
  status: "error" | "success" | "pending"
  title: string
  products: Product[]
  layout?: "row" | "grid" | "collage"
}

export default function ProductShowcase({
  status,
  title,
  products,
  layout = "row",
}: ProductShowcaseProps) {
  const container = "w-full mb-16"
  const header = "text-2xl font-bold font-jakarta text-[#1C170D] mb-4 pl-4"

  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 0)
    setShowRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 1)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener("scroll", checkScroll)
    return () => el?.removeEventListener("scroll", checkScroll)
  }, [])

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    })
  }

  if (status === "pending") {
    return (
      <article className={container}>
        <h2 className={header}>{title}</h2>
        <div className="h-80 text-xl grid place-items-center">Loading…</div>
      </article>
    )
  }

  if (status === "error") {
    return (
      <article className={container}>
        <h2 className={header}>{title}</h2>
        <div className="h-80 text-red-500 grid place-items-center">
          Failed to load products.
        </div>
      </article>
    )
  }

  // ✅ Shuffle products so row layout doesn’t repeat same images
  const items = [...products].sort(() => Math.random() - 0.5).slice(0, 12)

  return (
    <article className={container}>
      <h2 className={header}>{title}</h2>

      {items.length === 0 ? (
        <div className="h-80 flex justify-center items-center text-secondary text-lg">
          No Data Found
        </div>
      ) : layout === "row" ? (
        // ✅ Row layout → ProductCard with scroll
        <div className="relative w-full flex items-center">
          {showLeft && (
            <button
              onClick={() => scroll("left")}
              className="flex-shrink-0 w-12 h-[170px] bg-gray-200 text-3xl font-bold flex items-center justify-center rounded-r-md hover:bg-gray-300"
            >
              &lt;
            </button>
          )}
          <div
            ref={scrollRef}
            className="flex gap-4 px-4 pb-2 overflow-x-auto scroll-smooth"
            style={{
              minHeight: "340px",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {items.map((product) => (
              <div
                key={product._id}
                className="min-w-[220px] max-w-[240px] flex-shrink-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
            <style>{`div::-webkit-scrollbar{display:none!important;}`}</style>
          </div>
          {showRight && (
            <button
              onClick={() => scroll("right")}
              className="flex-shrink-0 w-12 h-[170px] bg-gray-200 text-3xl font-bold flex items-center justify-center rounded-l-md hover:bg-gray-300"
            >
              &gt;
            </button>
          )}
        </div>
      ) : layout === "grid" ? (
        // ✅ Grid layout
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
          {items.slice(0, 8).map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden flex flex-col"
            >
              <Link to={`/product/${product._id}`} className="flex-1">
                <div className="h-40 bg-gray-50 flex items-center justify-center">
                  <img
                    src={
                      product.images?.[0]
                        ? `/images/${product.images[0]}`
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-[#1C647C] mt-1">
                   {product.variants?.[0]?.discountPrice ??
                      product.variants?.[0]?.originalPrice ? (
                        <>₹
                          {(product.variants?.[0]?.discountPrice ??
                            product.variants?.[0]?.originalPrice
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </>
                      ) : (
                        "—"
                      )}

                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        // ✅ Collage layout (1 big left + 4 small middle + 1 big right)
        <div className="grid grid-cols-4 gap-4 px-4">
          {/* Big card left */}
          <div className="col-span-1 row-span-2 rounded-md overflow-hidden flex items-center justify-center h-[500px]">
            {items[0] && (
              <Link to={`/product/${items[0]._id}`}>
                <img
                  src={
                    items[0].images?.[0]
                      ? `/images/${items[0].images[0]}`
                      : "/placeholder.png"
                  }
                  alt={items[0].name}
                  className="w-full h-full object-contain"
                />
              </Link>
            )}
          </div>

          {/* Four small cards middle */}
          <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-4">
            {items.slice(1, 5).map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-md shadow hover:shadow-md transition flex items-center justify-center overflow-hidden h-[240px]"
              >
                <Link to={`/product/${product._id}`} className="flex">
                  <img
                    src={
                      product.images?.[0]
                        ? `/images/${product.images[0]}`
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </Link>
              </div>
            ))}
          </div>

          {/* Big card right */}
          <div className="col-span-1 row-span-2 rounded-md overflow-hidden flex items-center justify-center h-[500px]">
            {items[5] && (
              <Link to={`/product/${items[5]._id}`}>
                <img
                  src={
                    items[5].images?.[0]
                      ? `/images/${items[5].images[0]}`
                      : "/placeholder.png"
                  }
                  alt={items[5].name}
                  className="w-full h-full object-contain"
                />
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
