"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePostStore } from "@components/store/postStore";
import { useCommentStore } from "@components/store/commentStore";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { useSessionStore } from "@components/store/sessionStore";
import Link from "next/link";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [keyword, setKeyword] = useState("");
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // zustand store에서 데이터 구독
  const { posts, bookmarks, fetchPosts, fetchBookmarkPosts } = usePostStore();
  const { comments, fetchComments } = useCommentStore();
  const { myCategories } = useCategoriesStore();
  const { session } = useSessionStore();

  // 북마크된 게시물만 추출
  const bookmarkedPosts = posts.filter((post) => bookmarks.includes(post.id));

  // 검색 결과 필터링
  const filteredPosts = keyword
    ? posts.filter((post) => post.title.toLowerCase().includes(keyword.toLowerCase()))
    : [];
  const filteredComments = keyword
    ? comments.filter((comment) => comment.content.toLowerCase().includes(keyword.toLowerCase()))
    : [];
  const filteredBookmarkedPosts = keyword
    ? bookmarkedPosts.filter((post) => post.title.toLowerCase().includes(keyword.toLowerCase()))
    : [];

  // 게시물 id로 카테고리명 찾기
  const getCategoryNameByPostId = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    // @ts-ignore: category_id가 실제로는 number임을 가정
    return post && (post as any).category_name
      ? (post as any).category_name
      : post && (post as any).category_id
        ? (post as any).category_id
        : "";
  };

  // posts에서 카테고리 id로 카테고리 이름 찾기
  const getCategoryName = (post: any) => {
    const category = myCategories.find((cat) => cat.id === post.category_id);
    return category ? category.name : "";
  };

  // 댓글이 달린 게시물 제목 찾기
  const getPostTitleById = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    return post ? post.title : "(삭제된 게시물)";
  };

  // 팝업 열기
  const handleOpen = () => {
    setIsVisible(true);
  };

  // 팝업 닫기
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setKeyword(""), 500);
  };

  // 마운트/언마운트 및 애니메이션 제어
  useEffect(() => {
    if (isVisible) {
      const openTimeout = setTimeout(() => setIsOpen(true), 0);
      return () => clearTimeout(openTimeout);
    } else {
      setIsOpen(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isOpen && isVisible) {
      closeTimeout.current = setTimeout(() => setIsVisible(false), 300);
    }
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [isOpen, isVisible]);

  // 데이터가 없으면 fetch
  useEffect(() => {
    if (isVisible && posts.length === 0) fetchPosts();
    if (isVisible && comments.length === 0 && posts.length > 0) {
      fetchComments(posts.map((post) => post.id).join(","));
    }
    // 북마크 fetch는 필요시 추가
  }, [isVisible, posts, comments, fetchPosts, fetchComments]);

  // 로그인(session) 정보가 생기면 북마크 fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchBookmarkPosts(session.user.id);
    }
  }, [session, fetchBookmarkPosts]);

  const popup = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      {/* Search Popup */}
      <div className="absolute top-1/2 left-1/2 w-full max-w-2xl"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div
          className={`bg-white rounded-lg shadow-lg p-4 transition-all duration-300 mx-4
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="flex items-center gap-2 border-b pb-4">
            <Search size={28} className="text-gray-500" />
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="w-full outline-none text-lg"
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="mt-4 space-y-6 max-h-[400px] overflow-y-auto">
            {/* 검색어가 없을 때 안내문 */}
            {!keyword && (
              <div className="flex items-center justify-center min-h-[120px] border border-dashed border-containerColor rounded-container bg-gray-50 text-gray-400 text-base font-medium">
                검색하면 이 곳에 결과가 표시됩니다.
              </div>
            )}
            {/* 게시물 섹션 */}
            {filteredPosts.length > 0 && (
              <div className="border border-containerColor rounded-container p-container bg-white mb-4">
                <h3 className="text-base font-bold mb-2 text-blue-600">게시물</h3>
                <ul className="space-y-1">
                  {filteredPosts.map((post) => (
                    <li key={post.id} className="truncate">
                      <Link href={`/posts/${getCategoryName(post)}/${post.id}`} className="hover:underline" onClick={handleClose}>
                        <span className="font-semibold">{post.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* 댓글 섹션 */}
            {filteredComments.length > 0 && (
              <div className="border border-containerColor rounded-container p-container bg-white mb-4">
                <h3 className="text-base font-bold mb-2 text-green-600">댓글</h3>
                <ul className="space-y-1">
                  {filteredComments.map((comment) => {
                    const post = posts.find((p) => p.id === comment.post_id);
                    if (!post) return null;
                    return (
                      <li key={comment.id} className="truncate">
                        <Link href={`/posts/${getCategoryName(post)}/${post.id}`} className="hover:underline" onClick={handleClose}>
                          <span className="text-gray-700">{comment.content}</span>
                          <span className="ml-2 text-xs text-gray-400">(게시물: {post.title})</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {/* 북마크 섹션: 로그인한 유저만 */}
            {session && filteredBookmarkedPosts.length > 0 && (
              <div className="border border-containerColor rounded-container p-container bg-white mb-4">
                <h3 className="text-base font-bold mb-2 text-purple-600">북마크</h3>
                <ul className="space-y-1">
                  {filteredBookmarkedPosts.map((post) => (
                    <li key={post.id} className="truncate">
                      <Link href={`/posts/${getCategoryName(post)}/${post.id}`} className="hover:underline" onClick={handleClose}>
                        <span className="font-semibold">{post.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* 결과가 하나도 없을 때 */}
            {keyword && filteredPosts.length === 0 && filteredComments.length === 0 && filteredBookmarkedPosts.length === 0 && (
              <div className="flex items-center justify-center min-h-[120px] border border-dashed border-containerColor rounded-container bg-gray-50 text-gray-400 text-base font-medium">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative">
        <button
          onClick={handleOpen}
          className="flex bg-white items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors w-[170px] max-md:w-auto justify-start"
        >
          <Search size={28} className="text-gray-500 w-6 h-6" />
          <span className="text-gray-500 hidden md:inline">검색...</span>
        </button>
      </div>
      {isVisible && typeof window !== "undefined" && createPortal(popup, document.body)}
    </>
  );
} 