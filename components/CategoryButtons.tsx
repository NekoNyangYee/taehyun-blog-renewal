"use client";

import { useRouter } from "next/navigation";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { usePostStore } from "@components/store/postStore";
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

interface CategorySelectProps {
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
}

export default function CategorySelect<CategorySelectType extends CategorySelectProps>({ selectedCategory, setSelectedCategory }: CategorySelectType) {
    const router = useRouter();
    const { posts } = usePostStore();
    const { myCategories } = useCategoriesStore();

    return (
        <Select
            value={selectedCategory || "all"}
            onValueChange={(value) => {
                if (value === "all") {
                    setSelectedCategory(null);
                    router.push("/posts");
                } else {
                    setSelectedCategory(value);
                    router.push(`/posts/${encodeURIComponent(value)}`);
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
                    {myCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                            {category.name} ({posts.filter(post => post.category_id === category.id).length})
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
