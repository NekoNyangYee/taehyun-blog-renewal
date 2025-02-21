"use client";

import { addUserToProfileTable } from "@components/lib/loginUtils";
import { supabase } from "@components/lib/supabaseClient";
import { usePostStore } from "@components/store/postStore";
import { EyeIcon } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function MainHome() {
    const { posts, fetchPosts } = usePostStore();

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

        fetchPosts();
        addUser();
    }, []);

    return (
        <div className="p-container">
            <h2 className="text-2xl font-bold mb-4">📢 최신 게시물</h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.length > 0 && posts.map(post => (
                    <div key={post.id} className="bg-white shadow-md rounded-lg p-4 flex gap-4 items-center border border-gray-200">
                        <Image
                            src="/nextjs.png"
                            width={64}
                            height={64}
                            alt="NextJS 이미지"
                            className="rounded-lg object-cover"
                        />
                        <div className="flex flex-col flex-1">
                            <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                                NextJS
                            </span>
                            <span className="text-lg font-semibold mt-2 turncate">
                                {post.title}
                            </span>
                            <p className="text-sm text-gray-600">
                                by {post.author_name} · 작성일: {post.created_at}
                            </p>
                            <div className="flex gap-1 items-center text-gray-500 text-sm mt-1">
                                <EyeIcon size={16} />
                                {post.view_count} 조회
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
