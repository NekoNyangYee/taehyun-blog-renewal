"use client";

import LogoIcon from "@components/components/icons/LogoIcon";
import { Button } from "@components/components/ui/button";
import { supabase } from "@components/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function LoginDetailPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSocialLogin = async (provider: "google" | "kakao") => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider });
            if (error) {
                alert("로그인 실패하였어요. 다시 시도해주세요.");
            }
        } catch (error) {
            alert("로그인 시도 중 문제가 발생하였어요. 다시 시도해주세요.");
            console.log(error);
        }
    };

    const hasUserSession = useCallback(async () => {
        try {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.log("세션을 가져오는 중 문제가 발생하였어요.", error);
                return;
            }

            if (data.session) {
                router.push("/");
            }
        } catch (error) {
            console.log(error);
        }
    }, [router]);

    useEffect(() => {
        hasUserSession();
    }, [hasUserSession]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center h-screen bg-white">
                <div className="w-12 h-12 border-t-2 border-b-2 border-gray-600 rounded-full animate-spin"></div>
                <p className="text-metricsText">로그인 시도하는 중...</p>
            </div>
        );
    }
    return (
        <div className="flex justify-center w-full min-h-screen px-4">
            <div className="flex flex-col gap-4 border border-containerColor p-container h-auto my-auto rounded-container max-w-lg w-full md:max-w-[562px]">
                <div className="flex flex-col items-center">
                    <LogoIcon />
                    <h1 className="text-mainTitle">Welcome to visit my Devlog!</h1>
                    <label className="text-metricsText">로그인 하여 여러분의 첫 공감 및 댓글을 남겨보세요!</label>
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        className="flex justify-center gap-2 border border-slate-containerColor bg-google p-button rounded-button"
                        onClick={() => handleSocialLogin("google")}
                    >
                        <Image src="/google-logo.png" alt="google" width={24} height={24} />
                        구글 로그인
                    </Button>
                    <Button
                        className="flex justify-center gap-2 bg-kakao p-button rounded-button"
                        onClick={() => handleSocialLogin("kakao")}
                    >
                        <Image src="/kakao-logo.png" alt="google" width={24} height={24} />
                        카카오 로그인
                    </Button>
                </div>
            </div>
        </div>
    );
}