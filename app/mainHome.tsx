"use client";

import { addUserToProfileTable } from "@components/lib/loginUtils";
import { supabase } from "@components/lib/supabaseClient";
import { formatDate } from "@components/lib/util/dayjs";
import categoryImages from "@components/lib/util/postThumbnail";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { useCommentStore } from "@components/store/commentStore";
import { usePostStore } from "@components/store/postStore";
import {
  ArrowUpWideNarrowIcon,
  ChevronRight,
  EyeIcon,
  Grid2X2Plus,
  HeartIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function MainHome() {
  const { posts } = usePostStore();
  const { myCategories } = useCategoriesStore();
  const { comments, fetchComments } = useCommentStore();

  useEffect(() => {
    const addUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("세션 가져오기 에러:", error);
        return;
      }
      if (data.session) {
        const userSessionData = {
          id: data.session.user.id,
          nickname: data.session.user.user_metadata.full_name || "",
          profile: data.session.user.user_metadata.avatar_url || "",
          email: data.session.user.email,
        };
        await addUserToProfileTable(userSessionData);
        console.log("유저 추가 완료");
      }
    };
    addUser();
    fetchComments(posts.map((post) => post.id).join(","));
  }, []);

  return (
    <div className="p-container flex flex-col gap-2 w-full max-w-[90rem] mx-auto overflow-x-hidden">
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
                  const imageUrl =
                    categoryImages[category?.name || "/default.png"];
                  const currentCategoryName = category?.name;

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
          <Grid2X2Plus size={24} /> 카테고리
        </h2>
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
            {myCategories.map((category) => {
              const imageUrl = categoryImages[category.name];
              return (
                <Link key={category.id} href={`/posts/${category.name}`}>
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
