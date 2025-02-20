"use client";

import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import LogoIcon from "./icons/LogoIcon";
import { usePathname } from "next/navigation";

export default function Header() {
    const currentPath: string = usePathname();

    const { addSession } = useSessionStore();
    const session = useSessionStore((state) => state.session);

    useEffect(() => {
        const fetchSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (data.session) {
                addSession(data.session);
            } else {
                addSession(null);
            }

            if (error) {
                console.log(error);
            }
        };

        fetchSession();
    }, []);

    const logoutHandler = async () => {
        alert("로그아웃 되었습니다.");
        await supabase.auth.signOut();
        addSession(null);
        console.log("Session after logout:", session);
    };

    return (
        <div className="w-full border-b border-containerColor bg-background fixed top-0 bg-white/70 backdrop-blur-md">
            <div className="max-w-[90rem] mx-auto flex justify-between items-center px-container h-[65px]">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <LogoIcon />
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <Image
                                src={session.user?.user_metadata.avatar_url || ""}
                                width={32}
                                height={32}
                                alt="profile image"
                                className="rounded-full"
                            />
                            <Button onClick={logoutHandler} className="border border-logoutColor p-button">
                                로그아웃
                            </Button>
                        </>
                    ) : (
                        <>
                            {currentPath !== "/login" && (
                                <Link
                                    href="/login"
                                    className="text-black"
                                >
                                    로그인
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
