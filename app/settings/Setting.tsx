"use client";

import NavBar from "@components/components/NavBar";

export default function SettingPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex pt-[65px] max-w-[90rem] mx-auto w-full">
                <NavBar />
                <div className="p-container">
                    설정임
                </div>
            </div>
        </div>
    );
}