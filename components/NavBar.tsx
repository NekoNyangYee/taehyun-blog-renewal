"use client";

import { useCategoriesStore } from "@components/store/categoriesStore";
import { Grid2X2Icon, HomeIcon, LogOutIcon, SettingsIcon, LogInIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";

export default function NavBar() {
    const currentPath: string = usePathname();
    const { myCategories, fetchCategories } = useCategoriesStore();
    const { session, addSession } = useSessionStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleLogout = async () => {
        alert("로그아웃 되었습니다.");
        await supabase.auth.signOut();
        addSession(null);
        console.log("Session after logout:", session);
    };

    const isActive = (path: string) =>
        currentPath === path || (path === "/posts" && currentPath.startsWith("/posts"))
            ? "bg-black text-white font-semibold"
            : "bg-transparent text-gray-700 hover:bg-gray-100";

    return (
        <>
            {currentPath !== "/login" && (
                <aside
                    className="sticky left-0 top-[65px] h-[calc(100vh-65px)] bg-white flex flex-col justify-between gap-2 z-0 max-2xl:hidden"
                >
                    <div className="p-container w-60 flex flex-col">
                        <Link href={"/"} className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive("/")}`}>
                            <HomeIcon size={18} />
                            <span className="truncate">홈</span>
                        </Link>
                        <Link href="/posts" className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive("/posts")}`}>
                            <Grid2X2Icon size={18} />
                            <span className="truncate">게시물</span>
                        </Link>
                        <Link href={"/profile"} className={`flex gap-2 items-center p-button justify-start rounded-button w-full h-10 ${isActive("/profile")}`}>
                            <InfoIcon size={18} />
                            <span className="truncate">프로필</span>
                        </Link>
                    </div>
                    <div className="w-full p-container border-t border-containerColor">
                        {session ? (
                            <Button onClick={handleLogout} className="w-full h-10 p-button border border-logoutColor bg-logoutButton text-logoutText flex items-center gap-2">
                                <LogOutIcon size={18} />
                                로그아웃
                            </Button>
                        ) : (
                            <Link href="/login" className="w-full h-10 p-button border border-editButton rounded-button bg-editButton text-loginText flex items-center justify-center gap-2">
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
