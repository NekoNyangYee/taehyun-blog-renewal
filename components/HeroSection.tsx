"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePostStore } from "@components/store/postStore";

const formatMetric = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
};

export default function HeroSection() {
  const { posts } = usePostStore();

  const { totalPosts, totalLikes, totalViews } = useMemo(() => {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + (p.like_count ?? 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + (p.view_count ?? 0), 0);
    return { totalPosts, totalLikes, totalViews };
  }, [posts]);

  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
      {/* subtle grid + glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(248,113,113,0.16),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(52,211,153,0.14),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:26px_26px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-5xl gap-9 px-5 py-10 md:grid-cols-[1.3fr_1fr] md:px-8 md:py-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              TaeHyun의 Devlog
            </h1>
            <p className="text-base leading-relaxed text-slate-100/80 md:text-lg">
              대학생 프론트엔드 개발자로서의 배움과 실험을 기록합니다. 스터디와
              프로젝트에서 건진 인사이트 같은 개발 정보를 함께 나눌게요.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-100/80">
            {["React", "Next.js", "TypeScript", "UI/UX", "CS", "Devlog"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "포스트", value: formatMetric(totalPosts) },
              { label: "좋아요", value: formatMetric(totalLikes) },
              { label: "조회수", value: formatMetric(totalViews) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/5 px-4 py-3 text-center ring-1 ring-white/10"
              >
                <div className="text-2xl font-bold text-white">
                  {item.value}
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-100/70">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div
            className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-sky-400/40 via-emerald-300/30 to-purple-400/30 blur-3xl"
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100 ring-1 ring-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                대학생 프론트엔드 여정과 기록
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-white/60">
                <Image
                  src="/profile.webp"
                  alt="태현 프로필"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-100/70">
                  Frontend Engineer
                </span>
                <span className="text-xl font-semibold text-white">
                  TaeHyun Kim
                </span>
                <p className="text-sm text-slate-100/80">
                  React · Next.js · TypeScript
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
