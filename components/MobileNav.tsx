"use client";

import { useCategoriesStore } from "@components/store/categoriesStore";
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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import Image from "next/image";

export default function MobileNavBar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const currentPath: string = usePathname();
  const router = useRouter();
  const { fetchCategories } = useCategoriesStore();
  const { session, addSession } = useSessionStore();
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleLogout = async () => {
    alert("로그아웃 되었습니다.");
    await supabase.auth.signOut();
    addSession(null);
    router.push("/");
    onClose();
  };

  const isActive = (path: string) =>
    currentPath === path ||
    (path === "/posts" && currentPath.startsWith("/posts"))
      ? "bg-black text-white font-semibold"
      : "bg-transparent text-gray-700 hover:bg-gray-100";

  return (
    <>
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-md z-30"
          onClick={onClose}
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 pt-16 w-[70%] max-w-[300px] h-full bg-white flex flex-col justify-between items-center gap-2 z-40 shadow-lg transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 m-4 bg-white shadow-none rounded-full"
        >
          <XIcon size={24} />
        </button>
        <div className="p-container w-full flex flex-col">
          <Link
            href={"/"}
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/"
            )}`}
            onClick={onClose}
          >
            <HomeIcon size={18} />
            <span className="truncate">홈</span>
          </Link>
          <Link
            href="/posts"
            className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
              "/posts"
            )}`}
            onClick={onClose}
          >
            <Grid2X2Icon size={18} />
            <span className="truncate">게시물</span>
          </Link>
          {session && (
            <Link
              href={"/bookmarks"}
              className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive(
                "/bookmarks"
              )}`}
              onClick={onClose}
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
            onClick={onClose}
          >
            <HandIcon size={18} />
            <span className="truncate">안녕하세요!</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2 w-full p-container border-t border-containerColor items-center">
          {session ? (
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
              onClick={onClose}
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
