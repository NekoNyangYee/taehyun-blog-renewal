"use client";

import { useState } from "react";
import Image from "next/image";
import GitHubCalendar from "react-github-calendar";
import dayjs from "dayjs";

export default function ProfileDetailPage() {
  const [profile] = useState({
    name: "김태현",
    username: "NekoNyangYee",
    email: "kth08122570@gmail.com",
    github: "https://github.com/NekoNyangYee",
    description: "안녕하세요! 프론트엔드 개발자 김태현입니다.",
    stacks: [
      { name: "React", bgcolor: "33302E", logocolor: "61DAFB" },
      { name: "JavaScript", bgcolor: "F7DF1E", logocolor: "000000" },
      { name: "TypeScript", bgcolor: "3178C6", logocolor: "FFFFFF" },
      { name: "Next.js", bgcolor: "000000", logocolor: "FFFFFF" },
      { name: "TailwindCSS", bgcolor: "06B6D4", logocolor: "FFFFFF" },
      { name: "Zustand", bgcolor: "3178C6", logocolor: "FFFFFF" },
      { name: "Vercel", bgcolor: "000000", logocolor: "FFFFFF" },
      { name: "shadcnui", bgcolor: "000000", logocolor: "FFFFFF" },
      { name: "git", bgcolor: "F05032", logocolor: "FFFFFF" },
    ],
    education: [
      { school: "청석고등학교", period: "2018 ~ 2021 졸업" },
      { school: "청주대학교 디지털보안학과", period: "2021. 3 ~ 현재 재학 중" },
    ],
    career: [
      {
        company: "청주대학교 디지털보안학과 연구실",
        period: "2024. 11 ~ 현재",
      },
      {
        company: "청주대학교 창업동아리",
        period: "2025. 04 ~ 현재",
      },
    ],
  });

  const transformData = (
    contributions: { date: string; count: number; level: number }[]
  ) => {
    return contributions.map((activity) => ({
      date: dayjs(activity.date).format("YYYY-MM-DD"),
      count: activity.count,
      level: Math.min(4, Math.max(0, activity.level)) as 0 | 1 | 2 | 3 | 4,
    }));
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 bg-background z-0">
      <div className="relative w-full h-[500px] bg-center bg-cover bg-no-repeat bg-[url('/profile.jpg')]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white z-10" />
        <div className="relative z-20 w-full h-full flex items-end justify-start p-8">
          <div className="text-gray-800 space-y-2">
            <h1 className="text-4xl font-bold">{profile.name}</h1>
            <p className="text-lg">{profile.description}</p>
            <div className="flex flex-wrap gap-4 mt-2">
              <a
                href={`mailto:${profile.email}`}
                className="px-4 py-2 border border-gray-800 rounded-md hover:bg-gray-800 hover:text-white transition"
              >
                {profile.email}
              </a>
              <a
                href={profile.github}
                className="px-4 py-2 border border-gray-800 rounded-md hover:bg-gray-800 hover:text-white transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="p-container border border-containerColor rounded-container mx-4">
        <h2 className="text-xl font-semibold mb-4">기술 스택</h2>
        <div className="flex flex-wrap gap-2">
          {profile.stacks.map((stack, index) => (
            <img
              key={index}
              src={`https://img.shields.io/badge/${stack.name}-${stack.bgcolor}?style=for-the-badge&logo=${stack.name}&logoColor=${stack.logocolor}`}
              alt={stack.name}
              className={`rounded-md`}
            />
          ))}
        </div>
      </div>

      {/* GitHub Calendar */}
      <div className="p-container border border-containerColor rounded-container mx-4">
        <h2 className="text-xl font-semibold">깃허브 컨트리뷰션</h2>
        <div className="w-full flex flex-col items-center">
          <div className="w-full overflow-x-auto">
            <GitHubCalendar
              username={profile.username}
              transformData={transformData}
              colorScheme="light"
              theme={{
                light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
              }}
              hideColorLegend
              hideTotalCount={false}
              hideMonthLabels={false}
              showWeekdayLabels
              labels={{
                totalCount: `${profile?.name}님은 {{count}}번 잔디를 심었습니다! 🌱`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 학력 */}
      <div className="flex max-md:flex-col gap-4 mx-4">
        <div className="w-full p-container border border-containerColor rounded-container mb-4">
          <h2 className="text-xl font-semibold mb-4">학력</h2>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-white text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold">{edu.school}</p>
                  <p className="text-sm text-gray-600">{edu.period}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full p-container border border-containerColor rounded-container mb-4">
          <h2 className="text-xl font-semibold mb-4">활동</h2>
          <div className="space-y-4">
            {profile.career.map((job, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-white text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold">{job.company}</p>
                  <p className="text-sm text-gray-600">{job.period}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
