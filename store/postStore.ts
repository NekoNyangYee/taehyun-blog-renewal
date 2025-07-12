import { supabase } from "@components/lib/supabaseClient";
import { create } from "zustand";

export interface PostState {
  id: number;
  title: string;
  contents: string;
  author_id: string;
  author_name: string;
  status?: string;
  visibility?: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  like_count?: number;
  category_id: number;
  liked_by_user?: string[];
}

interface PostsProps {
  posts: PostState[];
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
}

export const usePostStore = create<PostsProps>((set, get) => ({
  posts: [],
  bookmarks: [], // 북마크된 게시물 목록

  fetchPosts: async () => {
    let { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("게시물 불러오는 도중 에러", error);
      return;
    }

    if (data) {
      data = data.filter((post) => post.visibility === "public");
      set({ posts: data });
    }
  },

  fetchBookmarkPosts: async (userId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", userId);

    if (error) {
      console.error("북마크 게시물 불러오는 중 에러", error);
      return;
    }

    console.log("Fetched bookmark IDs:", data); // ✅ 북마크된 post_id 확인

    if (data) {
      set({ bookmarks: data.map((b) => b.post_id) });
    }
  },

  incrementViewCount: async (postId) => {
    const postIdNum = Number(postId);

    const { data, error } = await supabase
      .from("posts")
      .select("view_count")
      .eq("id", postIdNum)
      .single();

    if (error) {
      console.error("조회수 증가 중 에러", error);
      return;
    }

    if (data) {
      const viewCount = data.view_count || 0;
      await supabase
        .from("posts")
        .update({ view_count: viewCount + 1 })
        .eq("id", postIdNum);
    }
  },

  incrementLikeCount: async (postId, likedByUser) => {
    const postIdNumber = Number(postId);

    const { data: post, error } = await supabase
      .from("posts")
      .select("liked_by_user, like_count")
      .eq("id", postIdNumber)
      .single();

    if (error) {
      console.error("좋아요 증가 중 에러", error);
      return;
    }

    const likedByUserList: string[] = post?.liked_by_user ?? [];
    const isLiked = likedByUserList.includes(likedByUser);

    let newLikeCount = post?.like_count ?? 0;

    if (isLiked) {
      newLikeCount -= 1;
      likedByUserList.splice(likedByUserList.indexOf(likedByUser), 1);
    } else {
      newLikeCount += 1;
      likedByUserList.push(likedByUser);
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({ like_count: newLikeCount, liked_by_user: likedByUserList })
      .eq("id", postIdNumber);

    if (updateError) {
      console.error("🚨 좋아요 수 업데이트 실패:", updateError);
      return;
    }

    await get().fetchPosts();
  },

  // ✅ 북마크 추가
  addBookmark: async (userId, postId) => {
    if (!userId) return;

    const { error } = await supabase
      .from("bookmarks")
      .insert([{ user_id: userId, post_id: postId }]);

    if (error) {
      console.error("북마크 추가 실패:", error.message);
      return;
    }

    // Zustand 상태 업데이트
    set((state) => ({
      bookmarks: [...state.bookmarks, postId],
    }));
  },

  // ✅ 북마크 제거
  removeBookmark: async (userId, postId) => {
    if (!userId) return;

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);

    if (error) {
      console.error("북마크 삭제 실패:", error.message);
      return;
    }

    // Zustand 상태 업데이트
    set((state) => ({
      bookmarks: state.bookmarks.filter((id) => id !== postId),
    }));
  },
}));
