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
            if (window.innerWidth >= 1536) {
                setMobileNavVisible(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            {/* Header */}
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
                    </div>
                </div>
            </div>
            <MobileNavBar isOpen={isMobileNavVisible} onClose={toggleMobileNav} />
        </>
    );
}
