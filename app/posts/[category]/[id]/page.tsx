"use client";

import { useEffect, useRef, useState } from "react";
import {
  PostState,
  PostStateWithoutContents,
  usePostStore,
} from "@components/store/postStore";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCategoriesStore } from "@components/store/categoriesStore";
import dayjs, { formatDate } from "@components/lib/util/dayjs";
import Link from "next/link";
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  BadgeCheck,
  CalendarRangeIcon,
  CornerDownRight,
  EyeIcon,
  EyeOffIcon,
  Heart,
  LockIcon,
  MessageSquareXIcon,
  SendIcon,
  TagIcon,
} from "lucide-react";
import PageLoading from "@components/components/loading/PageLoading";
import { Button } from "@components/components/ui/button";
import { useSessionStore } from "@components/store/sessionStore";
import { cn } from "@components/lib/utils";
import { useCommentStore } from "@components/store/commentStore";
import { Switch } from "@components/components/ui/switch";
import { Textarea } from "@components/components/ui/textarea";
import Image from "next/image";
import { useUIStore } from "@components/store/postLoadingStore";
import { lowerURL } from "@components/lib/util/lowerURL";
import NotFound from "@components/app/not-found";
import { useProfileStore } from "@components/store/profileStore";
import { GotoTop } from "@components/components/GoToTop";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPostsQueryFn,
  postsQueryKey,
  fetchPostByIdQueryFn,
  postDetailQueryKey,
  incrementViewCountMutationFn,
  toggleLikeMutationFn,
} from "@components/queries/postQueries";
import {
  categoriesQueryKey,
  fetchCategoriesQueryFn,
} from "@components/queries/categoryQueries";
import {
  commentsQueryKey,
  fetchCommentsQueryFn,
} from "@components/queries/commentQueries";

interface Heading {
  id: string;
  text: string;
  tag?: string;
}

interface HeadingGroup {
  h2: Heading;
  h3: Heading[];
}

/**
 * 별도 컴포넌트로 분리: 부모 재렌더 시에도 컴포넌트 아이덴티티 유지되어 깜빡임 방지
 */
function RenderedContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = html || "";

    // 이미지 스타일
    ref.current.querySelectorAll("img").forEach((img) => {
      const el = img as HTMLImageElement;
      el.style.display = "block";
      el.style.margin = "20px auto";
      el.style.maxWidth = "100%";
      el.style.height = "auto";
    });

    // 제목 여백
    ref.current.querySelectorAll("h1, h2, h3").forEach((heading) => {
      const el = heading as HTMLHeadingElement;
      el.style.margin = "1rem 0";
    });

    // 하이라이트
    let attempts = 0;
    const maxAttempts = 10;
    const tryHighlight = () => {
      const hljs = (window as any)?.hljs;
      if (hljs) {
        ref.current?.querySelectorAll("pre code").forEach((el) => {
          hljs.highlightElement(el as HTMLElement);
        });
      } else if (++attempts < maxAttempts) {
        setTimeout(tryHighlight, 150);
      }
    };
    tryHighlight();
  }, [html]);

  return <div ref={ref} className="leading-relaxed post-content" />;
}

