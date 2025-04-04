import { create } from "zustand";

interface UIState {
  isPostLoading: boolean;
  setPostLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isPostLoading: false,
  setPostLoading: (loading) => set({ isPostLoading: loading }),
}));
