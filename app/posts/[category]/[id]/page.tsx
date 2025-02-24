"use client";

import { useEffect, useState } from "react";
import { PostState, usePostStore } from "@components/store/postStore";
import { usePathname } from "next/navigation";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { formatDate } from "@components/lib/util/dayjs";
import categoryImages from "@components/lib/util/postThumbnail";
import Link from "next/link";
import { CalendarRangeIcon, TagIcon } from "lucide-react";

export default function PostDetailPage() {
    const { posts, fetchPosts } = usePostStore();
    const { myCategories } = useCategoriesStore();
    const pathname = usePathname();
    const [post, setPost] = useState<PostState | null>(null);

    useEffect(() => {
        if (posts.length === 0) {
            fetchPosts();
        } else {
            const postId = pathname.split("/").pop();
            const selectedPost = posts.find((p) => String(p.id) === postId);
            setPost(selectedPost || null);
        }
    }, [posts, pathname]);

    const category = myCategories.find((cat) => cat.id === post?.category_id);
    const imageUrl = categoryImages[category?.name || "/default.png"];

    const postCategory = (categoryId: string | number) => {
        const category = myCategories.find((cat) => cat.id === categoryId);
        return category?.name || "카테고리 없음";
    };

    if (!post) {
        return <div className="flex justify-center items-center h-screen text-lg font-semibold">로딩 중...</div>;
    }

    return (
        <div className="h-full flex flex-col w-full p-container">
            <div className="relative w-full h-72 overflow-hidden rounded-container">
                <img src={imageUrl} alt="게시물 대표 이미지" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="absolute inset-0 flex flex-col gap-4 justify-center items-center text-white p-container">
                    <div className="bg-transparent px-4 py-2 rounded-container">
                        <h2 className="text-3xl font-bold text-center">{post.title}</h2>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <Link href={`/posts/${category?.name}`} className="flex gap-2 items-center bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md">
                            <TagIcon size={16} className="inline-block" />
                            {postCategory(post.category_id)}
                        </Link>
                        <div className="flex gap-2 items-center bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md">
                            <CalendarRangeIcon size={16} className="inline-block" />
                            {formatDate(post.created_at)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: post.contents }} />
            </div>
        </div>
    );
}
