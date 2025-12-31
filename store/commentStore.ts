import dayjs from "dayjs";
import { create } from "zustand";
import {
  addCommentMutationFn,
  deleteCommentMutationFn,
  fetchCommentsQueryFn,
  updateCommentMutationFn,
} from "@components/queries/commentQueries";
import {
  CommentInsertPayload,
  CommentState,
  CommentUpdatePayload,
  CommentRow,
} from "@components/types/comment";

interface CommentProps {
  comments: CommentState[];
  fetchComments: (postIds: string) => Promise<void>;
  addComment: (newComment: Omit<CommentState, "id">) => Promise<void>;
  deleteComment: (commentId: string | number) => Promise<void>;
  updateComment: (
    updatedFields: Partial<CommentState> & { id: string | number }
  ) => Promise<void>;
  setCommentsFromQuery: (rows: CommentRow[]) => void;
}

const toNumberArray = (postIds: string | number): number[] => {
  if (typeof postIds === "string") {
    return postIds
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !Number.isNaN(id));
  }
  const parsed = Number(postIds);
  return Number.isNaN(parsed) ? [] : [parsed];
};

const toCommentState = (comment: CommentRow): CommentState => ({
  ...comment,
  created_at: dayjs.utc(comment.created_at).tz("Asia/Seoul").toDate(),
  updated_at: comment.updated_at
    ? dayjs.utc(comment.updated_at).tz("Asia/Seoul").toDate()
    : undefined,
});

const toInsertPayload = (
  newComment: Omit<CommentState, "id">
): CommentInsertPayload => ({
  ...newComment,
  post_id: Number(newComment.post_id),
  parent_id: newComment.parent_id ?? null,
  status: Boolean(newComment.status),
  created_at: dayjs(newComment.created_at).toISOString(),
  updated_at: newComment.updated_at
    ? dayjs(newComment.updated_at).toISOString()
    : dayjs().toISOString(),
});

const toUpdatePayload = (
  updatedFields: Partial<CommentState> & { id: string | number }
): CommentUpdatePayload => {
  const { id, ...rest } = updatedFields;
  const payload: CommentUpdatePayload = { id: Number(id) };

  if (rest.post_id !== undefined) payload.post_id = Number(rest.post_id);
  if (rest.parent_id !== undefined) payload.parent_id = rest.parent_id;
  if (rest.author_id !== undefined) payload.author_id = rest.author_id;
  if (rest.author_name !== undefined) payload.author_name = rest.author_name;
  if (rest.profile_image !== undefined)
    payload.profile_image = rest.profile_image;
  if (rest.content !== undefined) payload.content = rest.content;
  if (rest.status !== undefined) payload.status = Boolean(rest.status);
  if (rest.created_at instanceof Date)
    payload.created_at = dayjs(rest.created_at).toISOString();
  if (rest.updated_at instanceof Date)
    payload.updated_at = dayjs(rest.updated_at).toISOString();

  return payload;
};

export const useCommentStore = create<CommentProps>((set) => ({
  comments: [],
  fetchComments: async (postIds) => {
    if (!postIds) {
      console.error("🚨 fetchComments: postIds가 undefined입니다.");
      return;
    }

    const postIdArray = toNumberArray(postIds);
    if (postIdArray.length === 0) {
      console.warn("🚨 fetchComments: 유효한 postId가 없습니다.");
      return;
    }

    try {
      const data = await fetchCommentsQueryFn(postIdArray);
      set({ comments: data.map(toCommentState) });
    } catch (error) {
      console.error("🚨 댓글 불러오기 실패:", error);
    }
  },
  addComment: async (newComment) => {
    try {
      const payload = toInsertPayload(newComment);
      const data = await addCommentMutationFn(payload);
      set((state) => ({
        comments: [...state.comments, toCommentState(data)],
      }));
    } catch (error) {
      console.error("🚨 댓글 추가 실패:", error);
    }
  },
  deleteComment: async (commentId) => {
    try {
      await deleteCommentMutationFn(commentId);
      const numericId = Number(commentId);
      set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== numericId),
      }));
    } catch (error) {
      console.error("🚨 댓글 삭제 실패:", error);
    }
  },
  updateComment: async (updatedFields) => {
    try {
      const payload = toUpdatePayload(updatedFields);
      const data = await updateCommentMutationFn(payload);
      set((state) => ({
        comments: state.comments.map((comment) =>
          comment.id === payload.id ? toCommentState(data) : comment
        ),
      }));
    } catch (error) {
      console.error("🚨 댓글 업데이트 실패:", error);
    }
  },
  setCommentsFromQuery: (rows) => {
    set({ comments: rows.map(toCommentState) });
  },
}));
