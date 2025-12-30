// src/hooks/useSubcategoriesMap.tsx
import { API_URL } from "@/data";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type SubCategory = { _id: string; name: string };

async function fetchSubCategories(): Promise<SubCategory[]> {
  const res = await fetch(API_URL+"sub-category"); // adjust path if different
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  return res.json();
}

/**
 * Returns a stable map { subCategoryId: subCategoryName }.
 */
export function useSubcategoriesMap() {
  const { data } = useQuery<SubCategory[], Error>({
    queryKey: ["subcategories"],
    queryFn: fetchSubCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return React.useMemo(() => {
    if (!Array.isArray(data)) return {} as Record<string, string>;
    return data.reduce<Record<string, string>>((acc, s) => {
      acc[s._id] = s.name;
      return acc;
    }, {});
  }, [data]);
}
