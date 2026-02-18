import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/Types/types";
import { getProducts } from "@/Screens/ProductDetailScreen/GetAllProduct.Hooks";
import ProductCard from "../Homepage/ProductCard";

type UpsellCrossSellBlockProps = {
  upsells?: string[];
  crosssells?: string[];
  titlePrefix?: string;
  currentProductId?: string;
};

const TARGET_CARDS_PER_BLOCK = 3;

function extractProductId(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Full URL format: https://semamart.com/product/<id>
  const match = trimmed.match(/\/product\/([a-fA-F0-9]{24})/);
  if (match?.[1]) return match[1];

  // Raw id fallback
  if (/^[a-fA-F0-9]{24}$/.test(trimmed)) return trimmed;
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = out[i];
    out[i] = out[j];
    out[j] = t;
  }
  return out;
}

function RecommendationBlock({
  heading,
  products,
  hasFallback,
}: {
  heading: string;
  products: Product[];
  hasFallback: boolean;
}) {
  const visible = products.slice(0, TARGET_CARDS_PER_BLOCK);

  return (
    <section className="border rounded-xl bg-white p-4">
      <h3 className="text-lg md:text-xl font-semibold text-[#1C647C]">{heading}</h3>
      {hasFallback && (
        <p className="text-xs text-gray-500 mt-1">
          Added a few popular picks to complete this section.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-gray-500 mt-3">No suggestions available right now.</p>
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {visible.map((p) => (
            <div key={p._id}>
              <ProductCard product={p as any} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function UpsellCrossSellBlock({
  upsells = [],
  crosssells = [],
  titlePrefix = "",
  currentProductId,
}: UpsellCrossSellBlockProps) {
  const { data: allProducts = [], status } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: Infinity,
  });

  const { upsellProducts, crosssellProducts, upsellHasFallback, crossHasFallback } = useMemo(() => {
    const map = new Map((allProducts || []).map((p) => [p._id, p]));
    const cleanUpsellIds = [...new Set(upsells.map(extractProductId).filter(Boolean) as string[])];
    const cleanCrossIds = [...new Set(crosssells.map(extractProductId).filter(Boolean) as string[])];

    const normalize = (ids: string[]) =>
      ids
        .filter((id) => id !== currentProductId)
        .map((id) => map.get(id))
        .filter(Boolean) as Product[];

    const curatedUpsell = normalize(cleanUpsellIds);
    const curatedCross = normalize(cleanCrossIds);

    const randomPool = shuffle(
      (allProducts || []).filter(
        (p) =>
          p._id !== currentProductId &&
          !cleanUpsellIds.includes(p._id) &&
          !cleanCrossIds.includes(p._id),
      ),
    );

    const fillWithRandom = (base: Product[], avoid: Set<string>) => {
      if (base.length >= TARGET_CARDS_PER_BLOCK) {
        return { list: base.slice(0, TARGET_CARDS_PER_BLOCK), hasFallback: false };
      }

      const needed = TARGET_CARDS_PER_BLOCK - base.length;
      const randomFill: Product[] = [];

      for (const rp of randomPool) {
        if (randomFill.length >= needed) break;
        if (avoid.has(rp._id)) continue;
        avoid.add(rp._id);
        randomFill.push(rp);
      }

      return { list: [...base, ...randomFill], hasFallback: randomFill.length > 0 };
    };

    const usedIds = new Set<string>([
      ...curatedUpsell.map((p) => p._id),
      ...curatedCross.map((p) => p._id),
    ]);

    const upsellFilled = fillWithRandom(curatedUpsell, usedIds);
    const crossFilled = fillWithRandom(curatedCross, usedIds);

    return {
      upsellProducts: upsellFilled.list,
      crosssellProducts: crossFilled.list,
      upsellHasFallback: upsellFilled.hasFallback,
      crossHasFallback: crossFilled.hasFallback,
    };
  }, [allProducts, upsells, crosssells, currentProductId]);

  if (status !== "success") return null;
  if (!upsellProducts.length && !crosssellProducts.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-semibold text-[#1C647C] mb-3">
        {titlePrefix ? `${titlePrefix} Recommendations` : "Recommendations"}
      </h3>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RecommendationBlock
          heading="Frequently Bought Together"
          products={upsellProducts}
          hasFallback={upsellHasFallback}
        />
        <RecommendationBlock
          heading="You May Also Need"
          products={crosssellProducts}
          hasFallback={crossHasFallback}
        />
      </div>
    </div>
  );
}
