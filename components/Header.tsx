"use client";

import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import Link from "next/link";
import { useEffect } from "react";
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

    return (
        <div className="w-full border-b border-containerColor bg-background fixed top-0 bg-white/70 backdrop-blur-md z-30">
            <div className="max-w-[90rem] mx-auto flex justify-between items-center px-container h-[65px]">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <LogoIcon />
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="object-cover w-8 h-8 rounded-full overflow-hidden">
                            <Image
                                src={session.user?.user_metadata.avatar_url || ""}
                                width={32}
                                height={32}
                                alt="profile image"
                                className="rounded-full"
                            />
                        </div>
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
