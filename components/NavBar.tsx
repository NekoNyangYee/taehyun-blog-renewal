"use client";

import { useEffect } from "react";
import { useCategoriesStore } from "@components/store/categoriesStore";
import { useSessionStore } from "@components/store/sessionStore";
import {
  Grid2X2Icon,
  HomeIcon,
  LogOutIcon,
  LogInIcon,
  HandIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { supabase } from "@components/lib/supabaseClient";

export default function NavBar() {
  const currentPath: string = usePathname();
  const { fetchCategories } = useCategoriesStore();
  const { session, isLoading, fetchSession, addSession } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchSession(); // ✅ 세션 동기화
  }, []);

  const handleLogout = async () => {
    alert("로그아웃 되었습니다.");
    await supabase.auth.signOut();
    addSession(null);
    router.push("/");
  };

  const isActive = (path: string) =>
    currentPath === path ||
    (path === "/posts" && currentPath.startsWith("/posts"))
      ? "bg-black text-white font-semibold"
      : "bg-transparent text-gray-700 hover:bg-gray-100";

  return (
    <>
      {currentPath !== "/login" &&
        !isLoading && ( // ✅ 로딩이 끝날 때까지 UI 유지
          <aside className="sticky left-0 top-[65px] h-[calc(100vh-65px)] bg-white flex flex-col justify-between gap-2 z-0 max-2xl:hidden">
            <div className="p-container w-60 flex flex-col">
              <Link
                href={"/"}
                className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
                  "/"
                )}`}
              >
                <HomeIcon size={18} />
                <span className="truncate">홈</span>
              </Link>
              <Link
                href="/posts"
                className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
                  "/posts"
                )}`}
              >
                <Grid2X2Icon size={18} />
                <span className="truncate">게시물</span>
              </Link>
              {session && ( // ✅ 세션 확인 후 북마크 탭 표시
                <Link
                  href={"/bookmarks"}
                  className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
                    "/bookmarks"
                  )}`}
                >
                  <StarIcon size={18} />
                  <span className="truncate">북마크</span>
                </Link>
              )}
              <Link
                href={"/profile"}
                className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
                  "/profile"
                )}`}
              >
                <HandIcon size={18} />
                <span className="truncate">안녕하세요!</span>
              </Link>
            </div>
            <div className="w-full p-container border-t border-containerColor">
              {session && (
                <div className="flex gap-2 mb-4">
                  <img
                    src={
                      session?.user?.user_metadata?.avatar_url ||
                      "/default-profile.png"
                    }
                    alt="Profile Picture"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col justify-between">
                    <span className="break-all text-[14px] font-bold">
                      {session?.user?.user_metadata?.name}
                    </span>
                    <span className="text-[12px] font-semibold text-metricsText">
                      {session?.user?.email}
                    </span>
                  </div>
                </div>
              )}
              {session ? (
                <Button
                  onClick={handleLogout}
                  className="w-full h-10 p-button border border-logoutColor bg-logoutButton text-logoutText flex items-center gap-2"
                >
                  <LogOutIcon size={18} />
                  로그아웃
                </Button>
              ) : (
                <Link
                  href="/login"
                  className="w-full h-10 p-button border border-editButton rounded-button bg-editButton text-loginText flex items-center justify-center gap-2"
                >
                  <LogInIcon size={18} />
                  로그인
                </Link>
              )}
            </div>
          </aside>
        )}
    </>
  );
}
