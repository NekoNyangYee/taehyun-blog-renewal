"use client";

import { useSessionStore } from "@components/store/sessionStore";
import Link from "next/link";
import {
  EyeIcon,
  HeartIcon,
  MessageSquareTextIcon,
  BookmarkIcon,
  ListXIcon,
} from "lucide-react";
import { cn } from "@components/lib/utils";
import { formatDate } from "@components/lib/util/dayjs";
import { useQuery } from "@tanstack/react-query";
import {
  postsQueryKey,
  fetchPostsQueryFn,
  bookmarkQueryKey,
  fetchBookmarksQueryFn,
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
import { useMemo } from "react";

export default function BookMarkDetailPage() {
  const { session } = useSessionStore();
  const userId = session?.user?.id;

  // TanStack Query로 데이터 가져오기
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

  // Mutation hooks
  const addBookmarkMutation = useAddBookmark(userId);
  const removeBookmarkMutation = useRemoveBookmark(userId);

  const bookmarkedPosts = useMemo(
    () => posts.filter((post) => bookmarks.includes(post.id)),
    [posts, bookmarks]
  );

  if (bookmarkedPosts.length === 0) {
    return (
      <div className="p-container w-full h-full flex flex-col gap-2 justify-center items-center">
        <ListXIcon size={40} className="text-gray-500" />
        <p className="text-gray-500 text-center">
          북마크 된 게시물이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="p-container w-full h-full flex flex-col gap-4">
      <h2 className="text-2xl font-bold">북마크</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
        {bookmarkedPosts.map((post) => {
          const category = categories.find(
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
              <div className="rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col transition transform hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-center object-cover w-auto lg:h-44 md:h-48 bg-gray-800">
                  <img
                    src={imageUrl}
                    alt="Post Thumbnail"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2 p-4">
                  <h2 className="text-lg font-bold truncate">{post.title}</h2>
                  <p className="text-sm text-gray-500">by {post.author_name}</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(post.created_at)}
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-4 text-[14px] text-gray-500">
                      <div className="flex gap-2 items-center">
                        <EyeIcon size={14} />
                        {post.view_count}
                      </div>
                      <div className="flex gap-2 items-center">
                        <HeartIcon size={14} />
                        {post.like_count}
                      </div>
                      <div className="flex gap-2 items-center">
                        <MessageSquareTextIcon size={14} />
                        {
                          comments.filter(
                            (comment) => comment.post_id === post.id
                          ).length
                        }
                      </div>
                    </div>

                    {session && (
                      <button
                        className="text-yellow-500 hover:text-yellow-500"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!userId) {
                            alert("로그인이 필요합니다.");
                            return;
                          }
                          if (isBookmarked) {
                            removeBookmarkMutation.mutate({
                              userId,
                              postId: post.id,
                            });
                          } else {
                            addBookmarkMutation.mutate({
                              userId,
                              postId: post.id,
                            });
                          }
                        }}
                      >
                        <BookmarkIcon
                          size={18}
                          className={cn(
                            isBookmarked ? "fill-yellow-500" : "fill-gray-500"
                          )}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
