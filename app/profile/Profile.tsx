"use client";

import { useState } from "react";
import Image from "next/image";

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
            { name: "TailwindCSS", color: "bg-teal-400 text-white" },
            { name: "Zustand", color: "bg-purple-600 text-white" },
            { name: "Express.js", color: "bg-gray-900 text-white" },
            { name: "Supabase", color: "bg-green-500 text-white" },
        ],
        education: [
            { school: "청석고등학교", period: "2018 ~ 2020 졸업" },
            { school: "청주대학교", period: "2021. 3 ~ 현재 재학 중" },
        ],
    });

    return (
        <div className="w-full h-full flex flex-col gap-4 bg-background p-container">
            <div className="flex flex-col items-center justify-center p-8">
                <div className="w-40 h-40 rounded-full overflow-hidden">
                    <Image
                        src="/profile.jpg"
                        alt="Profile Picture"
                        width={160}
                        height={160}
                        className="object-cover"
                    />
                </div>
                <h1 className="mt-4 text-2xl font-bold">{profile.name}</h1>
                <p className="text-sm text-gray-600">{profile.username}</p>
                <p className="mt-2 text-base text-center">{profile.description}</p>
                <div className="mt-4 flex gap-4">
                    <a href={`mailto:${profile.email}`} className="text-blue-500 underline">
                        {profile.email}
                    </a>
                    <a href={profile.github} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                </div>
            </div>

            <div className="p-container border border-containerColor rounded-container">
                <h2 className="text-xl font-semibold mb-4">기술 스택</h2>
                <div className="flex flex-wrap gap-2">
                    {profile.stacks.map((stack, index) => (
                        <span key={index} className={`px-4 py-2 text-sm font-medium rounded-lg ${stack.color}`}>
                            {stack.name}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-container border border-containerColor rounded-container">
                <h2 className="text-xl font-semibold mb-4">깃허브</h2>
                <h3>컨트리뷰션</h3>
                <div className="w-full p-container">
                    <a href={profile.github} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                        <img src="https://ghchart.rshah.org/196127/NekoNyangYee" className="w-full h-full px-3" />
                    </a>
                </div>
            </div>

            <div className="p-container border border-containerColor rounded-container">
                <h2 className="text-xl font-semibold mb-4">학력</h2>
                <ul>
                    {profile.education.map((edu, index) => (
                        <li key={index} className="mb-2">
                            <p className="font-bold">{edu.school}</p>
                            <p className="text-sm text-gray-600">{edu.period}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
