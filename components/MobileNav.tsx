"use client";

import {
  Grid2X2Icon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  LogInIcon,
  InfoIcon,
  HandIcon,
  StarIcon,
  XIcon,
  UserRoundCog,
  PanelLeftClose,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import { useQuery } from "@tanstack/react-query";
import {
  categoriesQueryKey,
  fetchCategoriesQueryFn,
} from "@components/queries/categoryQueries";

export default function MobileNavBar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const currentPath: string = usePathname();
  const router = useRouter();
  const { session, addSession } = useSessionStore();
  const [profileName, setProfileName] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // TanStack Query로 카테고리 가져오기
  const { data: categories = [] } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("프로필 가져오기 에러:", error);
        return;
      }

      if (data?.nickname) {
        setProfileName(data.nickname);
      }
    };

    fetchProfile();
  }, [session]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsAnimating(true), 10); // 마운트 후 애니메이션 시작
    } else if (isVisible) {
      // 닫기 시작
      setIsAnimating(false);
      document.body.style.overflow = "auto";
      setTimeout(() => setIsVisible(false), 300); // 애니메이션 후 언마운트
    }
  }, [isOpen, isVisible]);

  const handleClose = () => {
    onClose();
  };

  const handleLogout = async () => {
    alert("로그아웃 되었습니다.");
    await supabase.auth.signOut();
    addSession(null);
    router.push("/");
    handleClose();
  };

  const isActive = (path: string) =>
    currentPath === path ||
    (path === "/posts" && currentPath.startsWith("/posts"))
      ? "bg-black text-white font-semibold"
      : "bg-transparent text-gray-700 hover:bg-gray-100";

  if (!isVisible) return null;

  return (
    <>
      {isVisible && (
        <div
          className={`fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-md z-30 transition-opacity duration-300 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 pt-16 w-[70%] max-w-[300px] h-full bg-white flex flex-col justify-between items-center gap-2 z-40 shadow-lg transition-transform duration-300 ${
          isAnimating ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 m-4 bg-white shadow-none rounded-full"
        >
          <PanelLeftClose size={24} />
        </button>
        <div className="p-container w-full flex flex-col overflow-auto scrollbar-hide">
          <Link
            href={"/"}
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/"
            )}`}
            onClick={handleClose}
          >
            <HomeIcon size={18} />
            <span className="truncate">홈</span>
          </Link>
          <Link
            href="/posts"
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/posts"
            )}`}
            onClick={handleClose}
          >
            <Grid2X2Icon size={18} />
            <span className="truncate">게시물</span>
          </Link>
          {isClient && session && (
            <Link
              href={"/bookmarks"}
              className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
                "/bookmarks"
              )}`}
              onClick={handleClose}
            >
              <StarIcon size={18} />
              <span className="truncate">북마크</span>
            </Link>
          )}
          <Link
            href={"/myinfo"}
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/myinfo"
            )}`}
            onClick={handleClose}
          >
            <UserRoundCog size={18} />
            <span className="truncate">내 정보</span>
          </Link>
          <Link
            href={"/profile"}
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/profile"
            )}`}
            onClick={handleClose}
          >
            <HandIcon size={18} />
            <span className="truncate">안녕하세요!</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2 w-full p-container border-t border-containerColor items-center">
          {isClient && session && (
            <div className="flex gap-2 mb-4 w-full">
              <img
                src={session?.user?.user_metadata?.avatar_url || "/default.png"}
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
          {isClient && session ? (
            <>
              <Button
                onClick={handleLogout}
                className="w-full h-10 p-button border border-logoutColor bg-logoutButton text-logoutText flex items-center gap-2"
              >
                <LogOutIcon size={18} />
                로그아웃
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="w-full h-10 p-button border border-editButton rounded-button bg-editButton text-loginText flex items-center justify-center gap-2"
              onClick={handleClose}
            >
              <LogInIcon size={18} />
              로그인
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
