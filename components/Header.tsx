"use client";

import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import LogoIcon from "./icons/LogoIcon";
import { MenuIcon, XIcon } from "lucide-react";
import MobileNavBar from "./MobileNav";

export default function Header() {
    const { session, addSession } = useSessionStore();
    const [isMobileNavVisible, setMobileNavVisible] = useState(false);

    const toggleMobileNav = () => {
        setMobileNavVisible(!isMobileNavVisible);
    };

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

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1536) {
                setMobileNavVisible(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            <div className="w-full border-b border-containerColor bg-background fixed top-0 bg-white/70 backdrop-blur-md z-50">
                <div className="max-w-[90rem] mx-auto flex justify-between items-center px-container h-[65px]">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <LogoIcon />
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {session && (
                            <>
                                <p className="text-sm max-xl:hidden"><strong className="text-blue-500">{session?.user.user_metadata.full_name || "Unknown"}</strong> 님 환영합니다.</p>
                                <div className="object-cover w-8 h-8 rounded-full overflow-hidden">
                                    <Image
                                        src={session.user?.user_metadata.avatar_url || ""}
                                        alt="profile"
                                        width={32}
                                        height={32}
                                    />
                                </div>
                            </>
                        )}
                        <button onClick={toggleMobileNav} className="2xl:hidden">
                            {isMobileNavVisible ? <XIcon size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            <MobileNavBar isOpen={isMobileNavVisible} onClose={toggleMobileNav} />
        </>
    );
}
