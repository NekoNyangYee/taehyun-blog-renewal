export interface CommentRow {
  id: number;
  post_id: number;
  parent_id: number | null;
  author_id: string;
  author_name: string;
  profile_image: string;
  content: string;
  status: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CommentState {
  id: number;
  post_id: number;
  parent_id: number | null;
  author_id: string;
  author_name: string;
  profile_image: string;
  content: string;
  status: boolean;
  created_at: Date;
  updated_at?: Date;
}

export type CommentInsertPayload = Omit<CommentRow, "id">;
export type CommentUpdatePayload = Partial<Omit<CommentRow, "id">> & {
  id: number;
};
