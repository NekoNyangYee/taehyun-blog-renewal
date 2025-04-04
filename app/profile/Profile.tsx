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
      { name: "React", color: "bg-blue-400 text-white" },
      { name: "TypeScript", color: "bg-blue-600 text-white" },
      { name: "Next.js", color: "bg-black text-white" },
      { name: "Styled-Components", color: "bg-pink-400 text-white" },
      { name: "Emotion", color: "bg-pink-400 text-white" },
      { name: "TailwindCSS", color: "bg-teal-400 text-white" },
      { name: "Zustand", color: "bg-purple-600 text-white" },
      { name: "Vercel", color: "bg-black text-white" },
      { name: "ShadCn-UI", color: "bg-black text-white" },
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
        company: "청주대학교 창업동아리 trycatch",
        period: "2025. 04 ~ 현재",
      },
    ],
  });

  const transformData = (
    contributions: { date: string; count: number; level: number }[]
  ) => {
    return contributions.map((activity) => ({
      date: dayjs(activity.date).format("YYYY-MM-DD"), // dayjs로 날짜 변환
      count: activity.count,
      level: Math.min(4, Math.max(0, activity.level)) as 0 | 1 | 2 | 3 | 4, // 타입 보장
    }));
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 bg-background p-container">
      <div className="flex flex-col lg:flex-row items-center justify-between p-8 gap-6">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-300 shadow-md">
          <Image
            src="/profile.jpg"
            alt="Profile Picture"
            width={160}
            height={160}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 space-y-3">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-sm text-gray-500">@{profile.username}</p>
          <p className="text-base text-gray-700">{profile.description}</p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-2">
            <a
              href={`mailto:${profile.email}`}
              className="p-button border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition"
            >
              {profile.email}
            </a>
            <a
              href={profile.github}
              className="p-button border border-gray-700 text-gray-700 rounded-md hover:bg-gray-700 hover:text-white transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="p-container border border-containerColor rounded-container">
        <h2 className="text-xl font-semibold mb-4">기술 스택</h2>
        <div className="flex flex-wrap gap-2">
          {profile.stacks.map((stack, index) => (
            <span
              key={index}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${stack.color}`}
            >
              {stack.name}
            </span>
          ))}
        </div>
      </div>
      <div className="p-container border border-containerColor rounded-container flex flex-col gap-2">
        <h2 className="text-xl font-semibold">깃허브 컨트리뷰션</h2>
        <div className="w-full flex flex-col items-center">
          <div className="w-full">
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
      <div className="p-container border border-containerColor rounded-container">
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
      <div className="p-container border border-containerColor rounded-container">
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
  );
}
