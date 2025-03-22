"use client";

import { useEffect, useState } from "react";
import { PostState, usePostStore } from "@components/store/postStore";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCategoriesStore } from "@components/store/categoriesStore";
import categoryImages from "@components/lib/util/postThumbnail";
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
  SendIcon,
  TagIcon,
} from "lucide-react";
import PageLoading from "@components/components/loading/PageLoading";
import { supabase } from "@components/lib/supabaseClient";
import { Button } from "@components/components/ui/button";
import { useSessionStore } from "@components/store/sessionStore";
import { cn } from "@components/lib/utils";
import { useCommentStore } from "@components/store/commentStore";
import { Switch } from "@components/components/ui/switch";
import { Textarea } from "@components/components/ui/textarea";
import Image from "next/image";

interface Heading {
  id: string;
  text: string;
  tag?: string;
}

interface HeadingGroup {
  h2: Heading;
  h3: Heading[];
}

export default function PostDetailPage() {
  const { posts, fetchPosts } = usePostStore();
  const { myCategories } = useCategoriesStore();
  const { session } = useSessionStore();
  const { comments, fetchComments, addComment, deleteComment } =
    useCommentStore();
  const pathname = usePathname();
  const router = useRouter();
  const { id } = useParams();

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

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const postId = pathname.split("/").pop();

      // 게시물이 없으면 먼저 불러오기
      if (posts.length === 0) {
        await fetchPosts(); // fetchPosts()가 끝날 때까지 기다림
      }

      // 최신 상태의 posts를 가져옴
      const updatedPosts = usePostStore.getState().posts;
      const selectedPost = updatedPosts.find((p) => String(p.id) === postId);

      if (!selectedPost) {
        setPost(null);
        setLoading(false);
        return;
      }

      setPost(selectedPost);

      // 조회수 증가 로직 (한 번만 실행되도록 방지)
      if (!hasIncremented) {
        const { incrementViewCount } = usePostStore.getState();
        if (incrementViewCount) {
          await incrementViewCount(selectedPost.id);
          setHasIncremented(true);

          // 조회수 증가 후, 500ms 대기 후 최신 데이터를 다시 불러옴
          setTimeout(async () => {
            const { data: updatedPost, error: fetchUpdatedError } =
              await supabase
                .from("posts")
                .select("*")
                .eq("id", selectedPost.id)
                .single();

            if (!fetchUpdatedError && updatedPost) {
              setPost(updatedPost);
            }

            setLoading(false);
          }, 500);
        }
      } else {
        setLoading(false);
      }
    };

    fetchPost();
    fetchComments(String(id));
  }, [pathname]); // hasIncremented 제거하여 의도치 않은 반복 실행 방지

  useEffect(() => {
    if (post?.contents) {
      const { headings, updatedHtml } = extractHeadings(post.contents);
      setHeadings(headings);
      setUpdatedContent(updatedHtml);
    }
  }, [post]);

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session?.user.id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setIsAdmin(data.is_admin);
          }
        });
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (post && session?.user?.id) {
      setIsHeartClicked(post.liked_by_user?.includes(session.user.id) ?? false);
    }
  }, [post, session?.user?.id]);

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

  /** 새로고침 시 URL에 #이 있으면 해당 위치로 이동 */
  useEffect(() => {
    setTimeout(() => {
      const hash = decodeURIComponent(window.location.hash.replace("#", "")); // # 제거 후 디코딩
      if (hash) {
        scrollToHeading(hash, false); // URL 변경 없이 스크롤 이동만
      }
    }, 1000); // 1초 대기 후 실행 (DOM이 완전히 로드되도록)
  }, [updatedContent]); // 본문이 업데이트된 후 실행

  const category = myCategories.find((cat) => cat.id === post?.category_id);
  const imageUrl = categoryImages[category?.name || "/default.png"];

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

  const handleHeartClick = async () => {
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

    const userId = session.user?.id;
    if (!userId || !post) return;

    try {
      // 현재 상태를 기반으로 좋아요 여부 판단
      const isLiked = post.liked_by_user?.includes(userId);
      const newLikeCount = isLiked
        ? (post.like_count || 0) - 1
        : (post.like_count || 0) + 1;
      const updatedLikedByUser = isLiked
        ? (post.liked_by_user || []).filter((id) => id !== userId) // 취소 시 목록에서 제거
        : [...(post.liked_by_user || []), userId]; // 추가 시 목록에 포함

      // UI를 먼저 업데이트하지 않고 Supabase 업데이트 실행
      const { error } = await supabase
        .from("posts")
        .update({
          like_count: newLikeCount,
          liked_by_user: updatedLikedByUser,
        })
        .eq("id", post.id);

      if (error) {
        console.error("🚨 좋아요 업데이트 실패:", error);
        return;
      }

      // Supabase 업데이트가 성공한 후 상태를 변경
      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          like_count: newLikeCount,
          liked_by_user: updatedLikedByUser,
        };
      });

      // 상태 변경 후 버튼 상태 업데이트
      setIsHeartClicked(!isLiked);
    } catch (error) {
      console.error("🚨 좋아요 처리 중 오류 발생:", error);
    }
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
    fetchComments(String(post?.id));
  };

  const deleteHandleComment = async (commentId: string | number) => {
    // 현재 접속한 유저만 보이게 설정
    if (!commentId) return;
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteComment(commentId); // ✅ commentId를 사용하여 삭제
      fetchComments(String(post?.id));
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
    fetchComments(String(post?.id));
  };

  const toggleReply = (commentId: number) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
  };

  if (loading) return <PageLoading />;

  return (
    <div className="h-full w-full max-w-[1200px] mx-auto p-4">
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
          <div className="leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: updatedContent }} />
          </div>
        </article>
        {headingGroups.length > 0 && (
          <aside className="flex flex-col gap-2 lg:w-[300px] lg:sticky top-20 self-start p-4 bg-white border border-containerColor rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">목차</h3>
            <ul className="flex flex-col gap-2">
              {headingGroups.map((group, index) => (
                <div key={group.h2.id}>
                  <li className="text-sm font-bold cursor-pointer hover:underline list-none">
                    <button
                      onClick={() => scrollToHeading(group.h2.id)}
                      className="block w-full text-left"
                    >
                      {`${index + 1}. ${group.h2.text}`}
                    </button>
                  </li>
                  {group.h3.length > 0 && (
                    <ul className="ml-2 flex flex-col gap-2">
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
            </ul>
          </aside>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full my-4">
        {previousPage && (
          <Link
            href={`/posts/${category?.name}/${previousPage.id}`}
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
            href={`/posts/${category?.name}/${nextPage.id}`}
            className="bg-searchInput p-container rounded-container flex-1 w-full max-w-full md:max-w-[50%] border border-gray-300"
          >
            <div className="flex gap-4 items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm text-gray-700">다음 게시물</p>
                <p className="truncate max-w-[200px] overflow-hidden text-ellipsis font-bold">
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
      <div className="flex flex-col gap-4 py-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">{comments.length}개의 댓글</span>
        </div>
        <Textarea
          className="w-full min-h-40 resize-none p-container border rounded"
          placeholder={
            session ? "댓글을 입력하세요." : "로그인을 한 후 이용 가능합니다."
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
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
                          : "/default-profile.png"
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
                      {isAdmin && (
                        <BadgeCheck
                          size={22}
                          className="fill-[#0075ff] text-white rounded-full"
                        />
                      )}
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
                                  : "/default-profile.png"
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
        <div className="flex flex-col gap-2 p-container rounded-container border border-slate-containerColor">
          <p className="text-center text-lg flex justify-center items-center h-[120px]">
            댓글이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
