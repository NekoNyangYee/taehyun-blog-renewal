import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addCommentMutationFn,
  deleteCommentMutationFn,
  updateCommentMutationFn,
  commentsQueryKey,
} from "./commentQueries";
import { CommentRow, CommentUpdatePayload } from "@components/types/comment";

// CommentInsertPayload를 직접 정의 (created_at, updated_at 옵셔널)
export type CommentInsertInput = Omit<
  CommentRow,
  "id" | "created_at" | "updated_at"
> & {
  created_at?: string;
  updated_at?: string | null;
};

// 댓글 추가 Mutation
export const useAddComment = (postIds?: number[]) => {
  const queryClient = useQueryClient();

  return useMutation<CommentRow, Error, CommentInsertInput>({
    mutationFn: async (payload) => {
      // created_at과 updated_at을 자동으로 추가
      const now = new Date().toISOString();
      return addCommentMutationFn({
        ...payload,
        created_at: payload.created_at || now,
        updated_at: payload.updated_at || now,
      });
    },
    onSuccess: () => {
      // 댓글 목록 캐시 무효화
      if (postIds) {
        queryClient.invalidateQueries({
          queryKey: commentsQueryKey(postIds),
        });
      }
    },
  });
};

// 댓글 삭제 Mutation
export const useDeleteComment = (postIds?: number[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommentMutationFn,
    onSuccess: () => {
      // 댓글 목록 캐시 무효화
      if (postIds) {
        queryClient.invalidateQueries({
          queryKey: commentsQueryKey(postIds),
        });
      }
    },
  });
};

// 댓글 수정 Mutation
export const useUpdateComment = (postIds?: number[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCommentMutationFn,
    onSuccess: () => {
      // 댓글 목록 캐시 무효화
      if (postIds) {
        queryClient.invalidateQueries({
          queryKey: commentsQueryKey(postIds),
        });
      }
    },
  });
};
