"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePostStore } from "@components/store/postStore";
import { useCategoriesStore } from "@components/store/categoriesStore";
import CategoryButtons from "@components/components/CategoryButtons";
import dayjs, { formatDate } from "@components/lib/util/dayjs";
import {
  BookmarkIcon,
  EyeIcon,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { useCommentStore } from "@components/store/commentStore";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/components/ui/select";
import { cn } from "@components/lib/utils";
import { useSessionStore } from "@components/store/sessionStore";

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const pathname = usePathname();
  const { session } = useSessionStore();
  const userId = session?.user?.id;
  const { posts, bookmarks, fetchPosts, addBookmark, removeBookmark } =
    usePostStore();
  const { myCategories, fetchCategories } = useCategoriesStore();
  const { comments, fetchComments } = useCommentStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    decodeURIComponent(params.category)
  );
  const [sortOrder, setSortOrder] = useState<string>("new-sort");
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    setIsPending(true);
    fetchPosts().then(() => {
      setIsPending(false);
    });
    fetchCategories();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      const postIds = posts.map((post) => post.id).join(",");
      fetchComments(postIds);
    }
  }, [posts]); // ✅ posts가 변경될 때만 실행

  useEffect(() => {
    const categoryFromURL = decodeURIComponent(pathname.split("/").pop() || "");
    if (categoryFromURL !== "posts" && selectedCategory !== categoryFromURL) {
      setSelectedCategory(categoryFromURL);
      fetchPosts();
    }
  }, [pathname]);

  const filteredPosts = posts.filter((post) => {
    const category = myCategories.find((cat) => cat.id === post.category_id);
    return category?.name.toLowerCase() === selectedCategory?.toLowerCase();
  });

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
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
  }, [filteredPosts, sortOrder]); // 🔥 posts와 정렬 기준이 바뀔 때만 재계산

  return (
    <div className="flex flex-col gap-4 p-container w-full">
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
      {isPending && posts.length === 0 ? (
        <div className="w-full h-[386px] flex items-center justify-center border border-containerColor rounded-container">
          <p className="text-gray-500 text-center">로딩 중...</p>
        </div>
      ) : (
        <>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
              {sortedPosts.length > 0
                ? sortedPosts.map((post) => {
                    const category = myCategories.find(
                      (cat) => cat.id === post.category_id
                    );
                    const imageUrl = category?.thumbnail;
                    const currentCategoryName = category?.name;
                    const isBookmarked = bookmarks.includes(post.id);

                    return (
                      <Link
                        key={post.id}
                        href={`/posts/${currentCategoryName}/${post.id}`}
                      >
                        <div
                          key={post.id}
                          className="rounded-lg shadow-lg border border-containerColor overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-center object-cover w-auto lg:h-44 md:h-48 bg-gray-800">
                            <img
                              src={imageUrl}
                              alt="Post Thumbnail"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-2 p-container">
                            <div className="flex flex-col gap-2">
                              <h2 className="text-lg font-bold truncate">
                                {post.title}
                              </h2>
                              <p className="text-sm text-metricsText">
                                by {post.author_name}
                              </p>
                              <p className="text-sm text-metricsText">
                                {formatDate(post.created_at)}
                              </p>
                            </div>
                            <div className="flex justify-between pt-container">
                              <div className="flex gap-4 text-[14px]">
                                <div className="flex gap-2 items-center text-metricsText">
                                  <EyeIcon size={14} />
                                  {post.view_count}
                                </div>
                                <div className="flex gap-2 items-center text-metricsText">
                                  <HeartIcon size={14} />
                                  {post.like_count}
                                </div>
                                <div className="flex gap-2 items-center text-metricsText">
                                  <MessageSquareTextIcon size={14} />
                                  {
                                    comments.filter(
                                      (comment) => comment.post_id === post.id
                                    ).length
                                  }
                                </div>
                              </div>
                              {session && (
                                <div className="flex gap-2 items-center text-metricsText">
                                  <BookmarkIcon
                                    size={18}
                                    className={cn(
                                      isBookmarked
                                        ? "fill-yellow-500 stroke-none"
                                        : "fill-none"
                                    )}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (!userId) {
                                        alert("로그인이 필요합니다.");
                                        return;
                                      }
                                      isBookmarked
                                        ? removeBookmark(userId, post.id)
                                        : addBookmark(userId, post.id);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                : null}
            </div>
          ) : (
            <div className="w-full h-[386px] flex items-center justify-center border border-containerColor rounded-container">
              <p className="text-gray-500 text-center">
                해당 카테고리에 게시물이 없습니다.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
