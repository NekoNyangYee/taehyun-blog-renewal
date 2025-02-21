"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { usePostStore } from "@components/store/postStore";
import { useCategoriesStore } from "@components/store/categoriesStore";
import CategoryButtons from "@components/components/CategoryButtons";
import { EyeIcon, HeartIcon } from "lucide-react";
import { formatDate } from "@components/lib/util/dayjs";

export default function PostsPage() {
    const pathname = usePathname();
    const { posts, fetchPosts } = usePostStore();
    const { myCategories, fetchCategories } = useCategoriesStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [filteredPosts, setFilteredPosts] = useState(posts);
    const [isPending, startTransition] = useTransition(); // ✅ 부드러운 전환을 위해 useTransition 사용

    useEffect(() => {
        if (posts.length === 0) {
            fetchPosts();
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        const categoryFromURL = decodeURIComponent(pathname.split("/").pop() || "");
        if (categoryFromURL && categoryFromURL !== "posts" && selectedCategory !== categoryFromURL) {
            setSelectedCategory(categoryFromURL);
        } else if (categoryFromURL === "posts") {
            setSelectedCategory(null);
        }
    }, [pathname]);

    // ✅ `selectedCategory`가 변경될 때 `filteredPosts`를 즉시 업데이트 (로딩 지연 방지)
    useEffect(() => {
        if (selectedCategory === null) {
            setFilteredPosts(posts); // 🔥 전체 게시물로 바로 변경
        } else {
            startTransition(() => {
                setFilteredPosts(
                    posts.filter((post) => {
                        const category = myCategories.find((cat) => cat.id === post.category_id);
                        return category?.name.toLowerCase() === selectedCategory.toLowerCase();
                    })
                );
            });
        }
    }, [selectedCategory, posts]);

    return (
        <div className="p-container w-full flex flex-col gap-2">
            <h2 className="text-2xl font-bold">게시물</h2>
            <CategoryButtons selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

            {isPending ? (
                <p className="text-gray-500 text-center mt-4">로딩 중...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <div key={post.id} className="max-w-sm rounded-lg shadow-lg border border-containerColor overflow-hidden flex flex-col">
                                <div className="flex items-center justify-center object-cover w-auto h-40 bg-gray-800">
                                    <img src="/react.png" alt="Post Thumbnail" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex flex-col gap-2 p-container">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-lg font-bold truncate">{post.title}</h2>
                                        <p className="text-sm text-gray-600">by {post.author_name}</p>
                                        <p className="text-sm text-gray-600">{formatDate(post.created_at)}</p>
                                    </div>
                                    <div className="flex gap-4 text-[14px]">
                                        <div className="flex gap-2 items-center">
                                            <EyeIcon size={14} />
                                            {post.view_count}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <HeartIcon size={14} />
                                            {post.like_count}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full text-center mt-6">해당 카테고리에 게시물이 없습니다.</p>
                    )}
                </div>
            )}
        </div>
    );
}
