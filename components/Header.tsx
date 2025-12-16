"use client";

import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon, ArrowLeft } from "lucide-react";
import LogoIcon from "./icons/LogoIcon";
import MobileNavBar from "./MobileNav";
import ScrollProgressBar from "./ScrollProgressBar";
import SearchBar from "./SearchBar";

export default function Header() {
  const currentPath = usePathname();
  const { addSession } = useSessionStore();
  const [isMobileNavVisible, setMobileNavVisible] = useState(false);

  const toggleMobileNav = () => {
    setMobileNavVisible(!isMobileNavVisible);
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("세션 가져오기 에러:", error);
        return;
      }

      addSession(data.session || null);
    };

    const handleResize = () => {
      if (window.innerWidth >= 1536) {
        setMobileNavVisible(false);
      }
    };

    fetchSession();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [addSession]);

  if (currentPath === "/login") return null;

  return (
    <>
      <div className="w-full border-b border-containerColor fixed top-0 bg-white/70 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-[65px]">
          <Link href="/">
            <LogoIcon />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/NekoNyangYee"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/github.svg" alt="GitHub" width={32} height={32} />
            </Link>
            <SearchBar />
            <button onClick={toggleMobileNav} className="2xl:hidden">
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </div>
      <MobileNavBar isOpen={isMobileNavVisible} onClose={toggleMobileNav} />
      <ScrollProgressBar />
    </>
  );
}
