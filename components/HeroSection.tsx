"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full py-16 px-4 md:px-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 overflow-hidden rounded-lg">
      {/* 배경 데코 */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <svg width="100%" height="100%" className="opacity-20" style={{position:'absolute',top:0,left:0}}>
          <circle cx="80%" cy="20%" r="180" fill="#a5b4fc" />
          <circle cx="10%" cy="80%" r="120" fill="#fbcfe8" />
        </svg>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
        {/* 왼쪽: 텍스트 */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900/90 mb-3 drop-shadow-sm tracking-tight leading-tight">
            TaeHyun의 Devlog
          </h1>
          <p className="text-base md:text-lg text-gray-700/80 font-medium mb-1 leading-relaxed">
            기술의 일상, 그리고 성장의 흔적을 기록하는 공간입니다.
          </p>
          <p className="text-base md:text-lg text-blue-600/90 font-semibold italic mb-4 leading-relaxed">
            프론트엔드 개발자로서의 여정과 배움을 공유합니다.
          </p>
        </div>
        {/* 오른쪽: 프로필 */}
        <div className="flex flex-col items-center md:items-end">
          <div className="relative group">
            <img
              src="/profile.jpg"
              alt="태현 프로필"
              className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
