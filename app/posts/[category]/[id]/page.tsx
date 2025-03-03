"use client";

import { useEffect, useState } from "react";
import { PostState, usePostStore } from "@components/store/postStore";
import { usePathname, useRouter } from "next/navigation";
import { useCategoriesStore } from "@components/store/categoriesStore";
import categoryImages from "@components/lib/util/postThumbnail";
import { formatDate } from "@components/lib/util/dayjs";
import Link from "next/link";
import { ArrowLeftCircle, ArrowRightCircle, CalendarRangeIcon, EyeIcon, TagIcon } from "lucide-react";
import PageLoading from "@components/components/loading/PageLoading";
import { supabase } from "@components/lib/supabaseClient";

interface Heading {
    id: string;
    text: string;
    tag?: string;
};

interface HeadingGroup {
    h2: Heading;
    h3: Heading[];
};

export default function PostDetailPage() {
    const { posts, fetchPosts, incrementViewCount } = usePostStore();
    const { myCategories } = useCategoriesStore();
    const pathname = usePathname();
    const router = useRouter();

    const [post, setPost] = useState<PostState | null>(null);
    const [headings, setHeadings] = useState<{ id: string; text: string; tag: string }[]>([]);
    const [updatedContent, setUpdatedContent] = useState<string>("");
    const [hasIncremented, setHasIncremented] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            const postId = pathname.split("/").pop();
            if (posts.length === 0) {
                fetchPosts();
            } else {

                const selectedPost = posts.find((p) => String(p.id) === postId);
                setPost(selectedPost || null);

                if (selectedPost && !hasIncremented) {
                    const { incrementViewCount } = usePostStore.getState();
                    if (incrementViewCount) {
                        incrementViewCount(selectedPost.id);
                        setHasIncremented(true);

                        const { data: updatedPost, error: fetchUpdatedError } = await supabase
                            .from("posts")
                            .select("*")
                            .eq("id", selectedPost.id)
                            .single();

                        if (!fetchUpdatedError) {
                            setPost(updatedPost);
                        }
                    }
                }
                setLoading(false);
            }
        };

        fetchPost();
    }, [posts, pathname, hasIncremented]);

    useEffect(() => {
        if (post?.contents) {
            const { headings, updatedHtml } = extractHeadings(post.contents);
            setHeadings(headings);
            setUpdatedContent(updatedHtml);
        }
    }, [post]);

    /** 본문에서 h2, h3 태그에 고유 id 추가 */
    const extractHeadings = (htmlContent: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        const headingCounts: { [key: string]: number } = {};
        let h2Count = 0; // h2 제목 개수를 추적

        const headings = Array.from(doc.querySelectorAll("h2, h3")).map((heading) => {
            let baseId = heading.textContent?.replace(/\s+/g, "-").toLowerCase() || "";

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
        });

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
            headingGroups[headingGroups.length - 1].h3.push({ id: heading.id, text: heading.text });
        }
    });

    const postCategory = (categoryId: string | number) => {
        const category = myCategories.find((cat) => cat.id === categoryId);
        return category?.name || "카테고리 없음";
    };

    const currentPageIndex = posts.findIndex((p) => p.id === post?.id);

    const previousPage = currentPageIndex > 0 ? posts[currentPageIndex - 1] : null;
    const nextPage = currentPageIndex < posts.length - 1 ? posts[currentPageIndex + 1] : null;

    if (loading) return <PageLoading />;

    return (
        <div className="h-full w-full max-w-[1200px] mx-auto p-4">
            <div className="relative w-full h-72 overflow-hidden rounded-lg">
                <img src={imageUrl} alt="게시물 대표 이미지" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="absolute inset-0 flex flex-col gap-4 justify-center items-center text-white p-container">
                    <Link href={`/posts/${category?.name}`} className="flex gap-2 items-center bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md">
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
                                            <p className="truncate max-w-[200px] overflow-hidden text-ellipsis text-right font-bold">{previousPage.title}</p>
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
                                            <p className="truncate max-w-[200px] overflow-hidden text-ellipsis font-bold">{nextPage.title}</p>
                                        </div>
                                        <ArrowRightCircle size={34} className="text-gray-500" />
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                </article>
                {headingGroups.length > 0 && (
                    <aside className="flex flex-col gap-2 lg:w-[300px] lg:sticky top-20 self-start p-4 bg-white border border-containerColor rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold">목차</h3>
                        <ul className="flex flex-col gap-2">
                            {headingGroups.map((group, index) => (
                                <div key={group.h2.id}>
                                    <li className="text-sm font-bold cursor-pointer hover:underline list-none">
                                        <button onClick={() => scrollToHeading(group.h2.id)} className="block w-full text-left">
                                            {`${index + 1}. ${group.h2.text}`}
                                        </button>
                                    </li>
                                    {group.h3.length > 0 && (
                                        <ul className="ml-2 flex flex-col gap-2">
                                            {group.h3.map((subHeading) => (
                                                <li key={subHeading.id} className="text-xs text-gray-600 cursor-pointer hover:underline">
                                                    <button onClick={() => scrollToHeading(subHeading.id)} className="block w-full text-left">
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
        </div>
    );
};
