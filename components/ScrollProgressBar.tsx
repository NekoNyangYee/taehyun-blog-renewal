"use client";

import { usePathname } from "next/navigation";
import React, { CSSProperties, useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const currentPath = usePathname();

  useEffect(() => {
    const handleClientScrollBar = () => {
      const { documentElement } = document;
      const { scrollHeight, clientHeight } = documentElement;

      const totalHeight = scrollHeight - clientHeight;
      const scrolledHeight = window.scrollY;
      const progress =
        totalHeight > 0 ? (scrolledHeight / totalHeight) * 100 : 0;

      setScrollProgress(progress);
    };

    // 초기 상태를 0으로 설정
    setScrollProgress(0);
    window.addEventListener("scroll", handleClientScrollBar);

    return () => window.removeEventListener("scroll", handleClientScrollBar);
  }, []);

  const shouldShowProgressBar = /^\/posts\/[^\/]+\/\d+$/.test(currentPath);

  return shouldShowProgressBar ? (
    <div className="fixed top-0 left-0 w-full h-1 z-20">
      <div
        className="h-1 bg-black"
        style={{ width: `${scrollProgress}%` } as CSSProperties}
      />
    </div>
  ) : null;
}
