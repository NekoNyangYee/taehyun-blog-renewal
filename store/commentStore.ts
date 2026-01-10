import { create } from "zustand";

// UI 상태만 관리 (서버 상태는 TanStack Query에서 관리)
interface CommentProps {
  isCommentsLoading: boolean;
  setCommentsLoading: (loading: boolean) => void;
}

export const useCommentStore = create<CommentProps>((set) => ({
  isCommentsLoading: false,
  setCommentsLoading: (loading) => set({ isCommentsLoading: loading }),
}));
