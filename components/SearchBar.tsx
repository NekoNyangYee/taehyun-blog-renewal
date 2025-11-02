"use client";

import { CornerDownRight, Search } from "lucide-react";
import { useState, useRef, useEffect, use } from "react";
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
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // zustand store에서 데이터 구독
  const { posts, bookmarks, fetchPosts, fetchBookmarkPosts } = usePostStore();
  const { comments, fetchComments } = useCommentStore();
  const { myCategories } = useCategoriesStore();
  const { session } = useSessionStore();

  // 북마크된 게시물만 추출
  const bookmarkedPosts = posts.filter((post) => bookmarks.includes(post.id));

  // 검색 결과 필터링
  const filteredPosts = keyword
    ? posts.filter((post) =>
        post.title.toLowerCase().includes(keyword.toLowerCase())
      )
    : [];
  const filteredComments = keyword
    ? comments.filter((comment) =>
        comment.content.toLowerCase().includes(keyword.toLowerCase())
      )
    : [];
  const filteredBookmarkedPosts = keyword
    ? bookmarkedPosts.filter((post) =>
        post.title.toLowerCase().includes(keyword.toLowerCase())
      )
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

  // 키워드 하이라이트 함수
  const highlightKeyword = (text: string) => {
    if (!keyword) return text;
    const regex = new RegExp(
      `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowAllPosts(false); // 닫을 때 초기화
    setTimeout(() => setKeyword(""), 500);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

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

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookmarkPosts(session.user.id);
    }
  }, [session, fetchBookmarkPosts]);

  // 결과 내용의 실제 높이 계산 (검색 결과가 바뀔 때마다)
  useEffect(() => {
    if (resultsContainerRef.current) {
      if (
        filteredPosts.length > 0 ||
        filteredBookmarkedPosts.length > 0 ||
        keyword.length > 0
      ) {
        const container = resultsContainerRef.current;

        // 새로운 높이 측정
        const scrollHeight = container.scrollHeight;
        const newHeight = Math.min(scrollHeight, 650);

        // 높이가 줄어드는 경우
        if (newHeight < contentHeight) {
          // 먼저 새 높이로 설정
          setContentHeight(newHeight);
          // 0.2초 뒤에 애니메이션으로 전환 (CSS transition 시작)
          setTimeout(() => {
            // 이미 설정된 높이이므로 추가 작업 없음
          }, 200);
        } else {
          // 높이가 늘어나는 경우: 기존 로직 유지
          setContentHeight(contentHeight);
          setTimeout(() => {
            const currentScrollHeight = container.scrollHeight;
            const currentNewHeight = Math.min(currentScrollHeight, 650);
            setContentHeight(currentNewHeight);
          }, 50);
        }
      } else {
        setContentHeight(0);
      }
    }
  }, [
    filteredPosts.length,
    filteredBookmarkedPosts.length,
    showAllPosts,
    showAllBookmarks,
    keyword,
  ]);

  const popup = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div className="absolute top-1/2 left-1/2 w-full max-w-2xl transform -translate-x-1/2 -translate-y-96">
        <div
          className={`bg-white rounded-lg shadow-lg transition-all duration-300 mx-4 overflow-hidden
            ${
              isOpen
                ? "translate-y-3 opacity-100 scale-100"
                : "translate-y-0 opacity-0 scale-95"
            }`}
        >
          <div
            className="flex items-center gap-2 border-b p-container"
            ref={searchInputRef}
          >
            <Search size={20} className="text-gray-500" />
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="w-full outline-none text-base"
              autoFocus
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                if (e.target.value.length === 0) {
                  setShowAllBookmarks(false);
                  setShowAllPosts(false);
                }
              }}
            />
          </div>
          <div
            ref={resultsContainerRef}
            id="search-results-container"
            className="bg-whiteoverflow-hidden scrollbar-hide transition-all duration-300"
            style={{
              maxHeight: `${contentHeight}px`,
              opacity: contentHeight > 0 ? 1 : 0,
            }}
          >
            {filteredPosts.length > 0 && (
              <div className="mb-4">
                <h3 className="text-base font-bold mx-4">게시물</h3>
                <div className="p-0 flex flex-col">
                  {filteredPosts
                    .slice(0, showAllPosts ? filteredPosts.length : 5)
                    .map((post) => (
                      <div
                        key={post.id}
                        className="truncate p-container hover:bg-gray-200 hover:transition-transform duration-200"
                      >
                        <Link
                          href={`/posts/${getCategoryName(post)}/${post.id}`}
                          className="flex gap-2 items-center"
                          onClick={handleClose}
                        >
                          <div className="flex flex-col gap-2 flex-1">
                            <span className="text-sm text-gray-500">
                              {
                                myCategories.filter(
                                  (cat) => cat.id === post.category_id
                                )[0].name
                              }
                            </span>
                            <span className="font-semibold truncate max-w-60">
                              {highlightKeyword(post.title)}
                            </span>
                          </div>
                          <img
                            src={
                              myCategories.find(
                                (cat) => cat.id === post.category_id
                              )?.thumbnail
                            }
                            alt="thumbnail"
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          />
                        </Link>
                      </div>
                    ))}
                </div>
                {filteredPosts.length > 5 && (
                  <div className="flex justify-center py-4">
                    <button
                      className="text-base bg-black py-2 text-white px-4 rounded-md"
                      onClick={() => setShowAllPosts(!showAllPosts)}
                    >
                      {showAllPosts
                        ? "접기"
                        : `더보기 (${filteredPosts.length - 5}개)`}
                    </button>
                  </div>
                )}
              </div>
            )}
            {session && filteredBookmarkedPosts.length > 0 && (
              <div className="border border-t-containerColor">
                <h3 className="text-base font-bold mx-4">나의 북마크</h3>
                <div className="p-0 flex flex-col">
                  {filteredBookmarkedPosts
                    .slice(
                      0,
                      showAllBookmarks ? filteredBookmarkedPosts.length : 5
                    )
                    .map((post) => (
                      <div
                        key={post.id}
                        className="truncate p-container hover:bg-gray-200 hover:transition-transform duration-200"
                      >
                        <Link
                          href={`/posts/${getCategoryName(post)}/${post.id}`}
                          className="flex gap-2 items-center"
                          onClick={handleClose}
                        >
                          <div className="flex flex-col gap-2 flex-1">
                            <span className="text-sm text-gray-500">
                              {
                                myCategories.filter(
                                  (cat) => cat.id === post.category_id
                                )[0].name
                              }
                            </span>
                            <span className="font-semibold truncate max-w-60">
                              {highlightKeyword(post.title)}
                            </span>
                          </div>
                          <img
                            src={
                              myCategories.find(
                                (cat) => cat.id === post.category_id
                              )?.thumbnail
                            }
                            alt="thumbnail"
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          />
                        </Link>
                      </div>
                    ))}
                </div>
                {filteredBookmarkedPosts.length > 5 && (
                  <div className="flex justify-center py-container">
                    <button
                      className="text-base bg-black py-2 text-white px-4 rounded-md"
                      onClick={() => setShowAllBookmarks(!showAllBookmarks)}
                    >
                      {showAllBookmarks
                        ? "접기"
                        : `더보기 (${filteredBookmarkedPosts.length - 5}개)`}
                    </button>
                  </div>
                )}
              </div>
            )}
            {keyword &&
              filteredPosts.length === 0 &&
              filteredComments.length === 0 &&
              filteredBookmarkedPosts.length === 0 && (
                <div className="flex items-center justify-center min-h-[120px] bg-gray-50 text-gray-400 text-base font-medium">
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
          className="flex bg-white items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 w-[270px] max-md:w-auto justify-start max-md:bg-transparent max-md:border-none"
        >
          <Search
            size={20}
            className="text-gray-500 max-md:text-black w-6 h-6"
          />
          <span className="text-gray-500 hidden md:inline">검색...</span>
        </button>
      </div>
      {isVisible &&
        typeof window !== "undefined" &&
        createPortal(popup, document.body)}
    </>
  );
}
