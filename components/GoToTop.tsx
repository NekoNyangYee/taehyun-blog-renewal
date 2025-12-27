"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function GotoTop() {
  const [currentHeight, setCurrentHeight] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setCurrentHeight(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    if (isDisabled) return;
    setIsDisabled(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsDisabled(false), 1000);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`fixed bottom-8 right-8 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 ${
          currentHeight ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Go to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}
