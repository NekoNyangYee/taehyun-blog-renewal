"use client";

import Image from "next/image";
import HeroSection from "@components/components/HeroSection";
import { formatDate } from "@components/lib/util/dayjs";
import { lowerURL } from "@components/lib/util/lowerURL";
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
  ChevronLeft,
  EyeIcon,
  Grid2X2Plus,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export default function MainHome() {
  const latestScrollRef = useRef<HTMLDivElement>(null);
  const popularScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState({
    latest: false,
    popular: false,
  });
  const [canScrollRight, setCanScrollRight] = useState({
    latest: true,
    popular: true,
  });

  const checkScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    type: "latest" | "popular"
  ) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setCanScrollLeft((prev) => ({ ...prev, [type]: scrollLeft > 0 }));
      setCanScrollRight((prev) => ({
        ...prev,
        [type]: scrollLeft < scrollWidth - clientWidth - 10,
      }));
    }
  };

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = 350;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(() => {
        checkScroll(ref, ref === latestScrollRef ? "latest" : "popular");
      }, 300);
    }
  };

  // TanStack Query로 데이터 가져오기
  const { data: posts = [] } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
  });

  const { data: categories = [] } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
  });

  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);

  const { data: comments = [] } = useQuery({
    queryKey: commentsQueryKey(postIds),
    queryFn: () => fetchCommentsQueryFn(postIds),
    enabled: postIds.length > 0,
  });

  const popularPosts = useMemo(
    () =>
      [...posts]
        .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
        .slice(0, 4),
    [posts]
  );

  return (
    <div className="w-full flex flex-col gap-12 md:gap-16 p-container max-w-[90rem] mx-auto">
      <HeroSection />

      <section className="flex flex-col gap-6 md:px-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="flex gap-3 text-3xl md:text-4xl font-bold items-center">
              <ArrowUpWideNarrowIcon size={32} className="text-gray-900" />
              최신 게시물
            </h2>
            <p className="text-metricsText text-sm md:text-base">
              가장 최근에 작성된 게시물들을 확인해보세요
            </p>
          </div>
          <Link
            href="/posts"
            className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
          >
            전체보기 <ChevronRight size={20} />
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div
              ref={latestScrollRef}
              onScroll={() => checkScroll(latestScrollRef, "latest")}
              className="overflow-x-auto scroll-smooth scrollbar-hide"
            >
              <div className="flex gap-6 pb-2 min-w-min">
                {posts.slice(0, 7).map((post) => {
                  const category = categories.find(
                    (cat) => cat.id === post.category_id
                  );
                  const imageUrl = category?.thumbnail;
                  const currentCategoryName = lowerURL(category?.name || "");
                  const categoryName = category?.name || "미분류";

                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${currentCategoryName}/${post.id}`}
                    >
                      <article className="group h-full flex flex-col overflow-hidden rounded-2xl border border-containerColor/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-containerColor min-w-[300px] max-w-[300px]">
                        <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={post.title}
                              fill
                              quality={65}
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 300px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-metricsText">
                              <Grid2X2Plus size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                              {categoryName}
                            </span>
                          </div>
                          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-gray-900 group-hover:text-gray-700 transition">
                            {post.title}
                          </h3>
                          <p className="text-sm text-metricsText">
                            by {post.author_name}
                          </p>
                          <p className="text-xs text-metricsText">
                            {formatDate(post.created_at)}
                          </p>
                          <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-metricsText border-t border-gray-100">
                            <span className="flex items-center gap-1.5 hover:text-gray-700 transition">
                              <EyeIcon size={16} />
                              {post.view_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-gray-700 transition">
                              <HeartIcon size={16} />
                              {post.like_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-gray-700 transition">
                              <MessageSquareTextIcon size={16} />
                              {
                                comments.filter(
                                  (comment) => comment.post_id === post.id
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => scroll(latestScrollRef, "left")}
                disabled={!canScrollLeft.latest}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100"
              >
                <ChevronLeft size={18} className="text-gray-700" />
              </button>
              <button
                onClick={() => scroll(latestScrollRef, "right")}
                disabled={!canScrollRight.latest}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100"
              >
                <ChevronRight size={18} className="text-gray-700" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-containerColor bg-white">
            <p className="text-lg font-semibold text-metricsText">
              게시물이 없습니다.
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6 md:px-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="flex gap-3 text-3xl md:text-4xl font-bold items-center">
              <HeartIcon size={32} className="text-red-500" />
              인기 게시물
            </h2>
            <p className="text-metricsText text-sm md:text-base">
              조회수가 높은 게시물들입니다
            </p>
          </div>
        </div>

        {popularPosts.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div
              ref={popularScrollRef}
              onScroll={() => checkScroll(popularScrollRef, "popular")}
              className="overflow-x-auto scroll-smooth scrollbar-hide"
            >
              <div className="flex gap-6 pb-2 min-w-min">
                {popularPosts.slice(0, 7).map((post) => {
                  const category = categories.find(
                    (cat) => cat.id === post.category_id
                  );
                  const imageUrl = category?.thumbnail;
                  const currentCategoryName = lowerURL(category?.name || "");
                  const categoryName = category?.name || "미분류";

                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${currentCategoryName}/${post.id}`}
                    >
                      <article className="group h-full flex flex-col overflow-hidden rounded-2xl border border-containerColor/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-containerColor relative min-w-[300px] max-w-[300px]">
                        <div className="absolute top-3 right-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                          <HeartIcon size={12} fill="currentColor" />
                          인기
                        </div>

                        <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={post.title}
                              fill
                              quality={65}
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 300px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-metricsText">
                              <Grid2X2Plus size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                              {categoryName}
                            </span>
                          </div>
                          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-gray-900 group-hover:text-gray-700 transition">
                            {post.title}
                          </h3>
                          <p className="text-sm text-metricsText">
                            by {post.author_name}
                          </p>
                          <p className="text-xs text-metricsText">
                            {formatDate(post.created_at)}
                          </p>
                          <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-metricsText border-t border-gray-100">
                            <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                              <EyeIcon size={16} />
                              {post.view_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1.5 font-semibold text-red-500">
                              <HeartIcon size={16} />
                              {post.like_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-gray-700 transition">
                              <MessageSquareTextIcon size={16} />
                              {
                                comments.filter(
                                  (comment) => comment.post_id === post.id
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => scroll(popularScrollRef, "left")}
                disabled={!canScrollLeft.popular}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100"
              >
                <ChevronLeft size={18} className="text-gray-700" />
              </button>
              <button
                onClick={() => scroll(popularScrollRef, "right")}
                disabled={!canScrollRight.popular}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100"
              >
                <ChevronRight size={18} className="text-gray-700" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-containerColor bg-white">
            <p className="text-lg font-semibold text-metricsText">
              인기 게시물이 없습니다.
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="flex gap-3 text-3xl md:text-4xl font-bold items-center">
            <Grid2X2Plus size={32} className="text-blue-600" />
            카테고리
          </h2>
          <p className="text-metricsText text-sm md:text-base">
            주제별로 게시물을 탐색해보세요
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const imageUrl = category?.thumbnail;
            const categoryLink = lowerURL(category.name);

            return (
              <Link key={category.id} href={`/posts/${categoryLink}`}>
                <div className="group relative h-32 sm:h-40 overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-containerColor/50">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    quality={65}
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-start p-4">
                    <span className="text-white font-bold text-base sm:text-lg leading-tight">
                      {category.name}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
