"use client";

export default function HeroSection() {
  return (
    <blockquote>
      <div className="flex max-md:flex-col-reverse gap-2 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">TaeHyun의 Devlog</h1>
          <p className="text-gray-700 mb-2">
            기술의 일상, 그리고 성장의 흔적을 기록하는 공간입니다.
          </p>
        </div>

        {/* 오른쪽: 프로필 */}
        <div className="flex flex-col items-center md:items-end text-sm">
          <img
            src="/profile.jpg"
            alt="태현 프로필"
            className="w-36 h-36 object-cover mask-blob"
          />
        </div>
      </div>
    </blockquote>
  );
}
