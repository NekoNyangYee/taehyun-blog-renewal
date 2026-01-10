"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CategoryButtons from "@components/components/CategoryButtons";
import {
  EyeIcon,
  HeartIcon,
  MessageSquareTextIcon,
  BookmarkIcon,
} from "lucide-react";
import dayjs, { formatDate } from "@components/lib/util/dayjs";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/components/ui/select";
import { cn } from "@components/lib/utils";
import { useSessionStore } from "@components/store/sessionStore";
import { lowerURL } from "@components/lib/util/lowerURL";
import { useQuery } from "@tanstack/react-query";
import {
  bookmarkQueryKey,
  fetchBookmarksQueryFn,
  fetchPostsQueryFn,
  postsQueryKey,
} from "@components/queries/postQueries";
import {
  categoriesQueryKey,
  fetchCategoriesQueryFn,
} from "@components/queries/categoryQueries";
import {
  commentsQueryKey,
  fetchCommentsQueryFn,
} from "@components/queries/commentQueries";
import {
  useAddBookmark,
  useRemoveBookmark,
} from "@components/queries/postMutations";

export default function PostsPage() {
  const pathname = usePathname();
  const { session } = useSessionStore();
  const userId = session?.user?.id;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("new-sort");
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 마운트 확인 - Hydration 에러 방지
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ TanStack Query로 데이터 가져오기
  const { data: posts = [] } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
  });

  const { data: categories = [] } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: bookmarkQueryKey(userId),
    queryFn: () => fetchBookmarksQueryFn(userId),
    enabled: Boolean(userId),
  });

  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);

  const { data: comments = [] } = useQuery({
    queryKey: commentsQueryKey(postIds),
    queryFn: () => fetchCommentsQueryFn(postIds),
    enabled: postIds.length > 0,
  });

  // ✅ Mutation hooks
  const addBookmarkMutation = useAddBookmark(userId);
  const removeBookmarkMutation = useRemoveBookmark(userId);

  useEffect(() => {
    const categoryFromURL = decodeURIComponent(pathname.split("/").pop() || "");
    if (
      categoryFromURL &&
      categoryFromURL !== "posts" &&
      selectedCategory !== categoryFromURL
    ) {
      setSelectedCategory(categoryFromURL);
    } else if (categoryFromURL === "posts") {
      setSelectedCategory(null);
    }
  }, [pathname, selectedCategory]);

  // ✅ 필터링 및 정렬 로직
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // 카테고리 필터링
    if (selectedCategory) {
      filtered = posts.filter((post) => {
        const category = categories.find((cat) => cat.id === post.category_id);
        return category?.name.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // 정렬
    return [...filtered].sort((a, b) => {
      const dateA = dayjs(a.created_at).toDate();
      const dateB = dayjs(b.created_at).toDate();

      if (sortOrder === "new-sort") {
        return dateB.getTime() - dateA.getTime();
      } else if (sortOrder === "old-sort") {
        return dateA.getTime() - dateB.getTime();
      } else if (sortOrder === "max-view-sort") {
        return (b.view_count ?? 0) - (a.view_count ?? 0);
      } else if (sortOrder === "min-view-sort") {
        return (a.view_count ?? 0) - (b.view_count ?? 0);
      }
      return 0;
    });
  }, [posts, categories, selectedCategory, sortOrder]);

  return (
    <div className="p-container w-full flex flex-col flex-1 gap-4">
      <h2 className="text-2xl font-bold">게시물</h2>
      <div className="flex justify-between items-center gap-4">
        <CategoryButtons
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent className={cn("w-auto bg-white")}>
            <SelectItem value="new-sort">최신순</SelectItem>
            <SelectItem value="old-sort">오래된순</SelectItem>
            <SelectItem value="max-view-sort">조회수 높은순</SelectItem>
            <SelectItem value="min-view-sort">조회수 낮은순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 게시글 목록 */}
      {!isClient ? (
        <div className="w-full h-[386px] flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : filteredAndSortedPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
          {filteredAndSortedPosts.map((post) => {
            const category = categories.find(
              (cat) => cat.id === post.category_id
            );
            const imageUrl = category?.thumbnail;
            const currentCategoryName = lowerURL(category?.name || "");
            const categoryName = category?.name || "미분류";
            const isBookmarked = bookmarks.includes(post.id);

            const handleToggleBookmark = async (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              if (!userId) {
                alert("로그인이 필요합니다.");
                return;
              }

              if (isBookmarked) {
                await removeBookmarkMutation.mutateAsync({
                  userId,
                  postId: post.id,
                });
              } else {
                await addBookmarkMutation.mutateAsync({
                  userId,
                  postId: post.id,
                });
              }
            };

            return (
              <div
                key={post.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-containerColor/70 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <Link
                  href={`/posts/${currentCategoryName}/${post.id}`}
                  className="flex flex-col h-full"
                >
                  <div className="relative h-40 w-full bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Post Thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-metricsText">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {categoryName}
                      </span>
                      {isClient && session && (
                        <button
                          onClick={handleToggleBookmark}
                          className="relative z-20 pointer-events-auto"
                          type="button"
                        >
                          <BookmarkIcon
                            size={18}
                            className={cn(
                              isBookmarked
                                ? "fill-yellow-500 stroke-none"
                                : "fill-none"
                            )}
                          />
                        </button>
                      )}
                    </div>
                    <h3 className="truncate text-lg font-semibold leading-tight text-gray-900">
                      {post.title}
                    </h3>
                    <p className="text-sm text-metricsText">
                      by {post.author_name}
                    </p>
                    <p className="text-sm text-metricsText">
                      {formatDate(post.created_at)}
                    </p>
                    <div className="mt-auto flex items-center gap-4 pt-3 text-sm text-metricsText">
                      <span className="flex items-center gap-1">
                        <EyeIcon size={16} />
                        {post.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartIcon size={16} />
                        {post.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquareTextIcon size={16} />
                        {
                          comments.filter(
                            (comment) => comment.post_id === post.id
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-[386px] flex items-center justify-center border border-containerColor rounded-container">
          <p className="text-gray-500 text-center">
            해당 카테고리에 게시물이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
