"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/components/ui/select";
import { cn } from "@components/lib/utils";
import { lowerURL } from "@components/lib/util/lowerURL";
import { useQuery } from "@tanstack/react-query";
import {
  postsQueryKey,
  fetchPostsQueryFn,
} from "@components/queries/postQueries";
import {
  categoriesQueryKey,
  fetchCategoriesQueryFn,
} from "@components/queries/categoryQueries";

interface CategorySelectProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export default function CategorySelect<
  CategorySelectType extends CategorySelectProps
>({ selectedCategory, setSelectedCategory }: CategorySelectType) {
  const router = useRouter();

  // TanStack Query로 데이터 가져오기
  const { data: posts = [] } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
  });

  const { data: categories = [] } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
  });

  // URL에서 온 소문자 카테고리를 원본 카테고리 이름으로 변환
  const selectedCategoryName = selectedCategory
    ? categories.find(
        (cat) => lowerURL(cat.name) === selectedCategory.toLowerCase()
      )?.name || selectedCategory
    : null;

  return (
    <Select
      value={selectedCategoryName || "all"}
      onValueChange={(value) => {
        if (value === "all") {
          setSelectedCategory(null);
          router.push("/posts");
        } else {
          setSelectedCategory(value);
          router.push(`/posts/${lowerURL(value)}`);
        }
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="카테고리 선택" />
      </SelectTrigger>
      <SelectContent className={cn("w-auto bg-white")}>
        <SelectGroup>
          <SelectLabel>카테고리</SelectLabel>
          <SelectItem value="all">전체 ({posts.length})</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name} (
              {posts.filter((post) => post.category_id === category.id).length})
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
