"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSessionStore } from "@components/store/sessionStore";
import { formatDate } from "@components/lib/util/dayjs";
import { usePostStore } from "@components/store/postStore";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { useCommentStore } from "@components/store/commentStore";
import { lowerURL } from "@components/lib/util/lowerURL";
import type { LucideIcon } from "lucide-react";
import {
  BookmarkIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  LogInIcon,
  MessageSquareTextIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  google: "구글",
  github: "깃허브",
  email: "이메일",
};

export default function MyInfoPage() {
  const { session, isLoading, fetchSession } = useSessionStore();
  const { posts, fetchPosts } = usePostStore();
  const { myCategories, fetchCategories } = useCategoriesStore();
  const { comments, fetchComments } = useCommentStore();

  useEffect(() => {
    if (!session) {
      fetchSession();
    }
  }, [session, fetchSession]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [fetchPosts, fetchCategories]);

  const profile = useMemo(() => {
    const user = session?.user;
    if (!user) {
      return null;
    }

    const rawProvider =
      user.app_metadata?.provider || user.identities?.[0]?.provider;

    return {
      avatar:
        (user.user_metadata as { avatar_url?: string })?.avatar_url ||
        "/default-profile.png",
      name:
        (user.user_metadata as { name?: string; full_name?: string })?.name ||
        (user.user_metadata as { full_name?: string })?.full_name ||
        "이름 정보 없음",
      email: user.email || "-",
      provider:
        (rawProvider && PROVIDER_LABEL[rawProvider]) || rawProvider || "-",
      lastSignIn: user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "-",
      createdAt: user.created_at ? formatDate(user.created_at) : "-",
      userId: user.id,
      sessionExpiresAt: session.expires_at
        ? formatDate(new Date(session.expires_at * 1000))
        : "-",
      audience: user.aud || "-",
    };
  }, [session]);

  const accountDetails = useMemo(() => {
    if (!profile) return [];

    const items: Array<{
      label: string;
      value: string;
      icon: LucideIcon;
    }> = [
      {
        label: "로그인 수단",
        value: profile.provider,
        icon: LogInIcon,
      },
      {
        label: "마지막 로그인",
        value: profile.lastSignIn,
        icon: ClockIcon,
      },
      {
        label: "계정 생성일",
        value: profile.createdAt,
        icon: CalendarIcon,
      },
      {
        label: "세션 만료 예정",
        value: profile.sessionExpiresAt,
        icon: ShieldCheckIcon,
      },
      {
        label: "Audience",
        value: profile.audience,
        icon: UsersIcon,
      },
    ];

    return items.filter((item) => item.value && item.value !== "-");
  }, [profile]);

  const userPosts = useMemo(() => {
    if (!profile?.userId) return [];
    return posts.filter((post) => post.author_id === profile.userId);
  }, [posts, profile?.userId]);

  const sortedUserPosts = useMemo(() => {
    return [...userPosts].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [userPosts]);

  const userPostIdsKey = useMemo(
    () => userPosts.map((post) => post.id).join(","),
    [userPosts]
  );

  useEffect(() => {
    if (!userPostIdsKey) return;
    fetchComments(userPostIdsKey);
  }, [userPostIdsKey, fetchComments]);

  const commentCountMap = useMemo(() => {
    const map = new Map<number, number>();
    comments.forEach((comment) => {
      map.set(comment.post_id, (map.get(comment.post_id) || 0) + 1);
    });
    return map;
  }, [comments]);

  if (isLoading) {
    return (
      <section className="flex min-h-[60vh] w-full items-center justify-center">
        <p className="text-metricsText">내 정보를 불러오는 중입니다...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold">로그인이 필요합니다.</p>
        <p className="text-sm text-metricsText">
          내 정보 페이지는 로그인 후 이용할 수 있어요.
        </p>
        <Link
          href="/login"
          className="p-button rounded-button border border-editButton bg-editButton px-6 py-3 text-loginText"
        >
          로그인 하러 가기
        </Link>
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col">
      <header className="relative flex w-full flex-col items-center overflow-hidden border-y border-containerColor bg-white">
        <div className="relative h-36 sm:h-44 md:h-52 w-full overflow-hidden">
          <div
            className="absolute inset-0 scale-110 transform bg-cover bg-center blur-lg"
            style={{ backgroundImage: `url(${profile.avatar})` }}
          />
          <div className="absolute inset-0 bg-white/25" />
        </div>
        <div className="relative z-10 -mt-14 sm:-mt-16 md:-mt-20 flex flex-col items-center gap-5 sm:gap-6 px-3 sm:px-4 pb-8 md:pb-10 text-center">
          <img
            src={profile.avatar}
            alt="프로필 이미지"
            className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full border-4 border-white shadow-xl object-cover"
          />
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">
              {profile.name}
            </h1>
            <p className="text-sm sm:text-base text-metricsText">
              {profile.email}
            </p>
          </div>
        </div>
      </header>

      <div className="flex w-full justify-center px-2 sm:px-4 py-6 md:py-10">
        <div className="w-full max-w-5xl space-y-8 md:space-y-10">
          <section className="rounded-container border border-containerColor bg-white p-4 md:p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-containerColor/60 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">계정 정보</h2>
                <p className="text-sm text-metricsText">
                  로그인 및 세션 정보를 확인하세요.
                </p>
              </div>
              <span className="text-xs uppercase tracking-wide text-metricsText">
                {profile.lastSignIn !== "-"
                  ? `마지막 로그인 ${profile.lastSignIn}`
                  : "최근 로그인 정보 없음"}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {accountDetails.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border border-containerColor/60 bg-gray-50 px-3 py-3 md:px-4 md:py-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-sm">
                    <Icon size={18} />
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-metricsText">
                      {label}
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">내가 작성한 글</h2>
                <p className="text-sm text-metricsText">
                  총 {sortedUserPosts.length}개의 게시물이 있습니다.
                </p>
              </div>
              {sortedUserPosts.length > 0 && (
                <Link
                  href="/posts"
                  className="self-start rounded-button border border-containerColor px-4 py-2 text-sm text-metricsText transition hover:bg-gray-100"
                >
                  전체 게시물 보기
                </Link>
              )}
            </div>

            {sortedUserPosts.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {sortedUserPosts.slice(0, 6).map((post) => {
                  const category = myCategories.find(
                    (cat) => cat.id === post.category_id
                  );
                  const imageUrl = category?.thumbnail;
                  const categoryName = category?.name || "미분류";
                  const categorySlug = category
                    ? lowerURL(category.name)
                    : "posts";
                  const commentCount = commentCountMap.get(post.id) || 0;

                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${categorySlug}/${post.id}`}
                      className="group"
                    >
                      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-containerColor/70 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                        <div className="relative h-32 sm:h-36 md:h-40 w-full bg-gray-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`${categoryName} 썸네일`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-metricsText">
                              이미지 없음
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                              {categoryName}
                            </span>
                            <BookmarkIcon
                              size={18}
                              className="text-yellow-500"
                              fill="currentColor"
                              strokeWidth={1.5}
                            />
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
                              {post.view_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <HeartIcon size={16} />
                              {post.like_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquareTextIcon size={16} />
                              {commentCount}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-40 md:h-56 flex-col items-center justify-center rounded-container border border-dashed border-containerColor bg-white text-center text-metricsText">
                <p className="text-base font-medium">
                  아직 작성한 게시물이 없습니다.
                </p>
                <Link
                  href="/posts"
                  className="mt-3 rounded-button border border-containerColor px-4 py-2 text-sm transition hover:bg-gray-100"
                >
                  게시물 보러가기
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
