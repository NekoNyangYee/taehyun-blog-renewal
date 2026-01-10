import { create } from "zustand";

export type {
  PostState,
  PostStateWithoutContents,
  PostMeta,
  PostMetrics,
} from "@components/types/post";

// UI 상태만 관리 (서버 상태는 TanStack Query에서 관리)
interface PostsUIStore {
  isBookmarkLoading: boolean;
  setBookmarkLoading: (loading: boolean) => void;
}

export const usePostStore = create<PostsUIStore>((set) => ({
  isBookmarkLoading: false,
  setBookmarkLoading: (loading) => set({ isBookmarkLoading: loading }),
}));
