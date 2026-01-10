import { create } from "zustand";

// UI 상태만 관리 (서버 상태는 TanStack Query에서 관리)
interface CategoriesProps {
  isCategoriesLoading: boolean;
  setCategoriesLoading: (loading: boolean) => void;
}

export const useCategoriesStore = create<CategoriesProps>((set) => ({
  isCategoriesLoading: false,
  setCategoriesLoading: (loading) => set({ isCategoriesLoading: loading }),
}));
