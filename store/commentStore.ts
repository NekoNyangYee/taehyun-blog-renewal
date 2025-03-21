import { supabase } from "@components/lib/supabaseClient";
import dayjs from "dayjs";
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
    created_at: Date;
    updated_at: Date;
};

interface CommentProps {
    comments: Comment[];
    fetchComments: (postIds: string) => Promise<void>;
    addComment: (newComment: Omit<Comment, "id">) => Promise<void>;
    deleteComment: (commentId: string | number) => Promise<void>;
    updateComment: (updatedFields: Partial<Comment> & { id: string | number }) => Promise<void>; // ✅ 수정
};

export const useCommentStore = create<CommentProps>((set) => ({
    comments: [],
    fetchComments: async (postIds) => {
        if (!postIds) {
            console.error("🚨 fetchComments: postIds가 undefined입니다.");
            return;
        }
    
        const postIdArray = typeof postIds === "string" 
            ? postIds.split(',').map(id => Number(id.trim())) 
            : [Number(postIds)];
    
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .in("post_id", postIdArray)
            .order("created_at", { ascending: true });
    
        if (error) {
            console.error("🚨 댓글 불러오기 실패:", error);
        } else {
            set({
                comments: data.map((comment) => ({
                    ...comment,
                    created_at: dayjs.utc(comment.created_at).tz("Asia/Seoul").toDate(),
                    updated_at: comment.updated_at ? dayjs.utc(comment.updated_at).tz("Asia/Seoul").toDate() : undefined,
                })),
            });
        }
    },    
    addComment: async (newComment) => {
        console.log("📌 addComment 호출됨. 받은 status 값:", newComment.status);

        const { data, error } = await supabase
            .from("comments")
            .insert({
                ...newComment,
                post_id: Number(newComment.post_id),
                created_at: dayjs().toDate(),
                updated_at: dayjs().toDate(),
                status: Boolean(newComment.status),
            })
            .select("*")
            .single();

        if (error) {
            console.error("🚨 댓글 추가 실패:", error);
        } else if (data) {
            set((state) => ({
                comments: [...state.comments, { ...data, created_at: dayjs(data.created_at).toDate(), updated_at: dayjs(data.updated_at).toDate() }],
            }));
        }
    },
    deleteComment: async (commentId) => {
        const { error } = await supabase.from("comments").delete().eq("id", commentId);

        if (error) {
            console.error("🚨 댓글 삭제 실패:", error);
        } else {
            set((state) => ({
                comments: state.comments.filter((comment) => comment.id !== commentId),
            }));
        }
    },
    updateComment: async (updatedFields: Partial<Comment> & { id: string | number }) => {
        const { id, ...fieldsToUpdate } = updatedFields;

        // ✅ Supabase에서 데이터 업데이트 실행
        const { data, error } = await supabase
            .from("comments")
            .update(fieldsToUpdate)
            .eq("id", id)
            .select("*")
            .single();

        if (error) {
            console.error("🚨 댓글 업데이트 실패:", error);
            return;
        }

        if (data) {
            console.log("✅ 댓글 업데이트 성공:", data);

            // ✅ Supabase에서 응답을 받은 후, 상태 업데이트
            set((state) => ({
                comments: state.comments.map((comment) =>
                    comment.id === id ? { ...comment, ...data } : comment
                ),
            }));
        }
    },
}));