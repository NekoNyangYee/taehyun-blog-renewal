import { supabase } from "@components/lib/supabaseClient";
import { create } from "zustand";

interface CategoriesStore {
    id: number;
    name: string;
}

interface CategoriesProps {
    myCategories: CategoriesStore[];
    fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesProps>((set) => ({
    myCategories: [],
    fetchCategories: async () => {
        const { data, error } = await supabase.from("categories").select("*");

        if (error) {
            console.error("카테고리 가져오기 에러:", error);
            return;
        }

        if (data) {
            set({ myCategories: data });
        }
    }
}));