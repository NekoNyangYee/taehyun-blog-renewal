"use client";

import { useEffect, useState } from "react";
import PageLoading from "@components/components/loading/PageLoading";
import { supabase } from "@components/lib/supabaseClient";
import { addUserToProfileTable } from "@components/lib/loginUtils";
import { usePostStore } from "@components/store/postStore";
import NotFound from "@components/app/not-found";

export default function LoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchPosts } = usePostStore();
  const [loading, setLoading] = useState(true);
  const [showNotFound, setShowNotFound] = useState(false);

  useEffect(() => {
    // 5초 타임아웃 설정
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

    fetchPosts().finally(() => {
      clearTimeout(timeoutId);
      setLoading(false);
    });
    addUser();

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return <PageLoading />;
  }

  if (showNotFound) {
    return <NotFound />;
  }

  return <>{children}</>;
}
