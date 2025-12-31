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

export type PostStateWithoutContents = Omit<PostState, "contents">;
export type PostMeta = Pick<
  PostStateWithoutContents,
  "id" | "title" | "author_name" | "created_at" | "category_id"
>;
export type PostMetrics = Pick<
  PostStateWithoutContents,
  "id" | "view_count" | "like_count" | "liked_by_user"
>;
