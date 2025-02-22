"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { Button } from "./ui/button";
import { usePostStore } from "@components/store/postStore";

export default function CategoryButtons({ selectedCategory, setSelectedCategory }: { selectedCategory: string | null, setSelectedCategory: (category: string | null) => void }) {
    const router = useRouter();
    const { posts } = usePostStore();
    const { myCategories } = useCategoriesStore();

    return (
        <div className="flex gap-2 py-2 overflow-x-auto">
            <Button
                onClick={() => {
                    if (selectedCategory !== null) {
                        setSelectedCategory(null);
                        router.push("/posts");
                    }
                }}
                className={`px-4 py-2 rounded-lg border border-containerColor flex gap-2 ${!selectedCategory ? "bg-black text-white" : "border-containerColor text-gray-500 hover:bg-gray-200"}`}
            >
                전체
                <p>({posts.length})</p>
            </Button>
            {myCategories.map((category) => (
                <Button
                    key={category.id}
                    onClick={() => {
                        if (selectedCategory !== category.name) {
                            setSelectedCategory(category.name);
                            router.push(`/posts/${encodeURIComponent(category.name)}`);
                        }
                    }}
                    className={`px-4 py-2 rounded-lg border border-containerColor flex gap-2 ${selectedCategory === category.name ? "bg-black text-white" : "border-containerColor text-gray-500 hover:bg-gray-200"}`}
                >
                    {category.name}
                    <p>({posts.filter(post => post.category_id === category.id).length})</p>
                </Button>
            ))}
        </div>
    );
}
