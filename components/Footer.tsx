import React from "react";
import LogoIcon from "./icons/LogoIcon";

const GITHUB_URL = "https://github.com/kth08"; // 깃허브 주소는 필요시 수정
const EMAIL = "mailto:kth08.dev@gmail.com"; // 이메일 주소는 필요시 수정

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 mt-auto py-6 px-4 flex flex-col items-center text-gray-700 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <LogoIcon />
        <span className="font-bold text-base">TaeHyun's Devlog</span>
      </div>
      <p className="mb-2 text-center max-w-xl">
        개발과 성장의 기록을 남기는 블로그입니다. <br className="sm:hidden" />
        다양한 개발 지식과 경험을 공유합니다.
      </p>
      <div className="flex gap-4 mb-2">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <img src="/github.svg" alt="GitHub" className="w-6 h-6 hover:opacity-70 transition" />
        </a>
        <a href={EMAIL} aria-label="Email">
          <svg className="w-6 h-6 hover:opacity-70 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </a>
      </div>
      <div className="text-xs text-gray-500 text-center">
        &copy; 2025 TaeHyun-Devlog. All rights reserved.
      </div>
    </footer>
  );
}
