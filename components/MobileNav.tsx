"use client";

import { useCategoriesStore } from "@components/store/categoriesStore";
import { Grid2X2Icon, HomeIcon, LogOutIcon, SettingsIcon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import Image from "next/image";

export default function MobileNavBar({ onClose }: { onClose: () => void }) {
    const currentPath: string = usePathname();
    const { fetchCategories } = useCategoriesStore();
    const { session, addSession } = useSessionStore();
    const [profileName, setProfileName] = useState<string>("");

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.id) return; // session이 없을 경우 실행하지 않음

            const { data, error } = await supabase
                .from("profiles")
                .select("nickname")
                .eq("id", session.user.id)
                .single(); // 첫 번째 데이터만 가져오도록 개선

            if (error) {
                console.error("프로필 가져오기 에러:", error);
                return;
            }

            if (data?.nickname) {
                setProfileName(data.nickname);
            }
        };

        fetchProfile();
    }, [session]); // session이 변경될 때만 실행

    const handleLogout = async () => {
        alert("로그아웃 되었습니다.");
        await supabase.auth.signOut();
        addSession(null);
    };

    const isActive = (path: string) =>
        currentPath === path || (path === "/posts" && currentPath.startsWith("/posts"))
            ? "bg-black text-white font-semibold"
            : "bg-transparent text-gray-700 hover:bg-gray-100";

    return (
        <>
            <aside
                className="fixed top-0 left-0 pt-[65px] w-full h-full bg-white flex flex-col justify-between items-center gap-2 z-10 transition-transform transform"
            >
                <div className="p-container w-full flex flex-col">
                    <Link href={"/"} className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive("/")}`} onClick={onClose}>
                        <HomeIcon size={18} />
                        <span className="truncate">홈</span>
                    </Link>
                    <Link href="/posts" className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive("/posts")}`} onClick={onClose}>
                        <Grid2X2Icon size={18} />
                        <span className="truncate">게시물</span>
                    </Link>
                    <Link href={"/settings"} className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive("/settings")}`} onClick={onClose}>
                        <SettingsIcon size={18} />
                        <span className="truncate">설정</span>
                    </Link>
                </div>
                <div className="flex flex-col gap-2 w-full p-container border-t border-containerColor items-center">
                    {session ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="object-cover w-10 h-10 rounded-full overflow-hidden">
                                    <Image
                                        src={session.user?.user_metadata?.avatar_url || ""}
                                        width={48}
                                        height={48}
                                        alt="Profile"
                                        className="rounded-full"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-lg font-semibold">{profileName || "닉네임 없음"}</p>
                                    <span className="text-sm text-gray-600">{session.user?.email}</span>
                                </div>
                            </div>
                            <Button onClick={handleLogout} className="w-full h-10 p-button border border-logoutColor bg-logoutButton text-logoutText flex items-center gap-2">
                                <LogOutIcon size={18} />
                                로그아웃
                            </Button>
                        </>
                    ) : (
                        <Link href="/login" className="w-full h-10 p-button border border-editButton rounded-button bg-editButton text-loginText flex items-center justify-center gap-2" onClick={onClose}>
                            <LogInIcon size={18} />
                            로그인
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}
