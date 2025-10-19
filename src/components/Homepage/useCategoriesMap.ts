import { useQuery } from "@tanstack/react-query";
import React from "react";

type Category = { _id: string; name: string };

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/v2/category"); // adjust path if different
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

/**
 * Returns a stable map { categoryId: categoryName }.
 * React Query caches this so multiple ProductCards won't re-fetch.
 */
export function useCategoriesMap() {
  const { data } = useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes; tweak if needed
  });

  return React.useMemo(() => {
    if (!Array.isArray(data)) return {} as Record<string, string>;
    return data.reduce<Record<string, string>>((acc, c) => {
      acc[c._id] = c.name;
      return acc;
    }, {});
  }, [data]);
}
