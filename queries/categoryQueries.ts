import { supabase } from "@components/lib/supabaseClient";
import { Category } from "@components/types/category";

export const categoriesQueryKey = ["categories"] as const;

export const fetchCategoriesQueryFn = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, thumbnail");

  if (error) {
    throw new Error(`카테고리 가져오기 에러: ${error.message}`);
  }

  return data ?? [];
};
