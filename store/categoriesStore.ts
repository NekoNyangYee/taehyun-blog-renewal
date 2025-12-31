import { create } from "zustand";
import { Category } from "@components/types/category";
import { fetchCategoriesQueryFn } from "@components/queries/categoryQueries";

interface CategoriesProps {
  myCategories: Category[];
  fetchCategories: () => Promise<void>;
  setCategoriesFromQuery: (categories: Category[]) => void;
}

export const useCategoriesStore = create<CategoriesProps>((set) => ({
  myCategories: [],
  fetchCategories: async () => {
    try {
      const categories = await fetchCategoriesQueryFn();
      set({ myCategories: categories });
    } catch (error) {
      console.error("카테고리 가져오기 에러:", error);
    }
  },
  setCategoriesFromQuery: (categories) => set({ myCategories: categories }),
}));
