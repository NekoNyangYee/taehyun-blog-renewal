import { supabase } from "@components/lib/supabaseClient";
import { create } from "zustand";

interface Comment {
    id: number;
    post_id: number;
    parent_id: number | null;
    author_id: string;
    author_name: string;
    profile_image: string;
    content: string;
    status: boolean;
    created_at: string;
    updated_at: string;
};

interface CommentProps {
    comments: Comment[];
    fetchComments: () => Promise<void>;
};

export const useCommentStore = create<CommentProps>((set) => ({
    comments: [],
    fetchComments: async () => {
        const { data, error } = await supabase.from("comments").select("*");

        if (data) {
            set({ comments: data });
        }

        if (error) {
            console.error("댓글 가져오기 에러:", error);
        }
    },
}));