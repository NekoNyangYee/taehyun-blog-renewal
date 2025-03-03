"use client";

export default function PageLoading() {
    return (
        <div className="w-full flex flex-col gap-4 items-center justify-center h-screen bg-white">
            <div className="w-12 h-12 border-t-2 border-b-2 border-gray-600 rounded-full animate-spin"></div>
            <p className="text-metricsText">페이지 불러오는중...</p>
        </div>
    )
};