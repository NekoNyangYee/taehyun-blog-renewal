"use client";

import { useEffect } from "react";
import { usePostStore } from "@components/store/postStore";
import { useSessionStore } from "@components/store/sessionStore";

export default function BookMarkDetailPage() {
    const { bookmarks, fetchBookmarkPosts } = usePostStore();
    const { session } = useSessionStore();
    const userId = session?.user?.id;

    useEffect(() => {
        if (!userId) return;
        fetchBookmarkPosts(userId); // 로그인한 사용자의 북마크 리스트 불러오기
    }, [userId]);

    return (
        <div className="p-container w-full h-full flex flex-col">
            <h2 className="text-2xl font-bold">북마크</h2>
            <div className="bookmark-list">
                {bookmarks.length > 0 ? (
                    bookmarks.map((postId) => (
                        <div key={postId} className="bookmark-item">
                            <p>게시물 ID: {postId}</p> {/* 게시물 제목 대신 ID 출력 */}
                        </div>
                    ))
                ) : (
                    <p>북마크 된 게시물이 없습니다.</p>
                )}
            </div>
        </div>
    );
}
