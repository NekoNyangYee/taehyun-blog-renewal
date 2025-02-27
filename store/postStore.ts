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
    fetchPosts: () => Promise<void>;
    incrementViewCount: (postId: number) => Promise<void>;
};

export const usePostStore = create<PostsProps>((set) => ({
    posts: [],
    fetchPosts: async () => {
        const { data, error } = await supabase.from("posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.log("게시물 불러오는 도중 에러", error);
        }

        if (data) {
            set({
                posts: data.map(post => ({
                    id: post.id,
                    title: post.title,
                    contents: post.contents,
                    author_id: post.author_id,
                    author_name: post.author_name,
                    status: post.status,
                    visibility: post.visibility,
                    created_at: post.created_at,
                    updated_at: post.updated_at,
                    view_count: post.view_count,
                    like_count: post.like_count,
                    category_id: post.category_id
                })),
            })
        }
    },
    incrementViewCount: async (postId: string | number) => {
        const postIdNum = Number(postId);

        const { data, error } = await supabase
            .from("posts")
            .select("view_count")
            .eq("id", postIdNum)
            .single();

        if (error) {
            console.log("조회수 증가 중 에러", error);
        };

        if (data) {
            const viewCount = data.view_count || 0;
            await supabase
                .from("posts")
                .update({ view_count: viewCount + 1 })
                .eq("id", postIdNum);
        };
    },
}));