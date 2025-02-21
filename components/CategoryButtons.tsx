"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { Button } from "./ui/button";

export default function CategoryButtons({ selectedCategory, setSelectedCategory }: { selectedCategory: string | null, setSelectedCategory: (category: string | null) => void }) {
    const router = useRouter();
    const { myCategories } = useCategoriesStore();

    return (
        <div className="flex gap-2">
            <Button
                onClick={() => {
                    setSelectedCategory(null);
                    router.push("/posts");
                }}
                className={`px-4 py-2 rounded-lg border border-containerColor ${!selectedCategory ? "bg-black text-white" : "border-gray-500 text-gray-500 hover:bg-gray-200"}`}
            >
                전체
            </Button>
            {myCategories.map((category) => (
                <Button
                    key={category.id}
                    onClick={() => {
                        setSelectedCategory(category.name);
                        router.push(`/posts/${category.name}`);
                    }}
                    className={`px-4 py-2 rounded-lg border border-containerColor ${selectedCategory === category.name ? "bg-black text-white" : "border-gray-500 text-gray-500 hover:bg-gray-200"}`}
                >
                    {category.name}
                </Button>
            ))}
        </div>
    );
}
