export interface Category {
  id: number;
  name: string;
  thumbnail: string;
}

export type CategorySummary = Pick<Category, "id" | "name">;
