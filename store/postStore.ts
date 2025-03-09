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
};

interface PostsProps {
    posts: PostState[];
    bookmarks: number[];
    fetchPosts: () => Promise<void>;
    fetchBookmarkPosts: (userId: string) => Promise<void>;
    incrementViewCount: (postId: number) => Promise<void>;
    addBookmark: (userId: string, postId: number) => Promise<void>;
    removeBookmark: (userId: string, postId: number) => Promise<void>;
};

export const usePostStore = create<PostsProps>((set) => ({
    posts: [],
    bookmarks: [], // 북마크된 게시물 목록

    fetchPosts: async () => {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("게시물 불러오는 도중 에러", error);
            return;
        }

        if (data) {
            set({ posts: data });
        }
    },

    fetchBookmarkPosts: async (userId) => {
        if (!userId) return;

        console.log("Fetching bookmarks for user:", userId);

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
