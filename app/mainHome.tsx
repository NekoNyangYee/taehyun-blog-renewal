"use client";

import HeroSection from "@components/components/HeroSection";
import { formatDate } from "@components/lib/util/dayjs";
import { lowerURL } from "@components/lib/util/lowerURL";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { useCommentStore } from "@components/store/commentStore";
import { usePostStore } from "@components/store/postStore";
import { useQuery } from "@tanstack/react-query";
import {
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
  ArrowUpWideNarrowIcon,
  ChevronRight,
  EyeIcon,
  Grid2X2Plus,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";

export default function MainHome() {
  const { posts, setPostsFromQuery } = usePostStore();
  const { myCategories, setCategoriesFromQuery } = useCategoriesStore();
  const { comments, setCommentsFromQuery } = useCommentStore();

  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });

  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);

  const commentsQuery = useQuery({
    queryKey: commentsQueryKey(postIds),
    queryFn: () => fetchCommentsQueryFn(postIds),
    enabled: postIds.length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (postsQuery.data) {
      setPostsFromQuery(postsQuery.data);
    }
  }, [postsQuery.data, setPostsFromQuery]);

  useEffect(() => {
    if (categoriesQuery.data) {
      setCategoriesFromQuery(categoriesQuery.data);
    }
  }, [categoriesQuery.data, setCategoriesFromQuery]);

  useEffect(() => {
    if (commentsQuery.data) {
      setCommentsFromQuery(commentsQuery.data);
    }
  }, [commentsQuery.data, setCommentsFromQuery]);

  // 인기 게시물(조회수 기준 상위 4개)
  const popularPosts = [...posts]
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
    .slice(0, 4);

  return (
    <div className="p-container flex flex-col gap-2 w-full max-w-[90rem] mx-auto overflow-x-hidden">
      <HeroSection />
      <div className="flex flex-col gap-4 rounded-container w-full">
        <div className="flex items-center justify-between">
          <h2 className="flex gap-2 text-2xl font-bold items-center">
            <ArrowUpWideNarrowIcon size={24} /> 최신 게시물
          </h2>
          <Link href="/posts">
            <ChevronRight size={24} className="cursor-pointer" />
          </Link>
        </div>
        <div className="w-full py-container">
          {posts.length > 0 ? (
            <div className="overflow-x-auto h-[386px]">
              <div className="flex flex-nowrap gap-4 min-w-0 mb-2">
                {posts.slice(0, 5).map((post) => {
                  const category = myCategories.find(
                    (cat) => cat.id === post.category_id
                  );
                  const imageUrl = category?.thumbnail;

                  const currentCategoryName = lowerURL(category?.name || "");

                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${currentCategoryName}/${post.id}`}
                    >
                      <div className="rounded-lg shadow-lg border border-containerColor overflow-hidden flex flex-col min-w-[300px] max-w-[300px]">
                        <div className="flex items-center justify-center w-full h-44 bg-gray-800">
                          <img
                            src={imageUrl}
                            alt="Post Thumbnail"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col flex-1 p-container">
                          <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                            {currentCategoryName}
                          </span>
                          <span className="text-lg font-semibold mt-2 truncate">
                            {post.title}
                          </span>
                          <p className="text-sm text-gray-600">
                            by {post.author_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(post.created_at)}
                          </p>
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
                              {
                                comments.filter(
                                  (comment) => comment.post_id === post.id
                                ).length
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full h-[386px] flex items-center justify-center border border-containerColor rounded-container">
              <p className="text-lg font-semibold">게시물이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="flex gap-2 text-2xl font-bold items-center">
          <HeartIcon size={24} /> 인기 게시물
        </h2>
        <div className="w-full py-container">
          {popularPosts.length > 0 ? (
            <div className="overflow-x-auto h-[386px]">
              <div className="flex flex-nowrap gap-4 min-w-0 mb-2">
                {popularPosts.map((post) => {
                  const category = myCategories.find(
                    (cat) => cat.id === post.category_id
                  );
                  const imageUrl = category?.thumbnail;
                  const currentCategoryName = lowerURL(category?.name || "");

                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${currentCategoryName}/${post.id}`}
                    >
                      <div className="rounded-lg shadow-lg border border-containerColor overflow-hidden flex flex-col min-w-[300px] max-w-[300px]">
                        <div className="flex items-center justify-center w-full h-44 bg-gray-800">
                          <img
                            src={imageUrl}
                            alt="Post Thumbnail"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col flex-1 p-container">
                          <span className="bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                            {currentCategoryName}
                          </span>
                          <span className="text-lg font-semibold mt-2 truncate">
                            {post.title}
                          </span>
                          <p className="text-sm text-gray-600">
                            by {post.author_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(post.created_at)}
                          </p>
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
                              {
                                comments.filter(
                                  (comment) => comment.post_id === post.id
                                ).length
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full h-[386px] flex items-center justify-center border border-containerColor rounded-container">
              <p className="text-lg font-semibold">인기 게시물이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="flex gap-2 text-2xl font-bold items-center">
          <Grid2X2Plus size={24} /> 카테고리
        </h2>
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
            {myCategories.map((category) => {
              const imageUrl = category?.thumbnail;
              return (
                <Link
                  key={category.id}
                  href={`/posts/${lowerURL(category.name)}`}
                >
                  <div className="relative w-full h-20 overflow-hidden rounded-lg">
                    <img
                      src={imageUrl}
                      alt="Category Thumbnail"
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {category.name}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
