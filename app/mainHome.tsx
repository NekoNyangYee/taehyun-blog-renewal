"use client";

import { addUserToProfileTable } from "@components/lib/loginUtils";
import { supabase } from "@components/lib/supabaseClient";
import { EyeIcon } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function MainHome() {
    useEffect(() => {
        const addUser = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error("세션 가져오기 에러:", error);
                return;
            }

            if (data.session) {
                const userSessionData = {
                    id: data.session.user.id,
                    nickname: data.session.user.user_metadata.full_name || "",
                    profile: data.session.user.user_metadata.avatar_url || "",
                    email: data.session.user.email,
                };
                await addUserToProfileTable(userSessionData);
                console.log("유저 추가 완료");
            }

        }

        addUser();
    }, []);

    return (
        <div className="p-container">
            <h2 className="text-2xl font-bold mb-4">📢 최신 게시물</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 게시물 1 */}
                <div className="bg-white shadow-md rounded-lg p-4 flex gap-4 items-center border border-gray-200">
                    <Image
                        src="/nextjs.jpg"
                        width={64}
                        height={64}
                        alt="NextJS 이미지"
                        className="rounded-lg object-cover"
                    />
                    <div className="flex flex-col flex-1">
                        <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                            NextJS
                        </span>
                        <span className="text-lg font-semibold mt-2">
                            🚀 Next.js 블로그 프로젝트 구축하기
                        </span>
                        <p className="text-sm text-gray-600">
                            by 태현 · 작성일: 2025년 02월 04일
                        </p>
                        <div className="flex gap-1 items-center text-gray-500 text-sm mt-1">
                            <EyeIcon size={16} />
                            230 조회
                        </div>
                    </div>
                </div>

                {/* 게시물 2 */}
                <div className="bg-white shadow-md rounded-lg p-4 flex gap-4 items-center border border-gray-200">
                    <Image
                        src="/typescript.jpg"
                        width={64}
                        height={64}
                        alt="TypeScript 이미지"
                        className="rounded-lg object-cover"
                    />
                    <div className="flex flex-col flex-1">
                        <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                            TypeScript
                        </span>
                        <span className="text-lg font-semibold mt-2">
                            ⚡ TypeScript 핵심 문법 정리
                        </span>
                        <p className="text-sm text-gray-600">
                            by 김개발 · 작성일: 2025년 01월 15일
                        </p>
                        <div className="flex gap-1 items-center text-gray-500 text-sm mt-1">
                            <EyeIcon size={16} />
                            180 조회
                        </div>
                    </div>
                </div>

                {/* 게시물 3 */}
                <div className="bg-white shadow-md rounded-lg p-4 flex gap-4 items-center border border-gray-200">
                    <Image
                        src="/react.jpg"
                        width={64}
                        height={64}
                        alt="React 이미지"
                        className="rounded-lg object-cover"
                    />
                    <div className="flex flex-col flex-1">
                        <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                            React
                        </span>
                        <span className="text-lg font-semibold mt-2">
                            🔥 React 상태 관리 비교 (Redux vs Zustand)
                        </span>
                        <p className="text-sm text-gray-600">
                            by 이리액트 · 작성일: 2025년 01월 10일
                        </p>
                        <div className="flex gap-1 items-center text-gray-500 text-sm mt-1">
                            <EyeIcon size={16} />
                            310 조회
                        </div>
                    </div>
                </div>

                {/* 게시물 4 */}
                <div className="bg-white shadow-md rounded-lg p-4 flex gap-4 items-center border border-gray-200">
                    <Image
                        src="/tailwind.jpg"
                        width={64}
                        height={64}
                        alt="Tailwind 이미지"
                        className="rounded-lg object-cover"
                    />
                    <div className="flex flex-col flex-1">
                        <span className="bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                            CSS
                        </span>
                        <span className="text-lg font-semibold mt-2">
                            🎨 Tailwind CSS 활용법 정리
                        </span>
                        <p className="text-sm text-gray-600">
                            by 박UI · 작성일: 2025년 01월 05일
                        </p>
                        <div className="flex gap-1 items-center text-gray-500 text-sm mt-1">
                            <EyeIcon size={16} />
                            145 조회
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
