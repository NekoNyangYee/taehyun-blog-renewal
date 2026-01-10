"use client";

import { useEffect, useState } from "react";
import PageLoading from "../components/loading/PageLoading";
import { supabase } from "../lib/supabaseClient";
import { addUserToProfileTable } from "../lib/loginUtils";
import NotFound from "./not-found";
import { useQuery } from "@tanstack/react-query";
import { usePostStore } from "@components/store/postStore";
import {
  fetchPostsQueryFn,
  postsQueryKey,
} from "@components/queries/postQueries";

export default function LoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [showNotFound, setShowNotFound] = useState(false);

  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!postsQuery.isLoading) {
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log("5초 타임아웃 - 404 표시");
      setShowNotFound(true);
      setLoading(false);
    }, 5000);

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

    return () => clearTimeout(timeoutId);
  }, [postsQuery.isLoading]);

  if (loading) {
    return <PageLoading />;
  }

  if (showNotFound) {
    return <NotFound />;
  }

  return <>{children}</>;
}
