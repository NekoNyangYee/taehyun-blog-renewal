import { create } from "zustand";

interface PostStore {
    id: number;
    title: string;
    contents: string;
    author_id: string;
    status?: string;
    visibility?: string;
    created_at: string;
    updated_at: string;
    view_count?: number;
    like_count?: number;
    category_id: number;
}