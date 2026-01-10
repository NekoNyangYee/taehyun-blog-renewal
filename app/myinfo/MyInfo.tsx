"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSessionStore } from "@components/store/sessionStore";
import { formatDate } from "@components/lib/util/dayjs";
import { lowerURL } from "@components/lib/util/lowerURL";
import type { LucideIcon } from "lucide-react";
import {
  BookmarkIcon,
  CalendarIcon,
  CheckCheck,
  CircleAlert,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  LockIcon,
  LogInIcon,
  MessageSquareTextIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UsersIcon,
  X,
} from "lucide-react";
import { useProfileStore } from "@components/store/profileStore";
import { useQuery } from "@tanstack/react-query";
import {
  postsQueryKey,
  fetchPostsQueryFn,
} from "@components/queries/postQueries";
import {
  categoriesQueryKey,
  fetchCategoriesQueryFn,
} from "@components/queries/categoryQueries";
import {
  commentsQueryKey,
  fetchCommentsQueryFn,
} from "@components/queries/commentQueries";

const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  google: "구글",
  github: "깃허브",
  email: "이메일",
};

export default function MyInfoPage() {
  const { session, isLoading, fetchSession } = useSessionStore();
  const { profiles, fetchProfiles, updateProfile } = useProfileStore();

  // TanStack Query로 데이터 가져오기
  const { data: posts = [] } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
  });

  const { data: categories = [] } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
  });

  const { data: comments = [] } = useQuery({
    queryKey: commentsQueryKey([]),
    queryFn: () => fetchCommentsQueryFn([]),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!session) {
      fetchSession();
    }
  }, [session, fetchSession]);

  useEffect(() => {
    if (isModalOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    }

    document.body.style.overflow = "auto";
    if (isVisible) {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, isVisible]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchProfiles(session.user.id);
  }, [session?.user?.id, fetchProfiles]);

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
        "/default.png",
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
      <section className="flex w-full min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <LockIcon size={48} className="text-metricsText" />
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

  const httpRegExp = /^https:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

  const updateProfileBanner = async () => {
    if (!httpRegExp.test(newBannerUrl)) {
      alert(
        "유효한 이미지 URL을 입력해주세요. (https://로 시작하는 jpg, png, gif 등)"
      );
      return;
    }
    setIsUpdating(true);
    await updateProfile({ profile_banner: newBannerUrl });
    setNewBannerUrl("");
    setIsUpdating(false);
    closeModal();
  };

  const cancelUpdateBanner = () => {
    if (newBannerUrl || newBannerUrl === profiles[0]?.profile_banner) {
      const confirmCancel = window.confirm(
        "변경 사항이 저장되지 않습니다. 정말 취소하시겠습니까?"
      );
      if (!confirmCancel) return;
    }
    setNewBannerUrl("");
    closeModal();
  };

  const bannerModalOpen = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 300);
  };

  return (
    <section className="flex w-full flex-col">
      <header className="relative flex w-full flex-col items-center overflow-hidden border-y border-containerColor bg-white">
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden">
          <div
            className="absolute h-full inset-0 transform bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                profiles[0]?.profile_banner
                  ? profiles[0]?.profile_banner
                  : "/default.png"
              })`,
            }}
          />
          <div className="absolute inset-0 bg-white/25" />
          <button
            onClick={bannerModalOpen}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-button border border-white/50 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <PencilIcon size={16} />
            배너 수정
          </button>
        </div>
        <div className="relative z-10 -mt-14 sm:-mt-16 md:-mt-20 flex flex-col items-center gap-5 sm:gap-6 px-3 sm:px-4 pb-8 md:pb-10 text-center">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="프로필 이미지"
              className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full border-4 border-white shadow-xl object-cover"
            />
            {profiles.find((profile) => profile.is_admin) && (
              <div className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0075FF] shadow-lg">
                <UserCheckIcon size={20} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-semibold leading-tight flex-wrap">
              {profile.name}
            </h1>
            <p className="text-sm sm:text-base text-metricsText">
              {profile.email}
            </p>
            <div className="flex gap-2 items-center text-sm">
              {profile.audience ? (
                <>
                  <CheckCheck size={16} className="text-green-500" />
                  <p className="text-green-500">
                    해당 계정은 TaeHyun's Devlog의 인증된 계정입니다.
                  </p>
                </>
              ) : (
                <>
                  <CircleAlert size={16} className="text-red-500" />
                  <p className="text-red-500">
                    해당 계정은 TaeHyun's Devlog의 미인증된 계정입니다.
                  </p>
                </>
              )}
            </div>
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
          {profiles.find((profile) => profile.is_admin) && (
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
                    const category = categories.find(
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
          )}
        </div>
      </div>

      {/* 배너 수정 모달 */}
      <div
        onClick={cancelUpdateBanner}
        style={{ willChange: isModalOpen ? "opacity" : "auto" }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-300 ease-out ${
          isModalOpen && isAnimating
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ willChange: isModalOpen ? "transform, opacity" : "auto" }}
          className={`relative w-full max-w-2xl rounded-2xl border border-containerColor bg-white p-6 shadow-xl transition-all duration-300 ease-out ${
            isModalOpen && isAnimating
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0"
          }`}
        >
          <h2 className="mb-6 text-2xl font-semibold">프로필 배너 수정</h2>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                현재 배너 이미지
              </label>
              <div className="h-40 w-full overflow-hidden rounded-lg border border-containerColor">
                <img
                  src={
                    newBannerUrl ||
                    profiles[0]?.profile_banner ||
                    "/default.png"
                  }
                  alt="현재 배너"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="bannerUrl"
                className="block text-sm font-medium text-gray-700"
              >
                새 배너 이미지 URL
              </label>
              <input
                id="bannerUrl"
                type="text"
                value={newBannerUrl}
                onChange={(e) => setNewBannerUrl(e.target.value)}
                placeholder="이미지 URL을 입력하세요"
                disabled={isUpdating}
                className={`w-full rounded-lg border border-containerColor px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5 ${
                  isUpdating ? "cursor-not-allowed opacity-50" : ""
                }`}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  cancelUpdateBanner();
                }}
                disabled={isUpdating}
                className={`rounded-button border border-containerColor bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${
                  isUpdating ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                취소
              </button>
              <button
                onClick={() => {
                  updateProfileBanner();
                }}
                disabled={!newBannerUrl || isUpdating}
                className={`rounded-button bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 ${
                  isUpdating ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {isUpdating ? "변경 중..." : "배너 변경"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