export default function PostDetailPage() {
  const { posts, setPostsFromQuery, updatePostMetrics } = usePostStore();
  const { myCategories, setCategoriesFromQuery } = useCategoriesStore();
  const { session } = useSessionStore();
  const { comments, addComment, deleteComment, setCommentsFromQuery } =
    useCommentStore();
  const { profiles, fetchProfiles } = useProfileStore();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { id, category: urlCategory } = params;

  const [post, setPost] = useState<PostState | null>(null);
  const [headings, setHeadings] = useState<
    { id: string; text: string; tag: string }[]
  >([]);
  const [updatedContent, setUpdatedContent] = useState<string>("");
  const [hasIncremented, setHasIncremented] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isHeartClicked, setIsHeartClicked] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [isStatus, setIsStatus] = useState<boolean>(true);
  const [isReplyStatus, setIsReplyStatus] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const setPostLoading = useUIStore((state) => state.setPostLoading);
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (postsQuery.data) {
      setPostsFromQuery(postsQuery.data);
    }
  }, [postsQuery.data, setPostsFromQuery]);

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (categoriesQuery.data) {
      setCategoriesFromQuery(categoriesQuery.data);
    }
  }, [categoriesQuery.data, setCategoriesFromQuery]);

  const resolvedPostId = Array.isArray(id) ? id[0] : id;
  const numericPostId = Number(resolvedPostId);
  const hasValidPostId = Number.isFinite(numericPostId);
  const fallbackCommentsKey = commentsQueryKey("no-id");
  const activeCommentsKey = hasValidPostId
    ? commentsQueryKey([numericPostId])
    : fallbackCommentsKey;

  const postDetailQuery = useQuery({
    queryKey: postDetailQueryKey(numericPostId),
    queryFn: () => fetchPostByIdQueryFn(numericPostId),
    enabled: hasValidPostId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const commentsQuery = useQuery({
    queryKey: activeCommentsKey,
    queryFn: () => fetchCommentsQueryFn([numericPostId]),
    enabled: hasValidPostId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  const isHydratingPost = postDetailQuery.isLoading && !postDetailQuery.data;

  useEffect(() => {
    if (commentsQuery.data) {
      setCommentsFromQuery(commentsQuery.data);
    }
  }, [commentsQuery.data, setCommentsFromQuery]);

  useEffect(() => {
    if (postDetailQuery.data) {
      setPost(postDetailQuery.data);
      updatePostMetrics({
        id: postDetailQuery.data.id,
        view_count: postDetailQuery.data.view_count,
        like_count: postDetailQuery.data.like_count,
        liked_by_user: postDetailQuery.data.liked_by_user,
      });
    }
  }, [postDetailQuery.data, setPost, updatePostMetrics]);

  useEffect(() => {
    if (postDetailQuery.error) {
      console.error("게시물 상세 로드 실패:", postDetailQuery.error);
      setIsNotFound(true);
      setLoading(false);
      setPostLoading(false);
    }
  }, [postDetailQuery.error, setPostLoading]);

  const postsReady = posts.length > 0;
  const categoriesReady = myCategories.length > 0;

  const viewCountMutation = useMutation({
    mutationFn: incrementViewCountMutationFn,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: toggleLikeMutationFn,
  });

  const invalidateCommentsCache = () => {
    if (hasValidPostId) {
      queryClient.invalidateQueries({
        queryKey: commentsQueryKey([numericPostId]),
      });
    }
  };

  useEffect(() => {
    setPostLoading(isHydratingPost);
  }, [isHydratingPost, setPostLoading]);

  useEffect(() => {
    if (post && !hasIncremented) {
      const incrementView = async () => {
        try {
          await viewCountMutation.mutateAsync(post.id);
          setHasIncremented(true);
          const newViewCount = (post.view_count ?? 0) + 1;
          setPost((prev) =>
            prev ? { ...prev, view_count: newViewCount } : prev
          );
          updatePostMetrics({
            id: post.id,
            view_count: newViewCount,
          });
        } catch (error) {
          console.error("조회수 증가 실패:", error);
        }
      };
      incrementView();
    }
  }, [post?.id]);

  // 본문 내용이 실제로 바뀔 때만 목차 재계산 (좋아요로 인한 불필요한 재계산 방지)
  useEffect(() => {
    if (post?.contents) {
      const { headings, updatedHtml } = extractHeadings(post.contents);
      setHeadings(headings);
      setUpdatedContent(updatedHtml);
    }
  }, [post?.contents]);

  // 좋아요 상태만 감시 (다른 post 필드 변경 시 불필요한 실행 방지)
  useEffect(() => {
    if (post && session?.user?.id) {
      setIsHeartClicked(post.liked_by_user?.includes(session.user.id) ?? false);
    }
  }, [post?.liked_by_user, session?.user?.id]);

  /** 본문에서 h2, h3 태그에 고유 id 추가 */
  const extractHeadings = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    const headingCounts: { [key: string]: number } = {};
    let h2Count = 0; // h2 제목 개수를 추적

    const headings = Array.from(doc.querySelectorAll("h2, h3")).map(
      (heading) => {
        let baseId =
          heading.textContent?.replace(/\s+/g, "-").toLowerCase() || "";

        // 같은 제목이 있으면 숫자 추가하여 고유 id 생성
        if (headingCounts[baseId]) {
          headingCounts[baseId] += 1;
          baseId = `${baseId}-${headingCounts[baseId]}`;
        } else {
          headingCounts[baseId] = 1;
        }

        heading.id = baseId; // 실제 HTML에도 적용

        if (heading.tagName === "H2") h2Count++; // h2 개수 증가

        return {
          id: baseId,
          text: heading.textContent || "",
          tag: heading.tagName,
          h2Index: h2Count, // h2 순서 저장
        };
      }
    );

    return { headings, updatedHtml: doc.body.innerHTML };
  };

  /** 클릭 시 해당 제목으로 스크롤 이동 + URL 변경 */
  const scrollToHeading = (id: string, updateUrl = true) => {
    setTimeout(() => {
      const decodedId = decodeURIComponent(id);
      const headingElement = document.getElementById(decodedId);
      if (headingElement) {
        headingElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // 🔥 URL에 # 추가하여 경로 업데이트
        if (updateUrl) {
          const newUrl = `${window.location.pathname}#${decodedId}`;
          router.replace(newUrl, { scroll: false });
        }
      }
    }, 500); // 500ms 대기 후 실행
  };

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!hash) return;

    const scrollToHash = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // DOM에 아직 안 생겼으면 다음 프레임에서 다시 시도
        requestAnimationFrame(scrollToHash);
      }
    };

    scrollToHash(); // 실행
  }, [updatedContent]);

  const category = myCategories.find((cat) => cat.id === post?.category_id);
  const imageUrl = category?.thumbnail;

  if (isNotFound) {
    return <NotFound />;
  }

  if (!post) {
    return <PageLoading />;
  }

  // 목차를 구조적으로 정리 (h2 → h3 그룹핑)
  const headingGroups: HeadingGroup[] = [];
  let currentH2: Heading | null = null;

  headings.forEach((heading) => {
    if (heading.tag === "H2") {
      currentH2 = { id: heading.id, text: heading.text };
      headingGroups.push({ h2: currentH2, h3: [] });
    } else if (heading.tag === "H3" && currentH2) {
      headingGroups[headingGroups.length - 1].h3.push({
        id: heading.id,
        text: heading.text,
      });
    }
  });

  const postCategory = (categoryId: string | number) => {
    const category = myCategories.find((cat) => cat.id === categoryId);
    return category?.name || "카테고리 없음";
  };

  const currentPageIndex = posts.findIndex((p) => p.id === post?.id);

  const previousPage =
    currentPageIndex > 0 ? posts[currentPageIndex - 1] : null;
  const nextPage =
    currentPageIndex < posts.length - 1 ? posts[currentPageIndex + 1] : null;

  const handleHeartClick = () => {
    if (!session) {
      if (
        confirm(
          "로그인을 해야 좋아요를 누를 수 있습니다. 로그인 페이지로 이동할까요?"
        )
      ) {
        router.push("/login");
      }
      return;
    }

    if (!userId || !post) return;

    toggleLikeMutation.mutate(
      { postId: post.id, likedByUser: userId },
      {
        onSuccess: (metrics) => {
          setPost((prev) => (prev ? { ...prev, ...metrics } : prev));
          updatePostMetrics(metrics);
          setIsHeartClicked(metrics.liked_by_user?.includes(userId) ?? false);
        },
        onError: (error) => {
          console.error("🚨 좋아요 처리 중 오류 발생:", error);
        },
      }
    );
  };

  const handleSubmitReply = async () => {
    if (comment.trim() === "") {
      alert("댓글을 입력하세요.");
    }

    if (!comment || !session?.user || !post?.id) return;

    const author_name: string =
      session?.user?.user_metadata?.full_name || "익명";
    await addComment({
      author_id: session?.user.id,
      author_name,
      profile_image: session?.user.user_metadata.avatar_url ?? "",
      post_id: post?.id,
      parent_id: null, // ✅ 부모 댓글이 없으므로 null 설정
      content: comment,
      created_at: dayjs().tz("Asia/Seoul").toDate(), // ✅ KST 변환 후 `Date` 객체로 저장
      updated_at: dayjs().tz("Asia/Seoul").toDate(),
      status: !isStatus, // ✅ status 추가
    });

    setComment("");
    invalidateCommentsCache();
  };

  const deleteHandleComment = async (commentId: string | number) => {
    // 현재 접속한 유저만 보이게 설정
    if (!commentId) return;
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteComment(commentId); // ✅ commentId를 사용하여 삭제
      invalidateCommentsCache();
    } else {
      return;
    }
  };

  const canViewComment = (comment: (typeof comments)[number]) => {
    return (
      !comment.status || // 공개 댓글이거나
      comment.author_id === session?.user?.id || // 내가 쓴 댓글이거나
      post?.author_id === session?.user?.id // 게시글 작성자일 경우
    );
  };

  const handleSubmitSubCommment = async (parentId: number) => {
    if (replyContent.trim() === "") {
      alert("답글을 입력하세요.");
    }

    if (!replyContent || !session?.user || !post?.id) return;

    const author_name: string =
      session?.user?.user_metadata?.full_name || "익명";

    await addComment({
      author_id: session?.user.id,
      author_name,
      profile_image: session?.user.user_metadata.avatar_url ?? "",
      parent_id: parentId,
      post_id: post?.id,
      content: replyContent,
      created_at: dayjs().tz("Asia/Seoul").toDate(),
      updated_at: dayjs().tz("Asia/Seoul").toDate(),
      status: !isReplyStatus, // ✅ isReplyStatus 사용
    });

    setReplyContent("");
    setReplyingTo(null);
    invalidateCommentsCache();
  };

  const toggleReply = (commentId: number) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
  };

  console.log("렌더링 시점:", { loading, isNotFound });

  if (loading || isHydratingPost) {
    console.log("PageLoading 렌더링");
    return <PageLoading />;
  }

  if (isNotFound) {
    console.log("NotFound 렌더링");
    return <NotFound />;
  }

  console.log("메인 컴포넌트 렌더링");

  return (
    <div className="break-words whitespace-pre-wrap h-full w-full max-w-[1200px] mx-auto p-4">
      <div className="relative w-full h-72 overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt="게시물 대표 이미지"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 flex flex-col gap-4 justify-center items-center text-white p-container">
          <Link
            href={`/posts/${category?.name}`}
            className="flex gap-2 items-center bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md"
          >
            <TagIcon size={16} className="inline-block" />
            {postCategory(post.category_id)}
          </Link>
          <div className="bg-transparent px-4 py-2 rounded-container">
            <h2 className="text-3xl font-bold text-center">{post.title}</h2>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex gap-2 items-center bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md">
              <CalendarRangeIcon size={16} className="inline-block" />
              {formatDate(post.created_at)}
            </div>
            <div className="flex gap-2 items-center bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md">
              <EyeIcon size={16} className="inline-block" />
              {post.view_count}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse lg:flex-row gap-6 mt-6">
        <article className="flex-1 min-w-0">
          <RenderedContent html={updatedContent || post?.contents || ""} />
        </article>
        {headingGroups.length > 0 && (
          <aside className="flex flex-col gap-2 lg:w-[300px] lg:sticky top-20 self-start p-4 bg-white border border-containerColor rounded-lg shadow-md w-full">
            <h3 className="text-lg font-semibold m-0">목차</h3>
            <p className="flex flex-col gap-4">
              {headingGroups.map((group, index) => (
                <div key={group.h2.id} className="flex flex-col gap-2">
                  <li className="text-sm font-bold cursor-pointer hover:underline list-none">
                    <button
                      onClick={() => scrollToHeading(group.h2.id)}
                      className="block w-full text-left"
                    >
                      {`${index + 1}. ${group.h2.text}`}
                    </button>
                  </li>
                  {group.h3.length > 0 && (
                    <ul className="ml-2 flex flex-col gap-4">
                      {group.h3.map((subHeading) => (
                        <li
                          key={subHeading.id}
                          className="text-xs text-gray-600 cursor-pointer hover:underline"
                        >
                          <button
                            onClick={() => scrollToHeading(subHeading.id)}
                            className="block w-full text-left"
                          >
                            {subHeading.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </p>
          </aside>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full my-4">
        {previousPage && (
          <Link
            href={`/posts/${lowerURL(
              myCategories.find((cat) => cat.id === previousPage.category_id)
                ?.name || lowerURL(category?.name || "")
            )}/${previousPage.id}`}
            className="bg-searchInput p-container rounded-container flex-1 w-full max-w-full md:max-w-[50%] border border-gray-300"
          >
            <div className="flex gap-4 items-center justify-between">
              <ArrowLeftCircle size={34} className="text-gray-500" />
              <div className="flex flex-col">
                <p className="text-sm text-gray-700 text-right">이전 게시물</p>
                <p className="truncate max-w-[200px] overflow-hidden text-ellipsis text-right font-bold">
                  {previousPage.title}
                </p>
              </div>
            </div>
          </Link>
        )}
        {nextPage && (
          <Link
            href={`/posts/${lowerURL(
              myCategories.find((cat) => cat.id === nextPage.category_id)
                ?.name || lowerURL(category?.name || "")
            )}/${nextPage.id}`}
            className="bg-searchInput p-container rounded-container flex-1 w-full max-w-full md:max-w-[50%] border border-gray-300"
          >
            <div className="flex gap-4 items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm text-gray-700">다음 게시물</p>
                <p className="truncate leading-tight max-w-[200px] overflow-hidden text-ellipsis font-bold">
                  {nextPage.title}
                </p>
              </div>
              <ArrowRightCircle size={34} className="text-gray-500" />
            </div>
          </Link>
        )}
      </div>
      <div className="flex justify-center">
        <Button
          onClick={handleHeartClick}
          className={cn(
            `flex items-center gap-1 border border-slate-containerColor rounded-button ${
              isHeartClicked
                ? "border-logoutColor text-logoutText bg-logoutButton"
                : "border- text-containerColor bg-white"
            }`
          )}
        >
          <Heart
            size={20}
            className={cn(
              `${isHeartClicked ? "fill-red-500 stroke-none" : "currentColor"}`
            )}
          />
          {post?.like_count}
        </Button>
      </div>
      <Link href="/profile">
        <div className="flex items-center justify-between gap-4 py-6 border-t border-slate-containerColor mt-4 hover:cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-md flex-shrink-0">
              <Image
                src={
                  profiles.find((profile) => profile.id === post?.author_id)
                    ?.profile_image || "/default.png"
                }
                alt="작성자 프로필"
                width={80}
                height={80}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-metricsText tracking-wider">
                작성자
              </span>
              <p className="text-lg font-bold text-gray-900">
                {profiles.find((profile) => profile.id === post?.author_id)
                  ?.nickname || "(알 수 없음)"}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">{comments.length}개의 댓글</span>
        </div>
        <Textarea
          className="w-full min-h-40 resize-none p-container border rounded"
          placeholder={
            session
              ? "댓글을 입력하세요. (최대 1000자)"
              : "로그인을 한 후 이용 가능합니다."
          }
          value={comment}
          onChange={(e) => {
            if (e.target.value.length > 1000)
              alert("최대 1000자까지 입력 가능합니다.");
            setComment(e.target.value);
          }}
          disabled={!session}
          maxLength={1000}
        />
        <div className="flex gap-2 justify-end">
          {session ? (
            <>
              <Button onClick={() => setIsStatus((prev) => !prev)}>
                {isStatus ? (
                  <>
                    <EyeIcon /> 공개
                  </>
                ) : (
                  <>
                    <EyeOffIcon /> 비공개
                  </>
                )}
              </Button>
              <Button
                className="flex gap-2 w-auto p-button bg-navButton text-white rounded-button"
                onClick={handleSubmitReply}
              >
                <SendIcon size={20} />
                등록
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button className="bg-navButton text-white rounded-button">
                로그인 하러 가기
              </Button>
            </Link>
          )}
        </div>
      </div>
      {comments.length > 0 ? (
        comments
          .filter((comment) => !comment?.parent_id)
          .map((comment) => (
            <div
              key={comment.id}
              className="flex flex-col gap-2 border-b border-slate-containerColor py-container last:border-b-0"
            >
              {canViewComment(comment) && (
                <div className="flex items-center gap-4">
                  <div className="object-cover w-10 h-10 rounded-button overflow-hidden">
                    <Image
                      src={
                        comment.profile_image
                          ? decodeURIComponent(comment.profile_image)
                          : "/default.png"
                      }
                      alt="profile"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`flex items-center gap-2 font-semibold ${
                          comment.author_id === post?.author_id
                            ? "font-normal text-[12px] bg-black rounded-full text-white px-2 py-1"
                            : ""
                        }`}
                      >
                        {comment.author_name}
                      </span>
                      {comment.status && <LockIcon size={16} />}
                    </div>
                    <span className="text-[14px] text-metricsText">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                {canViewComment(comment) ? (
                  <p>{comment.content}</p>
                ) : (
                  <div className="flex items-center gap-2 italic">
                    비공개 댓글입니다
                  </div>
                )}
                {session && (
                  <div className="flex gap-2 justify-start">
                    {canViewComment(comment) && (
                      <Button
                        className="p-0 text-metricsText"
                        onClick={() => toggleReply(Number(comment.id))}
                      >
                        {replyingTo === comment.id ? "답장 취소" : "답장하기"}
                      </Button>
                    )}
                    {session?.user.id === comment.author_id && (
                      <Button
                        className="text-metricsText rounded-button p-0"
                        onClick={() => deleteHandleComment(Number(comment.id))}
                      >
                        삭제하기
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {replyingTo === comment.id && (
                <div className="flex flex-col border-l rounded-container border border-slate-containerColor overflow-hidden">
                  <Textarea
                    className="w-full min-h-40 resize-none p-container border-none rounded-none"
                    placeholder="답글을 입력하세요"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button onClick={() => setIsReplyStatus((prev) => !prev)}>
                      {isReplyStatus ? (
                        <>
                          <EyeIcon /> 공개
                        </>
                      ) : (
                        <>
                          <EyeOffIcon /> 비공개
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() =>
                        handleSubmitSubCommment(Number(comment.id))
                      }
                      className="flex items-center gap-2"
                    >
                      <SendIcon size={20} />
                      등록
                    </Button>
                  </div>
                </div>
              )}

              {/* 대댓글 렌더링 */}
              <div>
                {comments
                  .filter((reply) => reply.parent_id === comment.id)
                  .map((reply) => (
                    <div
                      key={reply.id}
                      className="flex flex-col gap-2 p-container border-b border-slate-containerColor bg-gray-100 last:border-b-0"
                    >
                      {canViewComment(reply) && (
                        <div className="flex items-center gap-4">
                          <div className="object-cover w-10 h-10 rounded-button overflow-hidden">
                            <Image
                              src={
                                reply.profile_image
                                  ? decodeURIComponent(reply.profile_image)
                                  : "/default.png"
                              }
                              alt="profile"
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span
                                className={`flex items-center gap-2 font-semibold ${
                                  reply.author_id === post?.author_id
                                    ? "font-normal text-[12px] bg-black rounded-full text-white px-2 py-1"
                                    : ""
                                }`}
                              >
                                {reply.author_name}
                              </span>
                              {isAdmin && (
                                <BadgeCheck
                                  size={22}
                                  className="fill-[#0075ff] text-white rounded-full"
                                />
                              )}
                              {reply.status && <LockIcon size={16} />}
                            </div>
                            <span className="text-[14px] text-metricsText">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col">
                        {canViewComment(reply) ? (
                          <p>{reply.content}</p>
                        ) : (
                          <div className="flex items-center gap-2 italic">
                            <CornerDownRight size={18} />
                            비공개 댓글입니다
                          </div>
                        )}
                        <div className="flex gap-2 justify-start">
                          {session?.user?.id === reply.author_id && (
                            <Button
                              className="text-metricsText rounded-button p-0"
                              onClick={() => deleteHandleComment(reply.id)}
                            >
                              삭제하기
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
      ) : (
        <div className="flex flex-col gap-2 p-container rounded-container border border-slate-containerColor h-[300px] items-center justify-center">
          <MessageSquareXIcon
            size={48}
            className="text-gray-500 items-center justify-center mx-auto"
          />
          <p className="text-center text-gray-500 text-lg flex justify-center items-center ">
            댓글이 없습니다.
          </p>
        </div>
      )}
      <GotoTop />
    </div>
  );
}
