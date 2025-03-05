"use client";

import { addUserToProfileTable } from "@components/lib/loginUtils";
import { supabase } from "@components/lib/supabaseClient";
import { formatDate } from "@components/lib/util/dayjs";
import categoryImages from "@components/lib/util/postThumbnail";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { useCommentStore } from "@components/store/commentStore";
import { usePostStore } from "@components/store/postStore";
import { ArrowUpWideNarrowIcon, ChevronRight, EyeIcon, HeartIcon, MessageSquareTextIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function MainHome() {
    const { posts, fetchPosts } = usePostStore();
    const { myCategories } = useCategoriesStore();
    const { comments } = useCommentStore();

    useEffect(() => {
        const addUser = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error("세션 가져오기 에러:", error);
                return;
            }

            if (data.session) {
                const userSessionData = {
                    id: data.session.user.id,
                    nickname: data.session.user.user_metadata.full_name || "",
                    profile: data.session.user.user_metadata.avatar_url || "",
                    email: data.session.user.email,
                };
                await addUserToProfileTable(userSessionData);
                console.log("유저 추가 완료");
            }
        }
        addUser();
    }, []);

    return (
        <div className="p-container w-full max-w-full flex flex-col gap-2">
            <div className="flex flex-col gap-4 rounded-container w-full max-w-full">
                <div className="flex items-center justify-between">
                    <h2 className="flex gap-2 text-2xl font-bold items-center"><ArrowUpWideNarrowIcon size={24} />최신 게시물</h2>
                    <Link href="/posts">
                        <ChevronRight size={24} className="cursor-pointer" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {posts.length > 0 && posts.slice(0, 4).map(post => {
                        const category = myCategories.find(cat => cat.id === post.category_id);
                        const imageUrl = categoryImages[category?.name || "/default.png"];
                        const currentCategoryName = category?.name;

                        return (
                            <Link key={post.id} href={`/posts/${currentCategoryName}/${post.id}`}>
                                <div className="rounded-lg shadow-lg border border-containerColor overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-center w-full h-44 bg-gray-800">
                                        <img src={imageUrl} alt="Post Thumbnail" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex flex-col flex-1 p-container">
                                        <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                                            {currentCategoryName}
                                        </span>
                                        <span className="text-lg font-semibold mt-2 truncate">{post.title}</span>
                                        <p className="text-sm text-gray-600">by {post.author_name}</p>
                                        <p className="text-sm text-gray-600">{formatDate(post.created_at)}</p>
                                        <div className="flex gap-2 pt-container">
                                            <div className="flex gap-1 items-center text-gray-500 text-sm">
                                                <EyeIcon size={16} /> {post.view_count}
                                            </div>
                                            <div className="flex gap-2 items-center text-sm text-metricsText">
                                                <HeartIcon size={14} />
                                                {post.like_count}
                                            </div>
                                            <div className="flex gap-2 items-center text-sm text-metricsText">
                                                <MessageSquareTextIcon size={14} />
                                                {comments.filter((comment) => comment.post_id === post.id).length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>

    );
}
