"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePostStore } from "@components/store/postStore";
import { useCategoriesStore } from "@components/store/categoriesStore";
import CategoryButtons from "@components/components/CAtegoryButtons";

export default function CategoryPage({ params }: { params: { category: string } }) {
    const pathname = usePathname();
    const { posts, fetchPosts } = usePostStore();
    const { myCategories, fetchCategories } = useCategoriesStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category);

    useEffect(() => {
        // ✅ posts가 없을 때만 fetchPosts() 실행 (불필요한 API 호출 방지)
        if (posts.length === 0) {
            fetchPosts();
        }
        fetchCategories();

        // ✅ URL에서 카테고리 추출 & 디코딩하여 상태 업데이트
        const categoryFromURL = decodeURIComponent(pathname.split("/").pop() || "");
        if (categoryFromURL && categoryFromURL !== "posts") {
            setSelectedCategory(categoryFromURL);
        } else {
            setSelectedCategory(null);
        }
    }, [pathname]); // ✅ pathname이 변경될 때만 실행


    const filteredPosts = posts.filter((post) => {
        const category = myCategories.find((cat) => cat.id === post.category_id);
        return category?.name.toLowerCase() === selectedCategory?.toLowerCase();
    });

    return (
        <div className="p-6 w-full">
            <h2 className="text-2xl font-bold">게시물</h2>
            <CategoryButtons selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <div key={post.id} className="max-w-sm rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-center object-cover w-auto h-40 bg-gray-800">
                                <img src="/react.png" alt="Post Thumbnail" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-2 p-4">
                                <h2 className="text-lg font-bold">{post.title}</h2>
                                <p className="text-sm text-gray-600">by {post.author_name} · 작성일: {post.created_at}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center mt-6">해당 카테고리에 게시물이 없습니다.</p>
                )}
            </div>
        </div>
    );
}
