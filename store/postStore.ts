import { create } from "zustand";
import {
  PostMetrics,
  PostMeta,
  PostStateWithoutContents,
} from "@components/types/post";
import {
  addBookmarkMutationFn,
  fetchBookmarksQueryFn,
  fetchPostsQueryFn,
  incrementViewCountMutationFn,
  removeBookmarkMutationFn,
  toggleLikeMutationFn,
} from "@components/queries/postQueries";

export type {
  PostState,
  PostStateWithoutContents,
  PostMeta,
  PostMetrics,
} from "@components/types/post";

interface PostsUIStore {
  posts: PostStateWithoutContents[];
  bookmarks: number[];
  fetchPosts: () => Promise<void>;
  fetchBookmarkPosts: (userId: string) => Promise<void>;
  incrementViewCount: (postId: number) => Promise<void>;
  incrementLikeCount: (
    postId: number | string,
    likedByUser: string
  ) => Promise<void>;
  addBookmark: (userId: string, postId: number) => Promise<void>;
  removeBookmark: (userId: string, postId: number) => Promise<void>;
  setPostsFromQuery: (posts: PostStateWithoutContents[]) => void;
  setBookmarksFromQuery: (bookmarkIds: number[]) => void;
  upsertPostSummary: (post: PostStateWithoutContents) => void;
  updatePostMetrics: (metrics: PostMetrics) => void;
  isBookmarked: (postId: number) => boolean;
  getPostMeta: (postId: number) => PostMeta | undefined;
}

export const usePostStore = create<PostsUIStore>((set, get) => ({
  posts: [],
  bookmarks: [],

  fetchPosts: async () => {
    try {
      const posts = await fetchPostsQueryFn();
      set({ posts });
    } catch (error) {
      console.error("🚨 fetchPosts 예외 발생:", error);
    }
  },

  fetchBookmarkPosts: async (userId) => {
    if (!userId) return;

    try {
      const bookmarkIds = await fetchBookmarksQueryFn(userId);
      set({ bookmarks: bookmarkIds });
    } catch (error) {
      console.error("북마크 게시물 불러오는 중 에러", error);
    }
  },

  incrementViewCount: async (postId) => {
    try {
      await incrementViewCountMutationFn(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, view_count: (post.view_count ?? 0) + 1 }
            : post
        ),
      }));
    } catch (error) {
      console.error("조회수 증가 중 에러", error);
    }
  },

  incrementLikeCount: async (postId, likedByUser) => {
    try {
      const metrics = await toggleLikeMutationFn({ postId, likedByUser });
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === metrics.id ? { ...post, ...metrics } : post
        ),
      }));
    } catch (error) {
      console.error("좋아요 증가 중 에러", error);
    }
  },

  addBookmark: async (userId, postId) => {
    if (!userId) return;

    try {
      await addBookmarkMutationFn({ userId, postId });
      set((state) => ({ bookmarks: [...state.bookmarks, postId] }));
    } catch (error) {
      console.error("북마크 추가 실패:", error);
    }
  },

  removeBookmark: async (userId, postId) => {
    if (!userId) return;

    try {
      await removeBookmarkMutationFn({ userId, postId });
      set((state) => ({
        bookmarks: state.bookmarks.filter((id) => id !== postId),
      }));
    } catch (error) {
      console.error("북마크 삭제 실패:", error);
    }
  },

  setPostsFromQuery: (posts) => set({ posts }),

  setBookmarksFromQuery: (bookmarkIds) => set({ bookmarks: bookmarkIds }),

  upsertPostSummary: (incomingPost) =>
    set((state) => {
      const index = state.posts.findIndex(
        (post) => post.id === incomingPost.id
      );
      if (index === -1) {
        return { posts: [incomingPost, ...state.posts] };
      }
      const nextPosts = [...state.posts];
      nextPosts[index] = { ...nextPosts[index], ...incomingPost };
      return { posts: nextPosts };
    }),

  updatePostMetrics: (metrics) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === metrics.id ? { ...post, ...metrics } : post
      ),
    })),

  isBookmarked: (postId) => get().bookmarks.includes(postId),

  getPostMeta: (postId) => {
    const targetPost = get().posts.find((post) => post.id === postId);
    if (!targetPost) {
      return undefined;
    }
    const { id, title, author_name, created_at, category_id } = targetPost;
    return { id, title, author_name, created_at, category_id };
  },
}));
