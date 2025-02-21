"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePostStore } from "@components/store/postStore";
import { useCategoriesStore } from "@components/store/categoriesStore";
import CategoryButtons from "@components/components/CategoryButtons";
import { formatDate } from "@components/lib/util/dayjs";

export default function CategoryPage({ params }: { params: { category: string } }) {
    const pathname = usePathname();
    const { posts, fetchPosts } = usePostStore();
    const { myCategories, fetchCategories } = useCategoriesStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(decodeURIComponent(params.category));

    useEffect(() => {
        if (posts.length === 0) {
            fetchPosts();
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        const categoryFromURL = decodeURIComponent(pathname.split("/").pop() || "");
        if (categoryFromURL !== "posts" && selectedCategory !== categoryFromURL) {
            setSelectedCategory(categoryFromURL);
        }
    }, [pathname]);

    const filteredPosts = posts.filter((post) => {
        const category = myCategories.find((cat) => cat.id === post.category_id);
        return category?.name.toLowerCase() === selectedCategory?.toLowerCase();
    });

    return (
        <div className="flex flex-col gap-2 p-container w-full">
            <h2 className="text-2xl font-bold">게시물</h2>
            <CategoryButtons selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPosts.map((post) => (
                        <div key={post.id} className="max-w-sm rounded-lg shadow-lg border border-containerColor overflow-hidden flex flex-col">
                            <div className="flex items-center justify-center object-cover w-auto h-40 bg-gray-800">
                                <img src="/react.png" alt="Post Thumbnail" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-2 p-4">
                                <h2 className="text-lg font-bold truncate">{post.title}</h2>
                                <p className="text-sm text-gray-600">by {post.author_name}</p>
                                <p className="text-sm text-gray-600">{formatDate(post.created_at)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center mt-6">해당 카테고리에 게시물이 없습니다.</p>
            )}
        </div>
    );
}
