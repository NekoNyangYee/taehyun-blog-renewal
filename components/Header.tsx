"use client";

import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import LogoIcon from "./icons/LogoIcon";
import { usePathname } from "next/navigation";
import MobileNavBar from "./MobileNav";
import { MenuIcon, XIcon } from "lucide-react";

export default function Header() {
    const currentPath: string = usePathname();

    const { addSession } = useSessionStore();
    const session = useSessionStore((state) => state.session);

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
            if (window.innerWidth >= 1536) { // 2xl breakpoint
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
                        <button onClick={toggleMobileNav} className="2xl:hidden">
                            {isMobileNavVisible ? <XIcon size={24} /> : <MenuIcon size={24} />}
                        </button>
                        {session && (
                            <div className="object-cover w-8 h-8 rounded-full overflow-hidden">
                                <Image
                                    src={session.user?.user_metadata.avatar_url || ""}
                                    width={32}
                                    height={32}
                                    alt="profile image"
                                    className="rounded-full"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={`fixed inset-0 z-40 transition-transform transform ${isMobileNavVisible ? "translate-y-0" : "-translate-y-full"}`}>
                <MobileNavBar onClose={toggleMobileNav} />
            </div>
        </>
    );
}
